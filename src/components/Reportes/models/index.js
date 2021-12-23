const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsReportes = (() => {
    const getInventoryByShopAndWarehouse = async (cadenaConexion = '', tienda = 0, almacen = 0) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Tienda INT = ${tienda};
                DECLARE @Almacen INT = ${almacen};

                SELECT
                    Almacen,
                    Tienda,
                    Articulo,
                    Nombre,
                    Existencia = ExistenciaActualRegular,
                    UltimoCosto,
                    UltimoCostoNeto,
                    IVA = CASE IvaTasaCompra WHEN 0 THEN 'E' WHEN 16 THEN 'G' END,
                    IEPS = CAST(IepsTasaCompra AS INT),
                    Valuacion = ExistenciaActualRegular * UltimoCosto,
                    IepsValuacion = (ExistenciaActualRegular * UltimoCosto) * (IepsTasaCompra / 100),
                    IvaValuacion = ((ExistenciaActualRegular * UltimoCosto) * (1 + (IepsTasaCompra / 100))) * (IvaTasaCompra / 100),
                    ValuacionNeta = ((ExistenciaActualRegular * UltimoCosto) * (1 + (IepsTasaCompra / 100))) * (1 + (IvaTasaCompra / 100))
                FROM QVExistencias
                WHERE Tienda = @Tienda AND Almacen = @Almacen
                    AND ExistenciaActualRegular > 0
                ORDER BY ValuacionNeta DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener inventario de cierre de año',
                error
            );
        }
    }

    return {
        getInventoryByShopAndWarehouse,
    }
})();

module.exports = modelsReportes;
