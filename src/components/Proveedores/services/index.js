const {
    createResponse,
    getConnectionFrom,
} = require('../../../utils');
const {} = require('../validations');
const {} = require('../utils');
const {
    getAllProviders,
} = require('../models');

const ServicesProveedores = (() => {

    const getProveedores = async () => {
        const conexion = getConnectionFrom('BO');
        const response  = await getAllProviders(conexion);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    return {
        getProveedores,
    }
})();

module.exports = ServicesProveedores;