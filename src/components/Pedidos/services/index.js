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
    getListaArticulosByNombre,
    getListaArticulosByDias,
    getListaArticulos,
    getReporteListaArticulos,
    addPedido,
} = require('../models');

const ServicesPedidos = (() => {

    const getOrdersBodega = async (database = 'SPASUC2021', source = 'BO') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getPedidosEnBodega(conexion, database);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getOrdersBySucursal = async (database = 'SPASUC2021', source = 'BO', sucursal = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getPedidosBySucursal(conexion, database, sucursal);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticlesByArticle = async (database = 'SPASUC2021', source = 'BO', sucursal = '', folio = '', article = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulosByArticulo(conexion, database, article, folio, sucursal);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticlesByName = async (database = 'SPASUC2021', source = 'BO', sucursal = '', folio = '', name = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulosByNombre(conexion, database, name, folio, sucursal);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticlesByDias = async (database = 'SPASUC2021', source = 'BO', sucursal = '', folio = '', dias = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulosByDias(conexion, database, sucursal, folio, dias);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticles = async (database = 'SPASUC2021', source = 'BO', sucursal = '', folio = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulos(conexion, database, sucursal, folio);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getReportArticles = async (database = 'SPASUC2021', source = 'BO', sucursal = '', folio = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getReporteListaArticulos(conexion, database, sucursal, folio);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const createPedido = async (database = 'SPASUC2021', source = 'BO', sucursal = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await addPedido(conexion, database, sucursal);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getOrdersBodega,
        getOrdersBySucursal,
        getArticlesByArticle,
        getArticlesByName,
        getArticlesByDias,
        getArticles,
        getReportArticles,
        createPedido,
    }
})();

module.exports = ServicesPedidos;
