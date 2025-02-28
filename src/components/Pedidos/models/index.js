const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError,
    getDeclareAlmacen,
    getDeclareTienda,
} = require('../../../utils');

const modelsPedidos = (() => {
    const getOrdersSuggestedOld = async (cadenaConexion = '', sucursal= '', hostDatabase = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                SELECT
                    Tienda,Almacen,DescripcionSubfamilia,
                    Articulo,Nombre,StockMinimo,
                    tipoRotacion,estatusRotacion,FactorCompra,FactorVenta,
                    ExistLoc,ExistExt,tipoSugerido, CalculoRotacion,
                    Relacion = CAST(CAST(FactorCompra AS int) AS nvarchar) + UnidadCompra + '/' + CAST(CAST(FactorVenta AS int) AS nvarchar) + UnidadVenta
                FROM (
                SELECT
                    A.Tienda,A.Almacen,A.Subfamilia,A.DescripcionSubfamilia,
                    A.Articulo,A.Nombre,A.StockMinimo,
                    CalculoRotacion =
                        CASE
                            WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN ((A.StockMinimo / 30)*3)
                            WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN ((A.StockMinimo / 30)*7)
                            ELSE ((A.StockMinimo / 30)*15)
                        END,
                    --CalculoRotacionMedia = ((A.StockMinimo / 30)*7),
                    --CalculoRotacionBaja = ((A.StockMinimo / 30)*15),
                    tipoRotacion =
                        CASE
                            WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN 0 
                            WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN 1
                            ELSE 2
                        END,
                    estatusRotacion =
                        CASE
                            WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN 'ROTACION ALTA' 
                            WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN 'ROTACION MEDIA'  
                            ELSE 'ROTACION BAJA' 
                        END,
                    A.FactorCompra,A.FactorVenta,A.UnidadCompra,A.UnidadVenta,
                    ExistLoc = A.ExistenciaActualRegular,ExistExt = B.ExistenciaActualRegular,
                    tipoSugerido =
                        CASE
                            WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN 
                                CASE WHEN CEILING( ((((A.StockMinimo / 30)*3) - A.ExistenciaActualRegular) / A.FactorVenta) ) > 0 THEN CEILING( ((((A.StockMinimo / 30)*3) - A.ExistenciaActualRegular) / A.FactorVenta) ) ELSE 0 END
                            WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN 
                                CASE WHEN CEILING( ((((A.StockMinimo / 30)*7) - A.ExistenciaActualRegular) / A.FactorVenta) ) > 0 THEN CEILING( ((((A.StockMinimo / 30)*7) - A.ExistenciaActualRegular) / A.FactorVenta) ) ELSE 0 END
                            ELSE 
                                CASE WHEN CEILING( ((((A.StockMinimo / 30)*15) - A.ExistenciaActualRegular) / A.FactorVenta) ) > 0 THEN CEILING( ((((A.StockMinimo / 30)*15) - A.ExistenciaActualRegular) / A.FactorVenta) ) ELSE 0 END
                        END
                FROM ${hostDatabase}.dbo.QVExistencias A
                LEFT JOIN (
                    SELECT
                        Articulo,ExistenciaActualRegular
                    FROM QVExistencias
                    WHERE Tienda = 6 AND Almacen = 21
                        AND Articulo IN (SELECT Articulo FROM Catalogo WHERE Tienda = 6 AND Baja = 0)
                        AND ExistenciaActualRegular > 0
                ) B ON B.Articulo COLLATE Modern_Spanish_CI_AS = A.Articulo
                WHERE A.Tienda = @Tienda AND A.Almacen = @Almacen
                    AND A.Articulo IN (SELECT Articulo FROM ${hostDatabase}.dbo.Catalogo WHERE Tienda = @Tienda AND Baja = 0)
                    AND B.ExistenciaActualRegular IS NOT NULL
                    AND A.StockMinimo > A.ExistenciaActualRegular
                    AND A.ExistenciaActualRegular  < B.ExistenciaActualRegular
                    --AND (A.StockMinimo / 4) > A.ExistenciaActualRegular
                ) AS Tabla
                WHERE tipoSugerido > 0
                ORDER BY Subfamilia,tipoRotacion,tipoSugerido DESC,Articulo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido sujerido', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener el pedido sujerido',
                error
            );
        }
    }

    const getOrdersSuggested = async (cadenaConexion = '', sucursal= '', hostDatabase = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                WITH cteExistenciaBodega (Almacen,Tienda,DescripcionSubfamilia,Articulo,Nombre,FactorCompra,FactorVenta,ExistExt, UnidadCompra, UnidadVenta)
                AS (
                    SELECT
                        Almacen,Tienda,DescripcionSubfamilia,Articulo,Nombre,FactorCompra,FactorVenta,ExistExt = ExistenciaActualRegular, UnidadCompra, UnidadVenta
                    FROM QVExistencias
                    WHERE Almacen = 21 AND Tienda = 6 AND ExistenciaActualRegular > 0
                )

                SELECT
                    *
                FROM (

                    SELECT 
                        Tienda = @Tienda,Almacen = @Almacen,
                        B.DescripcionSubfamilia,B.Articulo,B.Nombre,A.StockMinimo,
                        B.UnidadCompra, B.UnidadVenta,
                        Relacion = CAST(CAST(B.FactorCompra AS int) AS nvarchar) + B.UnidadCompra + '/' + CAST(CAST(B.FactorVenta AS int) AS nvarchar) + B.UnidadVenta,
                        tipoRotacion = 
                            CASE 
                                WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN 0 
                                WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN 1
                                ELSE 2
                            END,
                        estatusRotacion = 
                            CASE 
                                WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN 'ROTACION ALTA' 
                                WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN 'ROTACION MEDIA'  
                                ELSE 'ROTACION BAJA' 
                            END,
                        B.FactorCompra,B.FactorVenta,ExitLoc = A.ExistenciaActualRegular,B.ExistExt,
                        tipoSugerido = 
                            CASE 
                                WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN 
                                    CASE WHEN CEILING( ((((A.StockMinimo / 30)*3) - A.ExistenciaActualRegular) / A.FactorVenta) ) > 0 THEN CEILING( ((((A.StockMinimo / 30)*3) - A.ExistenciaActualRegular) / A.FactorVenta) ) ELSE 0 END
                                WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN 
                                    CASE WHEN CEILING( ((((A.StockMinimo / 30)*7) - A.ExistenciaActualRegular) / A.FactorVenta) ) > 0 THEN CEILING( ((((A.StockMinimo / 30)*7) - A.ExistenciaActualRegular) / A.FactorVenta) ) ELSE 0 END
                                ELSE 
                                    CASE WHEN CEILING( ((((A.StockMinimo / 30)*15) - A.ExistenciaActualRegular) / A.FactorVenta) ) > 0 THEN CEILING( ((((A.StockMinimo / 30)*15) - A.ExistenciaActualRegular) / A.FactorVenta) ) ELSE 0 END
                            END,
                        CalculoRotacion = 
                            CASE 
                                WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN ((A.StockMinimo / 30)*3)
                                WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN ((A.StockMinimo / 30)*7)
                                ELSE ((A.StockMinimo / 30)*15)
                            END
                    FROM cteExistenciaBodega B
                    LEFT JOIN ${hostDatabase}.dbo.QVExistencias A
                        ON A.Articulo COLLATE Modern_Spanish_CI_AS = B.Articulo AND A.Almacen = @Almacen AND A.Tienda = @Tienda
                ) AS T
                WHERE tipoSugerido > 0 OR StockMinimo IS NULL
                ORDER BY DescripcionSubfamilia,tipoRotacion,tipoSugerido DESC,Articulo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido sugerido', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener el pedido sugerido',
                error
            );
        }
    }

    const getOrdersSuggestedToProvider = async (cadenaConexion = '', sucursal= '', hostDatabase = '', date = '20240101') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Fecha DATETIME = CAST('${date}' AS datetime);
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                WITH cteListaArticulos (Articulo)
                AS (
                    SELECT DISTINCT Articulo FROM (
                        SELECT DISTINCT Articulo FROM QVDEMovAlmacen
                        WHERE Almacen = 21 AND Tienda = 6 AND TipoDocumento IN ('C') AND Estatus = 'E' AND Fecha >= @Fecha
                        UNION ALL 
                        SELECT DISTINCT Articulo FROM [SPABODEGA_202408].[dbo].QVDEMovAlmacen
                        WHERE Almacen = 21 AND Tienda = 6 AND TipoDocumento IN ('C') AND Estatus = 'E' AND Fecha >= @Fecha
                    ) AS List
                ),
                cteExistenciaBodega (Almacen, Tienda, DescripcionSubfamilia, Articulo, Nombre, FactorCompra, FactorVenta, ExistExt, UnidadCompra, UnidadVenta)
                AS (
                    SELECT
                        Almacen, Tienda, DescripcionSubfamilia, E.Articulo, Nombre, FactorCompra, FactorVenta, ExistExt = ExistenciaActualRegular, UnidadCompra, UnidadVenta
                    FROM QVExistencias AS E
                    LEFT JOIN cteListaArticulos AS L ON E.Articulo = L.Articulo
                    WHERE Almacen = 21 AND Tienda = 6 AND E.Articulo = L.Articulo
                )

                SELECT
                    *
                FROM (

                    SELECT 
                        Tienda = @Tienda,Almacen = @Almacen,
                        B.DescripcionSubfamilia, B.Articulo, B.Nombre, A.StockMinimo,
                        B.UnidadCompra, B.UnidadVenta,
                        Relacion = CAST(CAST(B.FactorCompra AS int) AS nvarchar) + B.UnidadCompra + '/' + CAST(CAST(B.FactorVenta AS int) AS nvarchar) + B.UnidadVenta,
                        tipoRotacion = 
                            CASE 
                                WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN 0 
                                WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN 1
                                ELSE 2
                            END,
                        estatusRotacion = 
                            CASE 
                                WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN 'ROTACION ALTA' 
                                WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN 'ROTACION MEDIA'  
                                ELSE 'ROTACION BAJA' 
                            END,
                        B.FactorCompra, B.FactorVenta, ExitLoc = A.ExistenciaActualRegular, B.ExistExt,
                        CalculoRotacion = 
                            CASE 
                                WHEN ((A.StockMinimo / 30)*3) > (A.FactorVenta / 2) THEN ((A.StockMinimo / 30)*3)
                                WHEN ((A.StockMinimo / 30)*7) > (A.FactorVenta / 2) THEN ((A.StockMinimo / 30)*7)
                                ELSE ((A.StockMinimo / 30)*15)
                            END,
                        SugeridoAProveedor = CASE WHEN (A.StockMinimo - A.ExistenciaActualRegular - B.ExistExt) > 0 THEN (A.StockMinimo - A.ExistenciaActualRegular - B.ExistExt) ELSE 0 END
                    FROM cteExistenciaBodega B
                    LEFT JOIN ${hostDatabase}.dbo.QVExistencias A
                        ON A.Articulo COLLATE Modern_Spanish_CI_AS = B.Articulo AND A.Almacen = @Almacen AND A.Tienda = @Tienda
                ) AS T
                ORDER BY  DescripcionSubfamilia, tipoRotacion, Articulo, SugeridoAProveedor DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido sugerido', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener el pedido sugerido',
                error
            );
        }
    }

    const getOrdersWithDetailsToDirect = async (cadenaConexion = '', fecha= '', aplicaStatus = true, estatus = 'PEDIDO ENVIADO') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const complementWhere = aplicaStatus ? '' : '--';
            const result = await accessToDataBase.query(
                `
                USE SPASUC2014;
                SELECT
                    M.Pedido, M.Sucursal, Estatus, Articulo, PeCaja, PePieza, FechaPedidoEnviado
                FROM PedidosMaestro AS M
                LEFT JOIN PedidosDetalle AS D ON D.Pedido = M.Pedido AND D.Sucursal = M.Sucursal
                WHERE  (FechaPedidoEnviado BETWEEN CAST('${fecha} 00:00:00.000' AS DATETIME) AND CAST('${fecha} 23:59:59.999' AS DATETIME))
                    ${complementWhere} AND Estatus = '${estatus}'
                ;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedidos de Sucursales', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener el pedido de sucursales',
                error
            );
        }
    }

    const getPedidosEnBodega = async (cadenaConexion = '', database = 'SPASUC2021') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaPedidosBodega`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los pedidos en bodega',
                error
            );
        }
    }

    const getPedidosBySucursal = async (cadenaConexion = '', database = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaPedidosSucursal @Sucursal = '${sucursal}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los pedidos por sucursal',
                error
            );
        }
    }

    const getListaArticulosByArticulo = async (cadenaConexion = '', database = '', articulo = '', folio = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaExistenciasAyudaArticulos @Busqueda = '${articulo}',
                    @Sucursal = '${sucursal}',
                    @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los articulos por articulo',
                error
            );
        }
    }

    const getListaArticulosByNombre = async (cadenaConexion = '', database = '', nombre = '', folio = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaExistenciasAyuda @Busqueda = '${nombre}',
                    @Sucursal = '${sucursal}',
                    @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los articulos por nombre',
                error
            );
        }
    }

    const getListaArticulosByDias = async (cadenaConexion = '', database = '', sucursal = '', folio = '', dias = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaExistenciasAyudaTop @Dias = ${dias},
                    @Sucursal = '${sucursal}',
                    @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los articulos por dia',
                error
            );
        }
    }

    const getReporteListaArticulos = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ReporteListaArticulos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener el reporte de lista de articulos',
                error
            );
        }
    }

    const getListaArticulos = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE VerListaArticulos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la lista de articulos',
                error
            );
        }
    }

    const addPedido = async (cadenaConexion = '', database = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE AddPedidos @Sucursal = '${sucursal}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido creado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar agregar un nuevo pedido',
                error
            );
        }
    }

    const addArticle = async (cadenaConexion = '', database = 'SPASUC2021', articulo = '', body = {}) => {
        try {
            const { pedido, sucursal, PeCaja, PePieza } = body;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE RegistroPedidos @Articulo = '${articulo}',
                    @Sucursal = '${sucursal}', @Pedido = '${pedido}',
                    @PeCaja = ${PeCaja}, @PePieza = ${PePieza}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Articulo agregado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar agregar un articulo al pedido',
                error
            );
        }
    }

    const sendPedido = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE SendPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido enviado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar enviar el pedido',
                error
            );
        }
    }

    const enProcesoPedido = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE EnProcesoPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido en proceso', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar poner en proceso el pedido',
                error
            );
        }
    }

    const cancelPedido = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE CancelPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido Cancelado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar cancelar el pedido',
                error
            );
        }
    }

    const atendidoPedido = async (cadenaConexion = '', database = '', sucursal = '', folio = '', entrada = '', salida = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE AtendidoPedidos @Sucursal = '${sucursal}', @Folio = ${folio},
                    @Entrada = '${entrada}', @Salida = '${salida}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido atendido', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar atender el pedido',
                error
            );
        }
    }

    return {
        getPedidosEnBodega,
        getPedidosBySucursal,
        getListaArticulosByArticulo,
        getListaArticulosByNombre,
        getListaArticulosByDias,
        getReporteListaArticulos,
        getListaArticulos,
        addPedido,
        addArticle,
        sendPedido,
        enProcesoPedido,
        cancelPedido,
        atendidoPedido,
        getOrdersSuggested,
        getOrdersSuggestedToProvider,
        getOrdersWithDetailsToDirect,
    }
})();

module.exports = modelsPedidos;
