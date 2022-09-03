const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsArticulos = (() => {
    const getPrecio = async (cadenaConexion = '', sucursal = 'ZR', codigoBarrasArticulo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}'
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'OU' THEN 19 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'OU' THEN 5 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END

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
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener precios',
                error
            );
        }
    }

    const getArticulosConUtilidadBaja = async (cadenaConexion = '', sucursal = 'ZR', porcentajeUtilidad = 0.1) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;
                DECLARE @UtilidadMinima FLOAT = ${porcentajeUtilidad};

                WITH ArticulosUtilidad (
                    Articulo, Nombre, Relacion, ExistenciaActualRegular, UltimoCosto, Precio1IVAUV, Precio2IVAUV, Precio3IVAUV,
                    Utilidad1, Utilidad2, Utilidad3, CantidadParaPrecio1, CantidadParaPrecio2, CantidadParaPrecio3, UtilidadMinima
                ) AS (
                    SELECT
                        Articulo, Nombre,
                        Relacion = CAST(CAST(FactorCompra AS int) AS nvarchar) + UnidadCompra + '/' + CAST(CAST(FactorVenta AS int) AS nvarchar) + UnidadVenta,
                        ExistenciaActualRegular,
                        UltimoCosto, Precio1IVAUV, Precio2IVAUV, Precio3IVAUV,
                        Utilidad1 = CASE WHEN Precio1IVAUV = 0 THEN 0 ELSE (1 - (UltimoCosto / Precio1IVAUV)) END,
                        Utilidad2 = CASE WHEN Precio2IVAUV = 0 THEN 0 ELSE (1 - (UltimoCosto / Precio2IVAUV)) END,
                        Utilidad3 = CASE WHEN Precio3IVAUV = 0 THEN 0 ELSE (1 - (UltimoCosto / Precio3IVAUV)) END,
                        CantidadParaPrecio1, CantidadParaPrecio2, CantidadParaPrecio3,
                        UtilidadMinima = ${porcentajeUtilidad}
                    FROM QVListaPrecioConCosto
                    WHERE Tienda = @Tienda AND Almacen = @Almacen
                        AND ExistenciaActualRegular > 0
                )

                SELECT * FROM ArticulosUtilidad WHERE Utilidad1 < @UtilidadMinima OR Utilidad2 < @UtilidadMinima OR Utilidad3 < @UtilidadMinima

                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Articulos con utilidad baja', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los articulos con utilidad baja',
                error
            );
        }
    }

    const calculateStocks = async (cadenaConexion = '', sucursal = 'ZR', databaseOld = '', dayMin = 30, dayMax = 45) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @toDay DATETIME = GETDATE();
                DECLARE @MesAnteriorInicio DATETIME = DATEADD(MM,DATEDIFF(MM,0,@toDay) - 1,0);
                DECLARE @MesAnteriorFinal DATETIME = DATEADD(MM,DATEDIFF(MM,0,@toDay),0) - 1;
                DECLARE @MesAnterior2Inicio DATETIME = DATEADD(MM,DATEDIFF(MM,0,@toDay) - 2,0);
                DECLARE @MesAnterior2Final DATETIME = DATEADD(MM,DATEDIFF(MM,0,@toDay) - 1,0) - 1;
                DECLARE @MesAnterior3Inicio DATETIME = DATEADD(MM,DATEDIFF(MM,0,@toDay) - 3,0);
                DECLARE @MesAnterior3Final DATETIME = DATEADD(MM,DATEDIFF(MM,0,@toDay) - 2,0) - 1;

                DECLARE @DiasStockMin INT = ${dayMin};
                DECLARE @DiasStockMax INT = ${dayMax};

                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 WHEN @Sucursal = 'SA' THEN 6 WHEN @Sucursal = 'SU' THEN 2 WHEN @Sucursal = 'MA' THEN 3 WHEN @Sucursal = 'RE' THEN 1 WHEN @Sucursal = 'EN' THEN 14 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 WHEN @Sucursal = 'SA' THEN 2 WHEN @Sucursal = 'SU' THEN 5 WHEN @Sucursal = 'MA' THEN 1 WHEN @Sucursal = 'RE' THEN 1 WHEN @Sucursal = 'EN' THEN 6 ELSE 0 END;

                WITH VentasPorDia (
                Fecha, Articulo, CodigoBarrAS, Nombre, Cant, Almacen
                ) AS (
                SELECT
                    Fecha,Articulo, CodigoBarrAS, Nombre, Cant = SUM(CantidadRegular), Almacen
                FROM ${databaseOld}.dbo.QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E'
                    AND ( Fecha BETWEEN @MesAnterior3Inicio AND @MesAnteriorFinal )
                    AND Almacen = @Almacen
                GROUP BY Fecha, Articulo, CodigoBarrAS, Nombre, Almacen
                
                UNION ALL

                SELECT
                    Fecha,Articulo, CodigoBarrAS, Nombre, Cant = SUM(CantidadRegular), Almacen
                FROM QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E'
                    AND ( Fecha BETWEEN @MesAnterior3Inicio AND @MesAnteriorFinal )
                    AND Almacen = @Almacen
                GROUP BY Fecha, Articulo, CodigoBarrAS, Nombre, Almacen
                )

                SELECT 
                    Sucursal = @Sucursal,
                    Articulo, CodigoBarrAS, Nombre,
                    MesAnt3 = AVG(CASE WHEN Fecha BETWEEN @MesAnterior3Inicio AND @MesAnterior3Final THEN Cant END),
                    MesAnt2 = AVG(CASE WHEN Fecha BETWEEN @MesAnterior2Inicio AND @MesAnterior2Final THEN Cant END),
                    MesAnt1 = AVG(CASE WHEN Fecha BETWEEN @MesAnteriorInicio AND @MesAnteriorFinal THEN Cant END),
                    Promedio = AVG(Cant),
                    StockMin = ROUND(AVG(Cant) * @DiasStockMin, 0),
                    StockMax = ROUND(AVG(Cant) * @DiasStockMax, 0),
                    Almacen,
                    SQL_QUERY = 'UPDATE Existencias SET StockMinimo = ' + CAST(ROUND(AVG(Cant) * @DiasStockMin, 0) AS nvarchar) + ', StockMaximo = ' + CAST(ROUND(AVG(Cant) * @DiasStockMax, 0)  AS nvarchar) + ' WHERE Almacen = ' + CAST(@Almacen AS NVARCHAR) + ' AND Articulo = ''' + Articulo + ''''
                FROM VentasPorDia
                GROUP BY Articulo, CodigoBarrAS, Nombre, Almacen
                ORDER BY Articulo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar calcular stocks',
                error
            );
        }
    }

    const updateStockByScripts = async (cadenaConexion = '', script = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(script, QueryTypes.UPDATE);
            dbmssql.closeConexion();
            return createContentAssert('Stock actualizados', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los stocks',
                error
            );
        }
    }

    const getDetailsArticleForCodificador = async (cadenaConexion = '', sucursal = '', article = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}'
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'OU' THEN 19 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'OU' THEN 5 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;
                DECLARE @articulo NVARCHAR(15) = (SELECT DISTINCT TOP 1 Articulo FROM ArticulosRelacion WHERE CodigoBarras = '${article}' OR Articulo = '${article}');
                DECLARE @article NVARCHAR(15) = ISNULL(@articulo, '${article}');

                SELECT
                A.Nombre, A.CodigoBarras, A.Articulo, A.Descripcion, E.ExistenciaActualRegular, E.ExistenciaActualUC,
                    Relacion = CAST(CAST(A.FactorVenta AS int) AS nvarchar) + A.UnidadVenta + '/' + CAST(CAST(A.FactorCompra AS int) AS nvarchar) + A.UnidadCompra
                FROM QVListaprecioConCosto AS A
                INNER JOIN QVExistencias AS E ON A.Articulo = E.Articulo
                WHERE (A.Articulo = @article OR A.CodigoBarras = @article)
                    AND A.Tienda = @Tienda
                    AND A.Almacen = @Almacen
                    AND E.Tienda = @Tienda
                    AND E.Almacen = @Almacen
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos para codificador', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener detalles de articulo para codificador',
                error
            );
        }
    }

    // const getArticlesBySkuOnline = async (cadenaConexion = '', sucursal = '', article = '') => {
    //     try {
    //         const accessToDataBase = dbmssql.getConexion(cadenaConexion);
    //         const result = await accessToDataBase.query(
    //             `
    //             DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
    //             DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
    //             DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;
    //             DECLARE @articulo NVARCHAR(15) = (SELECT DISTINCT TOP 1 Articulo FROM ArticulosRelacion WHERE CodigoBarras = '${article}' OR Articulo = '${article}');
    //             DECLARE @article NVARCHAR(15) = ISNULL(@articulo, '${article}');

    //             SELECT
    //                 Almacen, Tienda,
    //                 Articulo,CodigoBarras,Nombre,
    //                 Relacion = CAST(CAST(FactorCompra AS INT) AS NVARCHAR) + '/' + UnidadCompra + ' - ' + CAST(CAST(FactorVenta AS INT) AS NVARCHAR) + '/' + UnidadVenta,
    //                 ExistUV = ExistenciaActualRegular, ExistUC = ExistenciaActualUC,
    //                 CostoNet = UltimoCostoNeto, CostoNetUC = UltimoCostoNetoUC,
    //                 CostoExist = CostoExistenciaNeto,
    //                 PrecioUNO = ISNULL(Precio1IVAUV,0.00),
    //                 UtilUNO = CASE WHEN Precio1IVAUV = 0 THEN 0.00 ELSE ISNULL(1 - (UltimoCostoNeto/Precio1IVAUV),0.00) END,
    //                 PrecioDOS = ISNULL(Precio2IVAUV,0.00),
    //                 UtilDOS = CASE WHEN Precio2IVAUV = 0 THEN 0.00 ELSE ISNULL(1 - (UltimoCostoNeto/Precio2IVAUV),0.00) END,
    //                 Estatus = CASE WHEN ExistenciaActualRegular >= StockMinimo AND ExistenciaActualRegular <= StockMaximo THEN 'OK' WHEN ExistenciaActualRegular < StockMinimo THEN 'BAJO' WHEN ExistenciaActualRegular > StockMaximo THEN 'SOBRE' ELSE '' END,
    //                 Stock30 = CAST( StockMinimo AS DECIMAL (9,2) ), Stock30UC = CAST( (StockMinimo / FactorVenta) AS DECIMAL(9,2)),
    //                 Subfamilia = Subfamilia,
    //                 DescSubfamila = DescripcionSubfamilia,
    //                 Updated = GETDATE()
    //             FROM QVListaprecioConCosto
    //             WHERE Almacen = @Almacen AND Tienda = @Tienda
    //                 AND (Articulo = @article OR CodigoBarras = @article);
    //             `,
    //             QueryTypes.SELECT
    //         );
    //         dbmssql.closeConexion();
    //         return createContentAssert('Existencias de articulo Online', result[0]);
    //     } catch (error) {
    //         console.log(error);
    //         return createContentError(
    //             'Fallo la conexion con base de datos al intentar obtener las Existencias de articulo Online',
    //             error
    //         );
    //     }
    // }

    const getArticlesWithShoppsBySkuOnline = async (cadenaConexion = '', sucursal = '', article = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            // console.log(sucursal, 'Before Existencias***************************************************');
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;
                DECLARE @articulo NVARCHAR(15) = (SELECT DISTINCT TOP 1 Articulo FROM ArticulosRelacion WHERE CodigoBarras = '${article}' OR Articulo = '${article}');
                DECLARE @article NVARCHAR(15) = ISNULL(@articulo, '${article}');

                SELECT
                    Almacen, Tienda,
                    Articulo,CodigoBarras,Nombre,
                    Relacion = CAST(CAST(FactorCompra AS INT) AS NVARCHAR) + '/' + UnidadCompra + ' - ' + CAST(CAST(FactorVenta AS INT) AS NVARCHAR) + '/' + UnidadVenta,
                    ExistUV = ExistenciaActualRegular, ExistUC = ExistenciaActualUC,
                    CostoNet = UltimoCostoNeto, CostoNetUC = UltimoCostoNetoUC,
                    CostoExist = CostoExistenciaNeto,
                    PrecioUNO = ISNULL(Precio1IVAUV,0.00),
                    UtilUNO = CASE WHEN Precio1IVAUV = 0 THEN 0.00 ELSE ISNULL(1 - (UltimoCostoNeto/Precio1IVAUV),0.00) END,
                    PrecioDOS = ISNULL(Precio2IVAUV,0.00),
                    UtilDOS = CASE WHEN Precio2IVAUV = 0 THEN 0.00 ELSE ISNULL(1 - (UltimoCostoNeto/Precio2IVAUV),0.00) END,
                    Estatus = CASE WHEN ExistenciaActualRegular >= StockMinimo AND ExistenciaActualRegular <= StockMaximo THEN 'OK' WHEN ExistenciaActualRegular < StockMinimo THEN 'BAJO' WHEN ExistenciaActualRegular > StockMaximo THEN 'SOBRE' ELSE '' END,
                    Stock30 = CAST( StockMinimo AS DECIMAL (9,2) ), Stock30UC = CAST( (StockMinimo / FactorVenta) AS DECIMAL(9,2)),
                    Subfamilia = Subfamilia,
                    DescSubfamila = DescripcionSubfamilia,
                    Updated = GETDATE()
                FROM QVListaprecioConCosto
                WHERE Almacen = @Almacen AND Tienda = @Tienda
                    AND (Articulo = @article OR CodigoBarras = @article);
                `,
                QueryTypes.SELECT
            );

            const data = result[0]
            // console.log(sucursal, 'Before Compras***************************************************');

            let resultCompras = [];
            const consultCompras = async () => {
                try {
                    const connection = dbmssql.getConexion(cadenaConexion);
                    const resultCompras = await connection.query(
                        `
                        SELECT TOP 5
                            Suc = '${sucursal}',
                            Fecha,NombreTercero, CantidadRegularUC, CostoUnitarioNetoUC, Updated
                        FROM ultimasCincoCompras('${article}')
                        ORDER BY Fecha DESC
                        `,
                        QueryTypes.SELECT
                    );
                    // dbmssql.closeConexion();
                    return createContentAssert('Compras', resultCompras[0]);
                } catch (error) {
                    console.log(sucursal + '-Function', error);
                    return createContentError('Compras fallidas');
                }
            }

            // console.log(sucursal, 'Before Function***************************************************');
            resultCompras = await consultCompras();
            // console.log(sucursal, resultCompras, 'After 1 Function***************************************************');
            if (!resultCompras.success) resultCompras = await consultCompras();
            // console.log(sucursal, resultCompras, 'After 2 Function***************************************************');
            if (!resultCompras.success) resultCompras = await consultCompras();

            if (data.length === 0) data.push({});
            data[0].compras = resultCompras.data || [];
            // console.log('Inserted', data[0].compras);

            // dbmssql.closeConexion();
            return createContentAssert('Existencias de articulo con compras Online', data);
        } catch (error) {
            // console.log(sucursal + '-error**********************************', error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las Existencias con compras de articulo Online',
                error
            );
        }
    }

    // const getArticlesBySkuOffline = async (cadenaConexion = '', sucursal = '', article = '') => {
    //     try {
    //         const accessToDataBase = dbmssql.getConexion(cadenaConexion);
    //         const result = await accessToDataBase.query(
    //             `
    //             DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
    //             DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
    //             DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;
    //             DECLARE @articulo NVARCHAR(15) = (SELECT DISTINCT TOP 1 Articulo FROM ArticulosRelacion WHERE CodigoBarras = '${article}' OR Articulo = '${article}');
    //             DECLARE @article NVARCHAR(15) = ISNULL(@articulo, '${article}');

    //             SELECT
    //                 Almacen, Tienda,
    //                 Articulo, CodigoBarras, Nombre, Relacion,ExistUV,ExistUC,
    //                 CostoNet, CostoNetUC, CostoExist, PrecioUNO, UtilUNO,
    //                 PrecioDOS, UtilDOS, Estatus, Stock30, Stock30UC, Subfamilia, DescSubfamila,Updated
    //             FROM microservicioExistencias
    //             WHERE Almacen = @Almacen AND Tienda = @Tienda
    //                 AND (Articulo = @article OR CodigoBarras = @article);
    //             `,
    //             QueryTypes.SELECT
    //         );
    //         dbmssql.closeConexion();
    //         return createContentAssert('Existencias de articulo Offline', result[0]);
    //     } catch (error) {
    //         console.log(error);
    //         return createContentError(
    //             'Fallo la conexion con base de datos al intentar obtener las Existencias de articulo Offline',
    //             error
    //         );
    //     }
    // }

    const getArticlesWithShoppsBySkuOffline = async (cadenaConexion = '', sucursal = '', article = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;
                DECLARE @articulo NVARCHAR(15) = (SELECT DISTINCT TOP 1 Articulo FROM ArticulosRelacion WHERE CodigoBarras = '${article}' OR Articulo = '${article}');
                DECLARE @article NVARCHAR(15) = ISNULL(@articulo, '${article}');

                SELECT
                    Almacen, Tienda,
                    Articulo, CodigoBarras, Nombre, Relacion,ExistUV,ExistUC,
                    CostoNet, CostoNetUC, CostoExist, PrecioUNO, UtilUNO,
                    PrecioDOS, UtilDOS, Estatus, Stock30, Stock30UC, Subfamilia, DescSubfamila,Updated
                FROM microservicioExistencias
                WHERE Almacen = @Almacen AND Tienda = @Tienda
                    AND (Articulo = @article OR CodigoBarras = @article);
                `,
                QueryTypes.SELECT
            );

            const data = result[0]

            const resultCompras = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;

                SELECT
                    Fecha,
                    NombreTercero,
                    CantidadRegularUC,CostoUnitarioNetoUC,
                    Updated
                FROM microservicioCompras
                WHERE Almacen = @Almacen AND Tienda = @Tienda
                    AND Articulo = '${article}'
                ORDER BY Fecha DESC
                `,
                QueryTypes.SELECT
            );
            data[0].compras = resultCompras[0]

            dbmssql.closeConexion();
            return createContentAssert('Existencias de articulo con compras Offline', data);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las Existencias de articulo con compras Offline',
                error
            );
        }
    }

    const getArticlesByNameOnline = async (cadenaConexion = '', sucursal = '', name = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;

                SELECT
                    Articulo,CodigoBarras,Nombre,
                    Relacion = CAST(CAST(FactorCompra AS INT) AS NVARCHAR) + '/' + UnidadCompra + ' - ' + CAST(CAST(FactorVenta AS INT) AS NVARCHAR) + '/' + UnidadVenta,
                    Subfamilia = Subfamilia, DescSubfamila = DescripcionSubfamilia
                FROM QVListaprecioConCosto
                WHERE Almacen = @Almacen AND Tienda = @Tienda
                    AND Nombre LIKE REPLACE('${name}','*','%')
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Articulos por nombre Online', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los Articulos por nombre Online',
                error
            );
        }
    }

    // const getArticlesByNameOffline = async (cadenaConexion = '', sucursal = '', name = '') => {
    //     try {
    //         const accessToDataBase = dbmssql.getConexion(cadenaConexion);
    //         const result = await accessToDataBase.query(
    //             `
    //             DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
    //             DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
    //             DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;

    //             SELECT
    //                 Articulo, CodigoBarras, Nombre, Relacion,
    //                 Subfamilia, DescSubfamila
    //             FROM microservicioExistencias
    //             WHERE Almacen = @Almacen AND Tienda = @Tienda
    //                 AND Nombre LIKE REPLACE('${name}','*','%')
    //             `,
    //             QueryTypes.SELECT
    //         );
    //         dbmssql.closeConexion();
    //         return createContentAssert('Articulos por nombre Offline', result[0]);
    //     } catch (error) {
    //         console.log(error);
    //         return createContentError(
    //             'Fallo la conexion con base de datos al intentar obtener los Articulos por nombre Offline',
    //             error
    //         );
    //     }
    // }

    // const getComprasBySkuOnline = async (cadenaConexion = '', article = '') => {
    //     try {
    //         const accessToDataBase = dbmssql.getConexion(cadenaConexion);
    //         const result = await accessToDataBase.query(
    //             `
    //             SELECT TOP 5
    //                 Fecha,NombreTercero, CantidadRegularUC,CostoUnitarioNetoUC,Updated
    //             FROM ultimasCincoCompras('${article}')
    //             ORDER BY Fecha DESC
    //             `,
    //             QueryTypes.SELECT
    //         );
    //         dbmssql.closeConexion();
    //         return createContentAssert('Ultimas compras Online', result[0]);
    //     } catch (error) {
    //         console.log(error);
    //         return createContentError(
    //             'Fallo la conexion con base de datos al intentar obtener las Ultimas compras Online',
    //             error
    //         );
    //     }
    // }

    // const getComprasBySkuOffline = async (cadenaConexion = '', sucursal = '', article = '') => {
    //     try {
    //         const accessToDataBase = dbmssql.getConexion(cadenaConexion);
    //         const result = await accessToDataBase.query(
    //             `
    //             DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
    //             DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
    //             DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;

    //             SELECT
    //                 Fecha,
    //                 NombreTercero,
    //                 CantidadRegularUC,CostoUnitarioNetoUC,
    //                 Updated
    //             FROM microservicioCompras
    //             WHERE Almacen = @Almacen AND Tienda = @Tienda
    //                 AND Articulo = '${article}'
    //             ORDER BY Fecha DESC
    //             `,
    //             QueryTypes.SELECT
    //         );
    //         dbmssql.closeConexion();
    //         return createContentAssert('Ultimas compras Offline', result[0]);
    //     } catch (error) {
    //         console.log(error);
    //         return createContentError(
    //             'Fallo la conexion con base de datos al intentar obtener las Ultimas compras Offline',
    //             error
    //         );
    //     }
    // }

    return {
        getDetailsArticleForCodificador,
        getArticulosConUtilidadBaja,
        updateStockByScripts,
        calculateStocks,
        getPrecio,
        // getArticlesBySkuOnline,
        // getArticlesBySkuOffline,
        getArticlesByNameOnline,
        // getArticlesByNameOffline,
        // getComprasBySkuOnline,
        // getComprasBySkuOffline,

        getArticlesWithShoppsBySkuOnline,
        getArticlesWithShoppsBySkuOffline,
    }
})();

module.exports = modelsArticulos;
