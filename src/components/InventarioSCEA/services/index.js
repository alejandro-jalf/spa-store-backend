const {
    createResponse,
    getConnectionFrom,
    getHostBySuc,
    getDatabaseBySuc,
    createContentError,
} = require('../../../utils');
const {
    validateBodyUpdateRequest,
    validateStatusRequest,
    validateCreatedBy,
} = require('../validations');
const { validateSucursal } = require('../../../validations');
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

        const response = await createSolicitud(conexionSol, sucursal.toUpperCase(), creadoPor);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateRequestArticle = async (uuid = '', body = {}) => {
        let validate = validateBodyUpdateRequest(body);
        if (!validate.success) return createResponse(400, validate);

        const response = await updateSolicitud(conexionSol, uuid, body);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateStatusRequest = async (uuid = '', estatus = '', Articulo = '') => {
        let validate = validateStatusRequest(estatus);
        if (!validate.success) return createResponse(400, validate);
        let response;

        const updateOnlyStatus = async () => {
            return await updateStatus(conexionSol, uuid, estatus.toUpperCase(), '');
        }

        const updateStatusAndArticle = async () => {
            if (Articulo.trim() === '') return createContentError('El articulo no puede ser vacio')
            return await updateStatus(conexionSol, uuid, estatus.toUpperCase(), Articulo);
        }

        if (estatus.toUpperCase() === 'ATENDIDO')
            response = await updateStatusAndArticle();
        else response = await updateOnlyStatus();

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const deleteRequest = async (uuid = '') => {
        const response = await deleteSolicitud(conexionSol, uuid);

        if (!response.success) return createResponse(400, response);
        if (response.data[1] === 0)
            return createResponse(
                400,
                createContentError('No se pudo eliminar la solicitud. Recuerde que para poder eliminar una solicitud tiene que estar cancelada')
            )
        return createResponse(200, response)
    }

    return {
        getRequestArticles,
        getRequestArticle,
        createRequestArticle,
        updateRequestArticle,
        updateStatusRequest,
        deleteRequest,
    }
})();

module.exports = ServicesPedidos;
