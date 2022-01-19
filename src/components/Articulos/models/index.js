const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsCocina = (() => {
    const getPrecio = async (cadenaConexion = '', sucursal = 'ZR', codigoBarrasArticulo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}'
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'OU' THEN 19 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'OU' THEN 5 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END

                SELECT 
                    Articulo,
                    CodigoBarras,
                    Nombre,
                    Descripcion,
                    Precio1IVAUV,
                    CantidadParaPrecio1,
                    Precio2IVAUV,
                    CantidadParaPrecio2,
                    Precio3IVAUV,
                    CantidadParaPrecio3
                FROM
                    QVListaprecioConCosto
                WHERE Tienda = @Tienda
                    AND Almacen = @Almacen
                    AND (CodigoBarras = '${codigoBarrasArticulo}' OR Articulo = '${codigoBarrasArticulo}');
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener precios',
                error
            );
        }
    }

    return {
        getPrecio,
    }
})();

module.exports = modelsCocina;
