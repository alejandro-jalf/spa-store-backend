const {
    createResponse,
    getConnectionFrom,
    getHostBySuc,
    getDatabaseBySuc,
    createContentError,
} = require('../../../utils');
const {
    validateSucursal,
    validateBodyUpdateRequest,
    validateStatusRequest,
    validateCreatedBy,
} = require('../validations');
const {
    getSolicitudesAll,
    getSolicitudesBySuc,
    getArticuloSolicitado,
    createSolicitud,
    updateSolicitud,
    updateStatus,
    deleteSolicitud,
} = require('../models');

const ServicesPedidos = (() => {
    const conexionSol = getConnectionFrom('ZR');

    const getRequestArticles = async (sucursal) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const response = sucursal === 'ALL' ? await getSolicitudesAll(conexionSol) : await getSolicitudesBySuc(conexionSol, sucursal);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const getRequestArticle = async (uuid = '') => {
        const response = await getArticuloSolicitado(conexionSol, uuid);

        if (!response.success) return createResponse(400, response);
        if (response.data.length === 0) return createResponse(200, createContentError('No existe esta solicitud'))
        return createResponse(200, response)
    }

    const createRequestArticle = async (sucursal = '', creadoPor = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateCreatedBy(creadoPor);
        if (!validate.success) return createResponse(400, validate);

        const response  = await createSolicitud(conexionSol, sucursal.toUpperCase(), creadoPor);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateRequestArticle = async (uuid = '', body = {}) => {
        let validate = validateBodyUpdateRequest(body);
        if (!validate.success) return createResponse(400, validate);

        const response  = await updateSolicitud(conexionSol, uuid, body);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    return {
        getRequestArticles,
        getRequestArticle,
        createRequestArticle,
        updateRequestArticle,
    }
})();

module.exports = ServicesPedidos;
