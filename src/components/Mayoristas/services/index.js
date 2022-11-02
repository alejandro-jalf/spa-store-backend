const {
    createResponse,
    getConnectionFrom,
} = require('../../../utils');
const {
    validateSucursal, validateUpdateCostoOrden,
} = require('../validations');
const {
    getDetailsCompra, getDetailsOrdenCompra, updateCostoOrdenCompra,
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
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getDetailsOrdenCompra(conexion, consecutivo);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const updateCostoOrden = async (sucursal = '', consecutivo = '', bodyUpdateCostoOrden = {}) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateUpdateCostoOrden(bodyUpdateCostoOrden);
        if (!validate.success) return createResponse(400, validate);

        const newCosto = bodyUpdateCostoOrden.TotalPactado / bodyUpdateCostoOrden.CantidadRegular;

        const conexion = getConnectionFrom(sucursal);
        const response  = await updateCostoOrdenCompra(conexion, newCosto, bodyUpdateCostoOrden.Position,  consecutivo);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getDocumentCompra,
        getDocumentOrden,
        updateCostoOrden,
    }
})();

module.exports = ServicesMayoristas;