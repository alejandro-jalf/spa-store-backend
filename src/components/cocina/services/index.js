const { createContentAssert, createResponse, createContentError } = require('../../../utils');
const { connectionZaragoza } = require('../../../configs');
const { validateBodyFecha } = require('../validations');
const { getVentasByFecha } = require('../models');

const ServicesCocina = (() => {

    const mainRoute = () => {
        const response = createContentAssert("Ruta principal de cocina");
        return createResponse(200, response);
    }

    const getSalesByDate = async (sucursal = '', bodyFechas) => {
        const validate = validateBodyFecha(bodyFechas);
        if (!validate.success)
            return createResponse(400, validate);
        const { fechaInicial , fechaFinal } = bodyFechas;

        const response = await getVentasByFecha(connectionZaragoza, sucursal, fechaInicial, fechaFinal);
        if (!response.success)
            return createResponse(400, response);
        return createResponse(200, response);
    }

    return {
        mainRoute,
        getSalesByDate,
    }
})();

module.exports = ServicesCocina;