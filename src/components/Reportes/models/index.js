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

    const GetSalesForDate = async (cadenaConexion = '', sucursal = '', fechaIni = '', fechaFin = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(30) = '${sucursal}';
                DECLARE @FechaInicial DATETIME = CAST('${fechaIni}' AS DATETIME);
                DECLARE @FechaFinal DATETIME = CAST('${fechaFin}' AS DATETIME);
                WITH VentasPorDocumento (Fecha, VentaTotal, CostoTotal)
                AS (
                    SELECT
                        Fecha,
                        VentaTotal = SUM(VentaValorNeta),
                        CostoTotal = SUM(CostoValorNeto)
                    FROM QVDEMovAlmacen
                    WHERE (Fecha BETWEEN @FechaInicial AND @FechaFinal)
                        AND TipoDocumento = 'V'
                        AND Estatus = 'E'
                    GROUP BY Fecha, Documento
                )

                SELECT
                    Sucursal = @Sucursal,
                    Fecha,
                    VentaTotal = SUM(VentaTotal),
                    CostoTotal = SUM(CostoTotal),
                    UtilidadTotal = SUM(VentaTotal) - SUM(CostoTotal),
                    UtilidadPorcentual = 1 - (SUM(CostoTotal) / SUM(VentaTotal)),
                    TicketsTotales = COUNT(*),
                    MejorTicket = MAX(VentaTotal),
                    PeorTicket = MIN(VentaTotal),
                    TicketPromedio = AVG(VentaTotal)
                FROM VentasPorDocumento
                GROUP BY Fecha
                ORDER BY Fecha DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultados de ventas', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las ventas por dia',
                error
            );
        }
    }

    return {
        getInventoryByShopAndWarehouse,
        GetSalesForDate,
    }
})();

module.exports = modelsReportes;
