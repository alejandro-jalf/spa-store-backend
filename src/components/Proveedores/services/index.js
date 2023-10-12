const {
    createResponse,
    getConnectionFrom,
} = require('../../../utils');
const { validateSucursal } = require('../../../validations');
const {} = require('../utils');
const {
    getAllProviders,
    getAllRequestProviders,
    getRequestProvider,
    getRequestBySuc,
} = require('../models');

const ServicesProveedores = (() => {
    const conexionSol = getConnectionFrom('ZR');

    const getProveedores = async (sucursal = 'BO') => {
        sucursal = sucursal.toUpperCase().trim() === 'ALL' ? 'ZR' : sucursal;
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getAllProviders(conexion);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const getSolicitudesProveedor = async (sucursal) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const response = sucursal === 'ALL' ? await getAllRequestProviders(conexionSol) : await getRequestBySuc(conexionSol, sucursal);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const getSolicitudProveedor = async (uuid = '') => {
        const response = await getArticuloSolicitado(conexionSol, uuid);

        if (!response.success) return createResponse(400, response);
        if (response.data.length === 0) return createResponse(200, createContentError('No existe esta solicitud'))
        return createResponse(200, response)
    }

    return {
        getProveedores,
        getSolicitudesProveedor,
    }
})();

module.exports = ServicesProveedores;