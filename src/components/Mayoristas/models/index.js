const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsMayoristas = (() => {
    const getDetailsCompra = async (cadenaConexion = '', document = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                SELECT
                    Articulo, Nombre,
                    IEPS = 1 + (IepsTasa / 100),
                    IVA = CASE WHEN M.IvaTasa = 0 THEN 1 ELSE 1.16 END,
                    CantidadRegularUC, CantidadRegular, CostoValor,
                    Relacion = CAST(CAST(FactorCompra AS INT)AS nvarchar) + UnidadCompra + ' / ' + CAST(CAST(FactorVenta AS INT)AS nvarchar) + UnidadVenta,
                    Position = ROW_NUMBER() over(order by hora)
                FROM QVDEMovAlmacen AS M
                WHERE Documento = '${document}'
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de la compra', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los datos de la compra',
                error
            );
        }
    }

    const getDetailsOrdenCompra = async (cadenaConexion = '', consecutivo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                SELECT
                    M.Articulo, Nombre,
                    IEPS = (IepsTasaCompra / 100) + 1,
                    IVA = CASE WHEN IvaTasaCompra = 0 THEN 1 ELSE 1.16 END,
                    CantidadRegularUC = CantidadPedidaUC, CantidadRegular = M.CantidadPedida, CostoValor = ValorPedidoMN,
                    Relacion = CAST(CAST(FactorCompra AS INT)AS nvarchar) + UnidadCompra + ' / ' + CAST(CAST(FactorVenta AS INT)AS nvarchar) + M.UnidadVenta,
                    Position = O.ConsecutivoOC
                FROM QVOrdenCompra AS M
                LEFT JOIN OrdenesCompra AS O ON O.Consecutivo = M.Consecutivo AND O.Articulo = M.Articulo AND O.CantidadPedida = M.CantidadPedida
                WHERE M.Consecutivo = '${consecutivo}'
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de la orden compra', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los datos de la orden compra',
                error
            );
        }
    }

    const updateCostoOrdenCompra = async (cadenaConexion = '', newCosto = 0, position = 0, consecutivo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                UPDATE OrdenesCompra SET CostoPedido = ${newCosto} WHERE ConsecutivoOC = ${position} AND Consecutivo = '${consecutivo}'
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            if (result[1] === 0)
                return createContentError('No se pudo actualizar el costo verifique el consecutivo y el articulo', result);
            return createContentAssert('Costo actualizado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar el costo de la orden de compra: ' + error,
                error
            );
        }
    }

    const updateMassiveCostosOrdenCompra = async (cadenaConexion = '', query = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(query, QueryTypes.UPDATE);
            dbmssql.closeConexion();
            if (result[1] === 0)
                return createContentError('No se pudieron actualizar los costos verifique los consecutivos y los articulos', result);
            return createContentAssert('Se actualizo un total de: ' + result[1] + ' costos', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar los costos de la orden de compra: ' + error,
                error
            );
        }
    }

    const getSolicitudes = async (cadenaConexion = '', dateAt = '20000101 00:00:00.000', dateTo = '20000101 00:00:00.000') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE SPASUC2014;

                SELECT
                    *
                FROM PedidosMaestro
                WHERE (Fecha BETWEEN CAST('${dateAt} 00:00:00.000' AS DATETIME) AND CAST('${dateTo} 23:59:59.999' AS DATETIME))
                    -- AND Estatus = 'PEDIDO ENVIADO'
                ORDER BY Fecha DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Solicitudes de Pedidos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los datos de los pedidos de mayoristas',
                error
            );
        }
    }

    const getSentencePedido = (sucursal = 'VICTORIA', pedido = 37, hostDatabase, type = 'View') => {
    const insertView = type === 'View' ? '' : 'INSERT INTO CA2015.dbo.cotizacionesExistencias';
    const sentence = 
        `
        DECLARE @Sucursal NVARCHAR(20) = '${sucursal}';
        DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZARAGOZA' THEN 2 WHEN @Sucursal = 'ENRIQUEZ' THEN 5 WHEN @Sucursal = 'VICTORIA' THEN 3 WHEN @Sucursal = 'OLUTA' THEN 19 WHEN @Sucursal = 'JALTIPAN' THEN 7 WHEN @Sucursal = 'BODEGA' THEN 21 WHEN @Sucursal = 'SAYULA' THEN 16 WHEN @Sucursal = 'SOCONUSCO' THEN 25 ELSE 0 END;
        DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZARAGOZA' THEN 1 WHEN @Sucursal = 'ENRIQUEZ' THEN 3 WHEN @Sucursal = 'VICTORIA' THEN 2 WHEN @Sucursal = 'OLUTA' THEN 5 WHEN @Sucursal = 'JALTIPAN' THEN 4 WHEN @Sucursal = 'BODEGA' THEN 6 WHEN @Sucursal = 'SAYULA' THEN 9 WHEN @Sucursal = 'SOCONUSCO' THEN 10 ELSE 0 END;
        DECLARE @FechaInicio DATETIME = CAST('20240101' AS DATETIME);
        DECLARE @Solicitud INT = ${pedido};

        ${insertView}
        SELECT
            Sucursal = @Sucursal,
            ArticuloGLobal = A.Articulo,
            ArticuloBodega = B.Articulo, NombreBodega = B.Nombre, ExistBodega = B.ExistenciaActualRegular,
            FCBodega = C.FactorCompra, UCBodega = C.UnidadCompra, FVBodega = C.FactorVenta, UVBodega = C.UnidadVenta,
            ArticuloTienda = C.Articulo, NOmbreTienda = C.Nombre, ExistTienda = C.ExistenciaActualRegular, StockUVTienda = C.StockMinimo,
            Necesita = CASE WHEN C.ExistenciaActualRegular >= C.StockMinimo THEN 0 ELSE C.StockMinimo - C.ExistenciaActualRegular END,
            Pedido = CASE WHEN C.ExistenciaActualRegular >= C.StockMinimo THEN 0 
                ELSE 
                    CASE WHEN B.ExistenciaActualRegular >= (C.StockMinimo - C.ExistenciaActualRegular) THEN 0 ELSE ((C.StockMinimo - C.ExistenciaActualRegular) -  B.ExistenciaActualRegular) / C.FactorVenta END
                END,
            estatusRotacion = 
                CASE 
                    WHEN ((C.StockMinimo / 30)*7) > (C.FactorVenta) THEN 'ROTACION ALTA' 
                    WHEN ((C.StockMinimo / 30)*15) > (C.FactorVenta) THEN 'ROTACION MEDIA'  
                    WHEN ((C.StockMinimo / 30)*30) > (C.FactorVenta) THEN 'ROTACION BAJA'  
                    ELSE 'ROTACION LENTA' 
                END,
            Solicitud = D.Pedido, SucursaSolic = D.Sucursal, ArticuloSolic = D.Articulo, D.PeCaja, D.PePieza
        FROM (

            SELECT DISTINCT Articulo FROM (
                SELECT DISTINCT Articulo FROM SPABODEGA.dbo.QVDEMovAlmacen WHERE TipoDocumento = 'C' AND Estatus = 'E' AND Fecha >= @FechaInicio AND Tercero IN ('2110-A00-054','PRODUCTOS Z','La Y Griega','2110-S00-033','SAHUAYO','DECASA','Central Viveres','ALVISAR')
                    UNION ALL
                SELECT DISTINCT Articulo FROM SPABODEGA_202408.dbo.QVDEMovAlmacen WHERE TipoDocumento = 'C' AND Estatus = 'E' AND Fecha >= @FechaInicio AND Tercero IN ('2110-A00-054','PRODUCTOS Z','La Y Griega','2110-S00-033','SAHUAYO','DECASA','Central Viveres','ALVISAR')
                    UNION ALL
                SELECT Articulo FROM SPASUC2014.dbo.PedidosDetalle WHERE Sucursal = @Sucursal AND Pedido = @Solicitud
            ) AS Tabla
        ) AS A
        LEFT JOIN SPABODEGA.dbo.QVExistencias AS B ON B.Articulo = A.Articulo AND Almacen = 21 AND Tienda = 6
        LEFT JOIN ${hostDatabase}.dbo.QVExistencias AS C ON C.Articulo COLLATE Modern_Spanish_CI_AS = A.Articulo AND C.Almacen = @Almacen AND C.Tienda = @Tienda
        LEFT JOIN SPASUC2014.dbo.PedidosDetalle AS D ON D.Articulo = A.Articulo AND Sucursal = @Sucursal AND Pedido = @Solicitud
        WHERE NOT C.ExistenciaActualRegular IS NULL
        ORDER BY estatusRotacion
        `

        return sentence;
    }

    const getDetailsPedido = async (cadenaConexion = '', sucursal = 'VICTORIA', pedido = 37, hostDatabase = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const sentence = getSentencePedido(sucursal, pedido, hostDatabase, 'View');
            const result = await accessToDataBase.query(sentence);
            dbmssql.closeConexion();
            return createContentAssert('Detalles del Pedido', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los detalles del pedido',
                error
            );
        }
    }

    const loadCargaPedido = async (cadenaConexion = '', sucursal = 'VICTORIA', pedido = 37, hostDatabase = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const sentence = getSentencePedido(sucursal, pedido, hostDatabase, 'load');
            const result = await accessToDataBase.query(sentence, QueryTypes.INSERT);
            dbmssql.closeConexion();
            // if (result[1] === 0)
            //     return createContentError('No se pudieron actualizar los costos verifique los consecutivos y los articulos', result);
            return createContentAssert('Resultados de carga', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar subir la carga de articulos: ' + error,
                error
            );
        }
    }

    const changeStatusPedido = async (cadenaConexion = '', sucursal = 'VICTORIA', pedido = 0, estatus = 'PEDIDO ATENDIDO') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE SPASUC2014;
                UPDATE PedidosMaestro SET Estatus = '${estatus}' WHERE Sucursal = '${sucursal}' AND Pedido = ${pedido};
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            if (result[1] === 0)
                return createContentError('No se pudo actualizar el estatus verifique el consecutivo y la sucursal', result);
            return createContentAssert('Estatus Actualizado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar el estatus del pedido mayorista',
                error
            );
        }
    }

    const getCountCarga = async (cadenaConexion = '', sucursal = 'VICTORIA') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                SELECT
                    Num = COUNT(*)
                FROM CA2015.dbo.cotizacionesExistencias
                WHERE Sucursal = '${sucursal}'
                GROUP BY Sucursal
                `
            );
            dbmssql.closeConexion();
            return createContentAssert('Articulos Cargados', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los detalles de los articulos cargados',
                error
            );
        }
    }

    return {
        getDetailsCompra,
        getDetailsOrdenCompra,
        updateCostoOrdenCompra,
        updateMassiveCostosOrdenCompra,
        getSolicitudes,
        getDetailsPedido,
        loadCargaPedido,
        changeStatusPedido,
        getCountCarga,
    }
})();

module.exports = modelsMayoristas;
