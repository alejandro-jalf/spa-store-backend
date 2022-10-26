const {
    createResponse,
    getConnectionFrom,
} = require('../../../utils');
const {
    validateSucursal,
} = require('../validations');
const {
    getDetailsCompra, getDetailsOrdenCompra,
} = require('../models');

const ServicesMayoristas = (() => {
    
    const getDocumentCompra = async (sucursal = '', documento = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getDetailsCompra(conexion, documento);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getDocumentOrden = async (sucursal = '', consecutivo = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getDetailsOrdenCompra(conexion, consecutivo);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getDocumentCompra,
        getDocumentOrden,
    }
})();

module.exports = ServicesMayoristas;