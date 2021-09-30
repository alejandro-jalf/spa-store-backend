const {
    createResponse,
    getConnectionFrom,
    createContentError,
} = require('../../../utils');
const { validateSucursal, validateCodigoBarras } = require('../validations');
const { getPrecio } = require('../models');

const ServicesCocina = (() => {
    
    const getPriceArticle = async (sucursal, codigoBarras) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateCodigoBarras(codigoBarras);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getPrecio(conexion, sucursal, codigoBarras);

        if (!response.success) return createResponse(400, response)
        if (response.data.length === 0)
            return createResponse(400, createContentError('No se encontro el articulo'))
        return createResponse(200, response)
    }

    return {
        getPriceArticle,
    }
})();

module.exports = ServicesCocina;