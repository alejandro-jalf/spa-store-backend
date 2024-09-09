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

    return {
        getDetailsCompra,
        getDetailsOrdenCompra,
        updateCostoOrdenCompra,
        updateMassiveCostosOrdenCompra,
        getSolicitudes,
    }
})();

module.exports = modelsMayoristas;
