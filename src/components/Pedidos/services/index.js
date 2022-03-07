const {
    createResponse,
    getConnectionFrom,
} = require('../../../utils');
const {
    validateSucursal,
    validateSucursalWithCompany,
} = require('../validations');
const {
    getPedidosEnBodega,
    getPedidosBySucursal,
    getListaArticulosByArticulo,
} = require('../models');

const ServicesPedidos = (() => {

    const getOrdersBodega = async (database = 'SPASUC2021', sucursal = 'BO') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getPedidosEnBodega(conexion, database);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getOrdersBySucursal = async (database = 'SPASUC2021', sucursal = '', source = 'BO') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getPedidosBySucursal(conexion, sucursal, database);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticlesByArticle = async (database = 'SPASUC2021', source = 'BO', sucursal = '', folio = '', article = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulosByArticulo(conexion, article, folio, sucursal, database);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getOrdersBodega,
        getOrdersBySucursal,
        getArticlesByArticle
    }
})();

module.exports = ServicesPedidos;
