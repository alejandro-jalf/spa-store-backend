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

    const GetSalesForDate = async (cadenaConexion = '', sucursal = '', fechaIni = '', fechaFin = '', dataBaseStart, union = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(30) = '${sucursal}';
                DECLARE @FechaInicial DATETIME = CAST('${fechaIni}' AS DATETIME);
                DECLARE @FechaFinal DATETIME = CAST('${fechaFin}' AS DATETIME);
                WITH VentasPorDocumento (Fecha, VentaTotal, CostoTotal, UnidadesTotales)
                AS (
                    SELECT
                        Fecha,
                        VentaTotal = SUM(VentaValorNeta),
                        CostoTotal = SUM(CostoValorNeto),
                        UnidadesTotales = COUNT(*)
                    FROM ${dataBaseStart}.dbo.QVDEMovAlmacen
                    WHERE (Fecha BETWEEN @FechaInicial AND @FechaFinal)
                        AND TipoDocumento = 'V'
                        AND Estatus = 'E'
                    GROUP BY Fecha, Documento

                    ${union}
                )

                SELECT
                    Sucursal = @Sucursal,
                    Fecha,
                    VentaTotal = SUM(VentaTotal),
                    CostoTotal = SUM(CostoTotal),
                    UtilidadTotal = SUM(VentaTotal) - SUM(CostoTotal),
                    UtilidadPorcentual = 1 - (SUM(CostoTotal) / SUM(VentaTotal)),
                    UnidadesVendidas = SUM(UnidadesTotales),
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

    const getReplacementsBuys = async (cadenaConexion = '', sucursal = '', dataBase = '', FechaCorte = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${dataBase};
                DECLARE @Sucursal NVARCHAR(30) = '${sucursal}';
                DECLARE @FechaCorte DATETIME = CAST('${FechaCorte}' AS datetime);
                SELECT
                    Consecutivo = RDC.Folio, Sucursal = BDC.Sucursal, Tipo = 'COMPRA', Deducible = RDC.Deducible, Nombre = BDC.Proveedor,RFC = '',
                    Documento = BDC.Documento, FechaDocumento = BDC.Fecha, FechaCorte = RDC.FechaCorte, Subtotal = BDC.Subtotal, Descuento = BDC.Descuento,
                    Ieps = BDC.Ieps, Iva = BDC.Iva, Total = BDC.Total, Observaciones = RDC.Observaciones, RDC.TipoDescuento, DocumentoDescuento = RDC.Documento,
                    ImporteDescuento = RDC.Importe, RDC.Pago
                FROM ReposicionesDigital.Compras AS RDC
                LEFT JOIN BitacoraDigital.Compras AS BDC ON BDC.Folio = RDC.Folio AND BDC.id = RDC.idCompra
                WHERE CAST(CONVERT(NVARCHAR(8),RDC.FechaCorte,112) AS DATETIME) = @FechaCorte
                    AND BDC.Sucursal = @Sucursal
                    AND NOT RDC.Observaciones='CANCELADO'
                ORDER BY Deducible ASC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultados de reposiciones de compras', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las reposiciones de compras',
                error
            );
        }
    }

    const getReplacementsBills = async (cadenaConexion = '', sucursal = '', dataBase = '', FechaCorte = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${dataBase};
                DECLARE @Sucursal NVARCHAR(30) = '${sucursal}';
                DECLARE @FechaCorte DATETIME = CAST('${FechaCorte}' AS datetime);
                SELECT
                    Consecutivo = RDG.Folio, Sucursal = RDG.Sucursal, Tipo = 'GASTO', Deducible = RDG.Deducible, Nombre = RDG.Tercero,RFC = '',
                    Documento = RDG.Documento, FechaDocumento = RDG.FechaDocumento, FechaCorte = RDG.FechaCorte, Subtotal = RDG.Subtotal, Ieps = RDG.Ieps,
                    Iva = RDG.Iva, Total = RDG.Total, Observaciones = RDG.Observaciones
                FROM ReposicionesDigital.Gastos AS RDG
                WHERE CAST(CONVERT(NVARCHAR(8),RDG.FechaCorte,112) AS DATETIME) = @FechaCorte
                    AND RDG.Sucursal = @Sucursal
                    AND NOT estatus='CANCELADO'
                ORDER BY Deducible ASC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultados de reposiciones de gastos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las reposiciones de gastos',
                error
            );
        }
    }

    const getBinnacleBuys = async (cadenaConexion = '', sucursal = '', dataBase = '', FechaCorte = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${dataBase};
                DECLARE @Sucursal NVARCHAR(30) = '${sucursal}';
                DECLARE @FechaCorte DATETIME = CAST('${FechaCorte}' AS datetime);
                SELECT
                    Consecutivo = BDC.Folio, Sucursal = BDC.Sucursal, Tipo = 'COMPRA', Nombre = BDC.Proveedor,RFC = '', Documento = BDC.Documento,
                    Fecha = BDC.Fecha, Subtotal = BDC.Subtotal, Descuento = BDC.Descuento, Ieps = BDC.Ieps, Iva = BDC.Iva, Total = BDC.Total
                FROM BitacoraDigital.Compras AS BDC
                WHERE CAST(CONVERT(NVARCHAR(8),BDC.Fecha,112) AS DATETIME) = @FechaCorte
                    AND BDC.Sucursal = @Sucursal
                    AND BDC.Estatus='A TIEMPO'
                ORDER BY Consecutivo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultados de bitacora de gastos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la bitacora de gastos',
                error
            );
        }
    }

    const getListCreditsCustomers = async (cadenaConexion = '', sucursal = '', dataBase = '', FechaCorte = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${dataBase};
                DECLARE @FechaCorte DATETIME = CAST('${FechaCorte}' AS datetime);
                SELECT DISTINCT
                    M.Fecha,FechaReferencia = CONVERT(NVARCHAR(8),M.Fecha,112),M.Documento,M.Tercero,M.NombreTercero,
                    P.FormaPago,FormaPagoDescripcion = UPPER(F.Descripcion),P.Pagado,P.Hora,P.Caja
                FROM QVDEMovAlmacen M
                LEFT JOIN PagosDia P ON P.Folio = M.Documento
                LEFT JOIN FormasPago F ON F.FormaPago = P.FormaPago
                WHERE M.TipoDocumento = 'V' AND M.Estatus = 'E'
                    AND LEN(M.Tercero) > 0
                    AND M.Tercero LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]'
                    AND M.Fecha = @FechaCorte
                    --AND M.Caja = @Caja
                ORDER BY P.Caja, P.Hora
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de creditos de trabajadores', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                `Fallo la conexion con base en ${sucursal} de datos al intentar obtener la lista de creditos de trabajadores`,
                error
            );
        }
    }

    const getVentasByFecha = async (cadenaConexion = '', sucursal = 'ZR', fechaIni = '', FechaFin = '', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB}
                DECLARE @FechaInicio DATETIME = CAST('${fechaIni}' AS DATETIME)
                DECLARE @FechaFinal DATETIME = CAST('${FechaFin}' AS DATETIME)

                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;
                
                SET LANGUAGE Español;

                SELECT
                    Suc = @Sucursal,
                    Mes,
                    Year = YEAR(Fecha),
                    MesMovimientoLetra,
                    Dia = DAY(Fecha),
                    Venta = SUM(VentaValorNeta)
                FROM QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E'
                    AND ( Fecha BETWEEN @FechaInicio AND @FechaFinal )
                GROUP BY Mes, MesMovimientoLetra, DAY(Fecha), YEAR(Fecha)
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener ventas de cocina',
                error
            );
        }
    }

    return {
        getInventoryByShopAndWarehouse,
        GetSalesForDate,
        getReplacementsBuys,
        getReplacementsBills,
        getBinnacleBuys,
        getListCreditsCustomers,
        getVentasByFecha,
    }
})();

module.exports = modelsReportes;
