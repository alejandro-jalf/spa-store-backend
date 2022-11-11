const {
    createResponse,
    getConnectionFrom,
} = require('../../../utils');
const { validateSucursal } = require('../validations');
const {} = require('../utils');
const {
    getAllProviders,
} = require('../models');

const ServicesProveedores = (() => {

    const getProveedores = async (sucursal = 'BO') => {
        sucursal = sucursal.toUpperCase().trim() === 'ALL' ? 'ZR' : sucursal;
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getAllProviders(conexion);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    return {
        getProveedores,
    }
})();

module.exports = ServicesProveedores;