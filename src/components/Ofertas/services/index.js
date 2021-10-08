const {
    createResponse,
    getConnectionFrom,
    createContentError,
    completeDateHour,
} = require('../../../utils');
const { validateSucursal } = require('../validations');
const { getValidOffers } = require('../models');

const ServicesCocina = (() => {
    
    const getOfferValidation = async (sucursal) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const date = new Date();
        const now = `${date.getFullYear()}${completeDateHour(date.getMonth() + 1)}${completeDateHour(date.getDate())}`

        const response  = await getValidOffers(conexion, sucursal, now);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getOfferValidation,
    }
})();

module.exports = ServicesCocina;