const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError,
    getDeclareAlmacen,
    getDeclareTienda,
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

    const getSalesByArticles = async (cadenaConexion = '', sucursal = '', fechaIni = '', fechaFin = '', dataBaseStart, union = '', articles = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}
                DECLARE @fechaInicial datetime = CAST('${fechaIni}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaFin}' AS datetime);

                SELECT
                    Sucursal = @Sucursal,
                    M.Articulo, M.Nombre, M.Fecha, VentasPza = SUM(M.CantidadRegular), VentasCja = SUM(M.CantidadRegularUC), VentasValor = SUM(M.VentaValorNeta),
                    Relacion = CAST(CAST(M.FactorCompra AS INT) AS NVARCHAR) + '/' + M.UnidadCompra + ' - ' + CAST(CAST(M.FactorVenta AS INT) AS NVARCHAR) + '/' + M.UnidadVenta,
                    E.ExistenciaActualRegular, E.ExistenciaActualUC, E.CostoExistenciaNeto
                FROM ${dataBaseStart}.dbo.QVDEMovAlmacen AS M
                LEFT JOIN QVExistencias AS E ON M.Articulo = E.Articulo AND M.Almacen = E.Almacen AND M.Tienda = E.Tienda
                WHERE M.Articulo IN (${articles})
                    AND M.TipoDocumento = 'V' AND M.Estatus = 'E'
                    AND (M.Fecha BETWEEN @fechaInicial AND @FechaFinal)
                    AND M.Tienda = @Tienda
                    AND M.Almacen = @Almacen
                GROUP BY M.Articulo, M.Nombre, M.Fecha, M.FactorCompra, M.FactorVenta, M.UnidadCompra, M.UnidadVenta, E.ExistenciaActualRegular, E.ExistenciaActualUC, E.CostoExistenciaNeto

                UNION ALL

                SELECT
                    Sucursal = @Sucursal,
                    E.Articulo, E.Nombre, Fecha =  CAST('20000101' AS datetime), VentasPza = 0, VentasCja = 0, VentasValor = 0,
                    Relacion = CAST(CAST(E.FactorCompra AS INT) AS NVARCHAR) + '/' + E.UnidadCompra + ' - ' + CAST(CAST(E.FactorVenta AS INT) AS NVARCHAR) + '/' + E.UnidadVenta,
                    E.ExistenciaActualRegular, E.ExistenciaActualUC, E.CostoExistenciaNeto
                FROM QVExistencias AS E
                WHERE Articulo IN (${articles})
                    AND Tienda = @Tienda
                    AND Almacen = @Almacen

                ${union}
                `,
                QueryTypes.SELECT
            );
            return createContentAssert('Resultados de ventas', result[0]);
        } catch (error) {
            console.log(error);
            const response = createContentError(
                'Fallo la conexion con base de datos al intentar obtener las ventas por dia',
                error
            );
            response.Sucursal = sucursal;
            return response;
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

    const getOnlyExistences = async (cadenaConexion = '', sucursal = '', articles) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(30) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}
                
                SELECT
                    Articulo,
                    ExistenciaActualRegular,
                    ExistenciaActualUC,
                    CostoExistenciaNeto
                FROM QVExistencias
                WHERE Tienda = @Tienda AND Almacen = @Almacen AND Articulo IN(${articles});
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Existencias', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las existencias',
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
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}
                
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

    const getIOTortillas = async (cadenaConexion = '', sucursal = 'ZR', fecha) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}
                DECLARE @Fecha DATETIME = CAST('${fecha}' AS DATETIME)

                SELECT
                    TipoMovimiento = CASE WHEN TipoDocumento = 'C' THEN 'Compra' WHEN TipoDocumento = 'A' THEN 'Transferencia' WHEN TipoDocumento = 'V' THEN 'Venta' ELSE 'Ajuste' END,
                    Fecha, Hora, TipoDocumento, Consecutivo, Documento, M.Articulo, M.Nombre, CantidadRegular, Tercero, NombreTercero,
                    HoraString = CONVERT(NVARCHAR, Hora, 108),
                    ExistenciaActualRegular
                FROM QVDEMovAlmacen AS M
                LEFT JOIN QVExistencias AS E ON M.Articulo = E.Articulo AND M.Almacen = E.Almacen
                WHERE Fecha = @Fecha AND M.Almacen = @Almacen
                    AND TipoDocumento IN ('C', 'A', 'E', 'V') AND Estatus = 'E'
                    AND M.Articulo = '0957042' AND E.Tienda = @Tienda
                ORDER BY Fecha, Hora;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Entradas y salidas de tortillas', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener los movimientos de tortillas',
                error
            );
        }
    }

    const getReportMonthlyInvF = async (cadenaConexion = '', sucursal = 'ZR', fechaStart = '20230101', fechaEnd = '20230101', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                DECLARE @FechaInicio datetime = CAST('${fechaStart}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaEnd}' AS datetime);

                SELECT
                    Sucursal,Tipo,
                    Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                        Sucursal = @Sucursal,	Tipo = 'INVENTARIO FINAL',A.Almacen,
                        A.Articulo,A.Nombre,A.ExistenciaActualRegular,A.UltimoCosto, 
                        CostoValorNeto = (A.ExistenciaActualRegular * A.UltimoCosto) + (((A.ExistenciaActualRegular * A.UltimoCosto) + ((A.ExistenciaActualRegular * A.UltimoCosto) * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100)) + ((A.ExistenciaActualRegular * A.UltimoCosto) * (B.IepsTasaCompra / 100)),
                        IvaValorCosto = ((A.ExistenciaActualRegular * A.UltimoCosto) + ((A.ExistenciaActualRegular * A.UltimoCosto) * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100),
                        IepsValorCosto = (A.ExistenciaActualRegular * A.UltimoCosto) * (B.IepsTasaCompra / 100),
                        CostoValor = A.ExistenciaActualRegular * A.UltimoCosto
                    FROM FQVExistenciaES(@FechaFinal) A
                    LEFT JOIN QVExistencias B ON B.Articulo = A.Articulo AND B.Almacen = A.Almacen
                    WHERE A.Almacen = @Almacen
                        AND A.ExistenciaActualRegular > 0
                ) AS A
                GROUP BY Sucursal, Tipo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de Inventario Final Mensual', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener datos de inventario final mensual',
                error
            );
        }
    }

    const getReportMonthlyCPS = async (cadenaConexion = '', sucursal = 'ZR', fechaStart = '20230101', fechaEnd = '20230101', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                DECLARE @FechaInicio datetime = CAST('${fechaStart}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaEnd}' AS datetime);

                SELECT
                    Almacen,
                    Familia,Subfamilia,
                    CostoValor = SUM(CostoValor),
                    IvaValorCosto = SUM(IvaValorCosto),
                    IepsValorCosto = SUM(IepsValorCosto),
                    CostoValorNeto = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                        Sucursal = 'SPAVICTORIA', Tipo = 'COMPRA', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia,
                        Articulo, Nombre, CantidadRegular, UnidadVenta,CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto,
                        IvaValorCosto, IepsValorCosto, CostoValor, DescuentoValorCosto, Documento, Referencia, RFCTercero, Tercero,
                        NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria, DescripcionCategoria,
                        Tienda, DescripcionTienda, Observaciones, Fecha
                    FROM QVDEMovAlmacen 
                    WHERE TipoDocumento = 'C' AND Estatus = 'E'
                        AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                        AND Almacen = @Almacen
                ) AS A
                GROUP BY Almacen,Familia,Subfamilia
                ORDER BY CostoValorNeto DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de Compras Por Subfamilia', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener datos de Compras Por Subfamilia',
                error
            );
        }
    }

    const getReportMonthlyVPS = async (cadenaConexion = '', sucursal = 'ZR', fechaStart = '20230101', fechaEnd = '20230101', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                DECLARE @FechaInicio datetime = CAST('${fechaStart}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaEnd}' AS datetime);

                SELECT
                    Almacen,
                    Familia,Subfamilia,
                    CostoValor = SUM(CostoValor),
                    Venta = SUM(VentaValor),
                    Utilidad = SUM(VentaValor) - SUM(CostoValor),
                    Porcentaje = (SUM(VentaValor) - SUM(CostoValor)) / (SUM(VentaValor))
                FROM (
                    SELECT
                        Sucursal = @Sucursal, Tipo = 'VENTA', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia,
                        Articulo, Nombre, CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa,
                        CostoValorNeto, IvaValorCosto, IepsValorCosto, CostoValor, DescuentoValorCosto,
                        VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta,
                        Documento, Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen,
                        Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria, DescripcionCategoria,
                        Tienda, DescripcionTienda, Observaciones, Fecha
                    FROM QvDeMovAlmacen
                    WHERE ( Fecha BETWEEN @FechaInicio AND @FechaFinal ) 
                        AND TipoDocumento = 'V' AND Estatus = 'E'
                        AND NOT Subfamilia = 'SRecargas'
                ) AS A
                GROUP BY Almacen,Familia,Subfamilia
                ORDER BY Utilidad DESC,Almacen,Familia,Subfamilia
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de Ventas Por Subfamilia', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener datos de Ventas Por Subfamilia',
                error
            );
        }
    }

    const getReportMonthlyRecargas = async (cadenaConexion = '', sucursal = 'ZR', fechaStart = '20230101', fechaEnd = '20230101', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                DECLARE @FechaInicio datetime = CAST('${fechaStart}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaEnd}' AS datetime);

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(VentaValor), Iva = SUM(IvaValorVenta), Ieps = SUM(IepsValorVenta), Total = SUM(VentaValorNeta)	
                FROM (
                    SELECT
                            Sucursal = @Sucursal,	Tipo = 'RECARGAS ELECTRONICAS', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia,
                            Articulo, Nombre, CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto,
                            IepsValorCosto, CostoValor, DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta,
                            Documento, Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, FactorCompra, FactorVenta,
                            Categoria, DescripcionCategoria, Tienda, DescripcionTienda, Observaciones, Fecha
                        FROM QVDEMovAlmacen A
                        WHERE TipoDocumento = 'V' AND Estatus = 'E' 
                            AND A.Almacen = @Almacen
                            AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                            AND A.Subfamilia = 'SRecargas'
                ) AS A
                GROUP BY Sucursal, Tipo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de Recargas', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener datos de Recargas',
                error
            );
        }
    }

    const getReportMonthlyMSalidas = async (cadenaConexion = '', sucursal = 'ZR', fechaStart = '20230101', fechaEnd = '20230101', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                DECLARE @FechaInicio datetime = CAST('${fechaStart}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaEnd}' AS datetime);

                SELECT
                    Sucursal,Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                            Sucursal = @Sucursal, Tipo = 'TRANSF. SALIDA', A.Almacen, Familia = A.DescripcionFamilia, Subfamilia = A.DescripcionSubfamilia, A.Articulo, A.Nombre,
                            CantidadRegular, A.UnidadVenta, CantidadRegularUC, A.UnidadCompra, IvaTasa, IepsTasa,
                            CostoValorNeto = CostoValor + ((CostoValor + (Costovalor * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100)) + (Costovalor * (B.IepsTasaCompra / 100)),
                            IvaValorCosto = (CostoValor + (Costovalor * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100),
                            IepsValorCosto = Costovalor * (B.IepsTasaCompra / 100),
                            CostoValor, DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento, Referencia, RFCTercero,
                            Tercero, NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, A.FactorCompra, A.FactorVenta, A.Categoria, A.DescripcionCategoria,
                            A.Tienda, DescripcionTienda, Observaciones, Fecha
                        FROM QVDEMovAlmacen A
                        LEFT JOIN QVExistencias B ON B.Articulo = A.Articulo AND B.Almacen = A.Almacen
                        WHERE TipoDocumento = 'T' AND Estatus = 'E' 
                            AND A.Almacen = @Almacen
                            AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                ) AS A
                GROUP BY Sucursal, Tipo

                UNION ALL

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                            Sucursal = @Sucursal, Tipo = 'CONSUMO INTERNO', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia, Articulo, Nombre,
                            CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto, IepsValorCosto, CostoValor, DescuentoValorCosto,
                            VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento, Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen,
                            Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria, DescripcionCategoria, Tienda, DescripcionTienda, Observaciones, Fecha
                        FROM QVDEMovAlmacen A
                        WHERE TipoDocumento = 'I' AND Estatus = 'E' 
                            AND A.Almacen = @Almacen
                            AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                ) AS A
                GROUP BY Sucursal, Tipo

                UNION ALL

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                            Sucursal = @Sucursal, Tipo = 'AJUSTE DE SALIDA', A.Almacen, Familia = A.DescripcionFamilia, Subfamilia = A.DescripcionSubfamilia, A.Articulo, A.Nombre,
                            CantidadRegular, A.UnidadVenta, CantidadRegularUC, A.UnidadCompra, IvaTasa, IepsTasa,
                            CostoValorNeto = CostoValor + ((CostoValor + (Costovalor * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100)) + (Costovalor * (B.IepsTasaCompra / 100)),
                            IvaValorCosto = (CostoValor + (Costovalor * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100),
                            IepsValorCosto = Costovalor * (B.IepsTasaCompra / 100),
                            CostoValor, DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento, Referencia, RFCTercero,
                            Tercero, NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, A.FactorCompra, A.FactorVenta, A.Categoria, A.DescripcionCategoria,
                            A.Tienda, DescripcionTienda, Observaciones, Fecha
                        FROM QVDEMovAlmacen A
                        LEFT JOIN QVExistencias B ON B.Articulo = A.Articulo AND B.Almacen = A.Almacen
                        WHERE TipoDocumento = 'S' AND Estatus = 'E' 
                            AND A.Almacen = @Almacen
                            AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                            AND NOT A.Referencia LIKE 'Canc%'
                            AND NOT A.Referencia = 'AJUSTE DE INVENTARIO'
                ) AS A
                GROUP BY Sucursal, Tipo

                UNION ALL

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                            Sucursal = @Sucursal, Tipo = 'DEVOLUCION PROVEEDOR', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia,
                            Articulo, Nombre, CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto,
                            IepsValorCosto, CostoValor, DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta,
                            Documento, Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, FactorCompra, FactorVenta,
                            Categoria, DescripcionCategoria, Tienda, DescripcionTienda, Observaciones, Fecha
                        FROM QVDEMovAlmacen A
                        WHERE TipoDocumento = 'P' AND Estatus = 'E' 
                            AND A.Almacen = @Almacen
                            AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                ) AS A
                GROUP BY Sucursal, Tipo

                UNION ALL

                SELECT
                    Sucursal,Tipo,
                    Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                            Sucursal = @Sucursal, Tipo = 'MERMA', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia, Articulo, Nombre,
                            CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto, IepsValorCosto,
                            CostoValor, DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento,
                            Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria,
                            DescripcionCategoria, Tienda, DescripcionTienda, Observaciones, Fecha
                        FROM QVDEMovAlmacen A
                        WHERE TipoDocumento = 'M' AND Estatus = 'E' 
                            AND A.Almacen = @Almacen
                            AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                ) AS A
                GROUP BY Sucursal, Tipo

                UNION ALL

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), Ieps = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)
                FROM (
                    SELECT
                        Sucursal = @Sucursal, Tipo = 'COSTO DE VENTAS', Almacen, Familia = DescripcionFamilia,
                        Subfamilia = DescripcionSubfamilia, Articulo, Nombre,
                        CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa,
                        CostoValorNeto, IvaValorCosto, IepsValorCosto, CostoValor, DescuentoValorCosto,
                        VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta,
                        Documento, Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen,
                        Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria, DescripcionCategoria,
                        Tienda, DescripcionTienda, Observaciones, Fecha
                    FROM QVDEMovAlmacen A
                    WHERE TipoDocumento = 'V' AND Estatus = 'E' 
                        AND A.Almacen = @Almacen
                        AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                        AND NOT A.Subfamilia = 'SRecargas'
                ) AS A
                GROUP BY Sucursal, Tipo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de Movimientos de Salida', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener datos de Movimientos de Salida',
                error
            );
        }
    }

    const getReportMonthlyMEntradas = async (cadenaConexion = '', sucursal = 'ZR', fechaStart = '20230101', fechaEnd = '20230101', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                DECLARE @FechaInicio datetime = CAST('${fechaStart}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaEnd}' AS datetime);

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                        Sucursal = @Sucursal, Tipo = 'COMPRAS', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia, Articulo, Nombre,
                        CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto, IepsValorCosto,
                        CostoValor, DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento,
                        Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria,
                        DescripcionCategoria, Tienda, DescripcionTienda, Observaciones, Fecha
                    FROM QVDEMovAlmacen A
                    WHERE TipoDocumento = 'C' AND Estatus = 'E' 
                        AND A.Almacen = @Almacen
                        AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                ) AS A
                GROUP BY Sucursal,Tipo

                UNION ALL

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                        Sucursal = @Sucursal, Tipo = 'TRANSF. ENTRADA', A.Almacen, Familia = A.DescripcionFamilia, Subfamilia = A.DescripcionSubfamilia, A.Articulo, A.Nombre,
                        CantidadRegular, A.UnidadVenta, CantidadRegularUC, A.UnidadCompra, IvaTasa, IepsTasa,
                        CostoValorNeto = CostoValor + ((CostoValor + (Costovalor * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100)) + (Costovalor * (B.IepsTasaCompra / 100)),
                        IvaValorCosto = (CostoValor + (Costovalor * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100),
                        IepsValorCosto = Costovalor * (B.IepsTasaCompra / 100),
                        CostoValor, DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento, Referencia, RFCTercero,
                        Tercero, NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, A.FactorCompra, A.FactorVenta, A.Categoria, A.DescripcionCategoria,
                        A.Tienda, DescripcionTienda, Observaciones, Fecha
                    FROM QVDEMovAlmacen A
                    LEFT JOIN QVExistencias B ON B.Articulo = A.Articulo AND B.Almacen = A.Almacen
                    WHERE TipoDocumento = 'A' AND Estatus = 'E' 
                        AND A.Almacen = @Almacen
                        AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                ) AS A
                GROUP BY Sucursal, Tipo

                UNION ALL

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                        Sucursal = @Sucursal, Tipo = 'DEVOL. DE CLIENTE', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia, Articulo, Nombre,
                        CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto, IepsValorCosto, CostoValor, DescuentoValorCosto,
                        VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento, Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen,
                        Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria, DescripcionCategoria, Tienda, DescripcionTienda, Observaciones, Fecha
                    FROM QVDEMovAlmacen A
                    WHERE TipoDocumento = 'D' AND Estatus = 'E' 
                        AND A.Almacen = @Almacen
                        AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                ) AS A
                GROUP BY Sucursal, Tipo

                UNION ALL

                SELECT
                    Sucursal,Tipo,
                    Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), IepsCosto = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)	
                FROM (
                    SELECT
                        Sucursal = @Sucursal,	Tipo = 'AJUSTE DE ENTRADA',A.Almacen,Familia = A.DescripcionFamilia,
                        Subfamilia = A.DescripcionSubfamilia,	A.Articulo,A.Nombre,
                        CantidadRegular,A.UnidadVenta,CantidadRegularUC,A.UnidadCompra,IvaTasa,IepsTasa,
                        
                        CostoValorNeto = CostoValor + ((CostoValor + (Costovalor * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100)) + (Costovalor * (B.IepsTasaCompra / 100)),
                        IvaValorCosto = (CostoValor + (Costovalor * (B.IepsTasaCompra / 100))) * (B.IvaTasaCompra / 100),
                        IepsValorCosto = Costovalor * (B.IepsTasaCompra / 100),
                        CostoValor,DescuentoValorCosto,
                        
                        VentaValorNeta,IvaValorVenta,IepsValorVenta,VentaValor,DescuentoValorVenta,
                        Documento,Referencia,RFCTercero,Tercero,NombreTercero,DescripcionAlmacen,
                        Cajero,NombreCajero,A.FactorCompra,A.FactorVenta,A.Categoria,A.DescripcionCategoria,
                        A.Tienda,DescripcionTienda,Observaciones,Fecha
                    FROM QVDEMovAlmacen A
                    LEFT JOIN QVExistencias B ON B.Articulo = A.Articulo AND B.Almacen = A.Almacen
                    WHERE TipoDocumento = 'E' AND Estatus = 'E' 
                        AND A.Almacen = @Almacen
                        AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                        AND NOT A.Referencia = 'AJUSTE DE INVENTARIO'
                ) AS A
                GROUP BY Sucursal, Tipo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de Movimientos de Entrada', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener datos de Movimientos de Entrada',
                error
            );
        }
    }

    const getReportMonthlyUAI = async (cadenaConexion = '', sucursal = 'ZR', fechaStart = '20230101', fechaEnd = '20230101', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                DECLARE @FechaInicio datetime = CAST('${fechaStart}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaEnd}' AS datetime);

                SELECT
                    Sucursal, Tipo, UtilidadImporte = SUM(VentaValor) - SUM(CostoValor), UtilidadPorcentaje = (SUM(VentaValor) - SUM(CostoValor)) / SUM(VentaValor)
                FROM (
                    SELECT
                        Sucursal = @Sucursal, Tipo = 'UTILIDAD ANTES DE IMPUESTOS', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia, Articulo, Nombre,
                        CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto, IepsValorCosto, CostoValor, DescuentoValorCosto,
                        VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento, Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen,
                        Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria, DescripcionCategoria, Tienda, DescripcionTienda, Observaciones, Fecha
                    FROM QVDEMovAlmacen A
                    WHERE TipoDocumento = 'V' AND Estatus = 'E' 
                        AND A.Almacen = @Almacen
                        AND (Fecha BETWEEN @FechaInicio AND @FechaFinal)
                        AND NOT A.Subfamilia = 'SRecargas'
                ) AS A
                GROUP BY Sucursal, Tipo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de Utilidades Antes de Impuestos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener datos de Utilidades Antes de Impuestos',
                error
            );
        }
    }

    const getReportMonthlyVentas = async (cadenaConexion = '', sucursal = 'ZR', fechaStart = '20230101', fechaEnd = '20230101', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}
                DECLARE @FechaInicio datetime = CAST('${fechaStart}' AS datetime);
                DECLARE @FechaFinal datetime = CAST('${fechaEnd}' AS datetime);

                SELECT
                    Sucursal, Tipo, Subtotal = SUM(VentaValor), Iva = SUM(IvaValorVenta), Ieps = SUM(IepsValorVenta), Total = SUM(VentaValorNeta)
                FROM (
                    SELECT
                        Sucursal = @Sucursal, Tipo = 'VENTAS', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia, Articulo, Nombre,
                        CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto, IepsValorCosto,
                        CostoValor, DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento,
                        Referencia, RFCTercero, Tercero, NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, FactorCompra, FactorVenta,
                        Categoria, DescripcionCategoria, Tienda, DescripcionTienda, Observaciones, Fecha
                    FROM QVDEMovAlmacen A
                    WHERE TipoDocumento = 'V' AND Estatus = 'E' 
                        AND A.Almacen = @Almacen AND (Fecha BETWEEN @FechaInicio AND @FechaFinal) AND NOT A.Subfamilia = 'SRecargas'
                ) AS A
                GROUP BY Sucursal,Tipo
                    UNION ALL
                SELECT
                    Sucursal, Tipo, Subtotal = SUM(CostoValor), Iva = SUM(IvaValorCosto), Ieps = SUM(IepsValorCosto), Total = SUM(CostoValorNeto)
                FROM (
                    SELECT
                        Sucursal = @Sucursal, Tipo = 'COSTO DE VENTAS', Almacen, Familia = DescripcionFamilia, Subfamilia = DescripcionSubfamilia, Articulo, Nombre,
                        CantidadRegular, UnidadVenta, CantidadRegularUC, UnidadCompra, IvaTasa, IepsTasa, CostoValorNeto, IvaValorCosto, IepsValorCosto, CostoValor,
                        DescuentoValorCosto, VentaValorNeta, IvaValorVenta, IepsValorVenta, VentaValor, DescuentoValorVenta, Documento, Referencia, RFCTercero, Tercero,
                        NombreTercero, DescripcionAlmacen, Cajero, NombreCajero, FactorCompra, FactorVenta, Categoria, DescripcionCategoria, Tienda, DescripcionTienda,
                        Observaciones, Fecha
                    FROM QVDEMovAlmacen A
                    WHERE TipoDocumento = 'V' AND Estatus = 'E' 
                        AND A.Almacen = @Almacen AND (Fecha BETWEEN @FechaInicio AND @FechaFinal) AND NOT A.Subfamilia = 'SRecargas'
                ) AS A
                GROUP BY Sucursal, Tipo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de Ventas', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener datos de Ventas',
                error
            );
        }
    }

    const getMove = async (cadenaConexion = '', sucursal = 'ZR', where = '', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                SELECT
                    Articulo, CantidadRegular, Nombre, UnidadVenta,
                    Relacion = CAST(CAST(FactorCompra AS INT) AS NVARCHAR) + '/' + UnidadCompra + ' - ' + CAST(CAST(FactorVenta AS INT) AS NVARCHAR) + '/' + UnidadVenta,
                    Subtotal = CostoValorSinDcto,
                    Descuentos = DescuentoValorCosto,
                    IvaValor = IvaValorCosto,
                    IepsValor = IepsValorCosto,
                    Total = CostoValorNeto,
                    Tercero, NombreTercero,
                    IvaTasa, IepsTasa,
                    CostoUnitarioSinDcto,
                    Documento, Referencia, DescripcionAlmacen, Caja, Cajero, NombreCajero ,Observaciones, Fecha, Hora, TipoDocumento, Estatus
                FROM QVDEMovAlmacen ${where};
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('datos del documento', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener los datos del documento',
                error
            );
        }
    }

    const getMovesByFilter = async (cadenaConexion = '', sucursal = 'ZR', DB = '', typeDoc = 'V', likeDoc = '', likeRef = '', whereArticle = '', groupArticle = '', order = 'ASC') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                SELECT TOP 500
                    Documento, Referencia, DescripcionAlmacen, Caja, Cajero, NombreCajero ,Observaciones, Fecha, Hora, TipoDocumento, Estatus,
                    Articulos = COUNT(*)
                FROM QVDEMovAlmacen WHERE TipoDocumento = '${typeDoc}' AND Documento LIKE '%${likeDoc}%' AND Referencia LIKE '%${likeRef}%' ${whereArticle}
                GROUP BY Documento, Referencia, DescripcionAlmacen, Caja, Cajero, NombreCajero ,Observaciones, Fecha, Hora, TipoDocumento, Estatus ${groupArticle}
                ORDER BY Fecha ${order}
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de documentos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en ' + sucursal + ' al intentar obtener los documentos',
                error
            );
        }
    }

    const getSalesByHour = async (cadenaConexion = '', sucursal = 'ZR', FechaIni = '', FechaFin = '', dataBaseStart = '', union = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(30) = '${sucursal}';
                DECLARE @FechaInicial DATETIME = CAST('${FechaIni}' AS DATETIME);
                DECLARE @FechaFinal DATETIME = CAST('${FechaFin}' AS DATETIME);

                WITH VentasPorHora (
                    Fecha, HoraVenta, CantidadRegular, VentaValorNeta
                ) AS (
                    SELECT  
                        Fecha, HoraVenta = DATEPART(HOUR, Hora), CantidadRegular, VentaValorNeta
                    FROM ${dataBaseStart}.dbo.QVDEMovAlmacen
                    WHERE Tipodocumento = 'V' AND Estatus = 'E'
                        AND (Fecha BETWEEN @FechaInicial AND @FechaFinal)

                    ${union}
                )
                
                SELECT
                    Suc = @Sucursal, Fecha, HoraVenta,
                    Cantidad = SUM(CantidadRegular), Importe = SUM(VentaValorNeta)
                FROM VentasPorHora
                GROUP BY Fecha, HoraVenta
                ORDER BY Fecha ASC, HoraVenta ASC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Ventas por hora', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener ventas por hora',
                error
            );
        }
    }

    const getTopSalesArticles = async (cadenaConexion = '', sucursal = 'ZR', FechaIni = '', FechaFin = '', dataBaseStart = '', union = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(30) = '${sucursal}';
                DECLARE @FechaInicio DATETIME = CAST('${FechaIni}' AS DATETIME);
                DECLARE @FechaFinal DATETIME = CAST('${FechaFin}' AS DATETIME);
                DECLARE @Dias int = (SELECT DATEDIFF(DAY, @FechaInicio, @FechaFinal));
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                WITH MovimientoVentas (
                    Articulo, CostoValorNeto, CantidadRegular, VentaValorNeta
                ) AS (
                    SELECT
                        Articulo, CostoValorNeto, CantidadRegular, VentaValorNeta
                    FROM  ${dataBaseStart}.dbo.QVDEMovAlmacen
                    WHERE TipoDocumento = 'V' AND Estatus = 'E' AND ( Fecha BETWEEN @FechaInicio AND @FechaFinal ) AND Almacen = @Almacen AND Tienda = @Tienda

                    ${union}
                )

                SELECT
                    Sucursal = @Sucursal,
                    M.Articulo, E.CodigoBarrAS, E.Nombre,
                    Relacion = CAST(CAST(E.FactorCompra AS INT) AS NVARCHAR) + '/' + E.UnidadCompra + ' - ' + CAST(CAST(E.FactorVenta AS INT) AS NVARCHAR) + '/' + E.UnidadVenta,
                    StockMaximoMensual = E.StockMaximo,
                    StockMinimoMensual = E.StockMinimo,
                    UtilidadDiariaAVG = SUM(M.VentaValorNeta - M.CostoValorNeto) / @Dias,
                    PizasVendidas = SUM(CantidadRegular),
                    CostoVendido = SUM(M.CostoValorNeto),
                    ImporteVendido = SUM(VentaValorNeta),
                    UtilidadMXN = SUM(M.VentaValorNeta - M.CostoValorNeto),
                    ExistenciaUV = E.ExistenciaActualRegular,
                    DiasRestantes = CASE WHEN E.StockMinimo <= 0 THEN ROUND(E.ExistenciaActualRegular / (SUM(CantidadRegular) /@Dias), 2) ELSE ROUND(E.ExistenciaActualRegular / (E.StockMinimo / 30), 2) END,
                    DiasVendidos = @Dias
                FROM MovimientoVentas AS M
                LEFT JOIN QVExistencias AS E ON E.Articulo = M.Articulo 
                WHERE E.Almacen = @Almacen AND E.Tienda = @Tienda
                GROUP BY M.Articulo, E.CodigoBarrAS, E.Nombre, E.ExistenciaActualRegular, E.FactorCompra, E.UnidadCompra, E.FactorVenta, E.UnidadVenta, E.StockMinimo, E.StockMaximo
                ORDER BY UtilidadDiariaAVG DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Articulos Top', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener ventas por hora',
                error
            );
        }
    }

    return {
        getInventoryByShopAndWarehouse,
        getSalesByArticles,
        GetSalesForDate,
        getOnlyExistences,
        getReplacementsBuys,
        getReplacementsBills,
        getBinnacleBuys,
        getListCreditsCustomers,
        getVentasByFecha,
        getIOTortillas,
        getReportMonthlyInvF,
        getReportMonthlyCPS,
        getReportMonthlyVPS,
        getReportMonthlyRecargas,
        getReportMonthlyMSalidas,
        getReportMonthlyMEntradas,
        getReportMonthlyUAI,
        getReportMonthlyVentas,
        getMove,
        getMovesByFilter,
        getSalesByHour,
        getTopSalesArticles,
    }
})();

module.exports = modelsReportes;
