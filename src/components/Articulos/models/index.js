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

                DECLARE @DiasStockMin INT = ${dayMin}
                DECLARE @DiasStockMax INT = ${dayMax}

                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}'
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'OU' THEN 19 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 WHEN @Sucursal = 'SA' THEN 6 WHEN @Sucursal = 'SU' THEN 2 WHEN @Sucursal = 'MA' THEN 3 WHEN @Sucursal = 'RE' THEN 1 WHEN @Sucursal = 'EN' THEN 14 ELSE 0 END
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'OU' THEN 5 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 WHEN @Sucursal = 'SA' THEN 2 WHEN @Sucursal = 'SU' THEN 5 WHEN @Sucursal = 'MA' THEN 1 WHEN @Sucursal = 'RE' THEN 1 WHEN @Sucursal = 'EN' THEN 6 ELSE 0 END


                WITH VentasPorDia (
                Fecha, Articulo, CodigoBarrAS, Nombre, Cant
                ) AS (
                SELECT
                    Fecha,Articulo, CodigoBarrAS, Nombre, Cant = SUM(CantidadRegular)
                FROM ${databaseOld}.dbo.QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E'
                    AND ( Fecha BETWEEN @MesAnterior3Inicio AND @MesAnteriorFinal )
                    AND Almacen = @Almacen
                GROUP BY Fecha, Articulo, CodigoBarrAS, Nombre
                
                UNION ALL

                SELECT
                    Fecha,Articulo, CodigoBarrAS, Nombre, Cant = SUM(CantidadRegular)
                FROM QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E'
                    AND ( Fecha BETWEEN @MesAnterior3Inicio AND @MesAnteriorFinal )
                    AND Almacen = @Almacen
                GROUP BY Fecha, Articulo, CodigoBarrAS, Nombre
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
                    SQL_QUERY = 'UPDATE Existencias SET StockMinimo = ' + CAST(ROUND(AVG(Cant) * @DiasStockMin, 0) AS nvarchar) + ', StockMaximo = ' + CAST(ROUND(AVG(Cant) * @DiasStockMax, 0)  AS nvarchar) + ' WHERE Almacen = ' + CAST(@Almacen AS NVARCHAR) + ' AND Articulo = ''' + Articulo + ''''
                FROM VentasPorDia
                GROUP BY Articulo, CodigoBarrAS, Nombre
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

    return {
        getDetailsArticleForCodificador,
        updateStockByScripts,
        calculateStocks,
        getPrecio,
    }
})();

module.exports = modelsArticulos;
