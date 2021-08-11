const { createContentAssert, createResponse } = require('../../../utils');
const { connectionZaragoza } = require('../../../configs');
const { validateBodyFecha, validateSucursal } = require('../validations');
const { getVentasByFecha, getAllVentasByFecha } = require('../models');

const ServicesCocina = (() => {

    const mainRoute = () => {
        const response = createContentAssert("Ruta principal de cocina");
        return createResponse(200, response);
    }

    const getSalesByDate = async (sucursal = '', bodyFechas) => {
        let validate = validateBodyFecha(bodyFechas);
        if (!validate.success)
            return createResponse(400, validate);
        const { fechaInicial , fechaFinal } = bodyFechas;

        validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        const response = await getVentasByFecha(connectionZaragoza, sucursal, fechaInicial, fechaFinal);
        if (!response.success)
            return createResponse(400, response);
        return createResponse(200, response);
    }

    const getAllSalesByDate = async (sucursal = '', bodyFechas) => {
        let validate = validateBodyFecha(bodyFechas);
        if (!validate.success)
            return createResponse(400, validate);
        const { fechaInicial , fechaFinal } = bodyFechas;

        validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        const response = await getAllVentasByFecha(connectionZaragoza, sucursal, fechaInicial, fechaFinal);
        if (!response.success)
            return createResponse(400, response);
        return createResponse(200, response);
    }

    return {
        mainRoute,
        getSalesByDate,
        getAllSalesByDate,
    }
})();

module.exports = ServicesCocina;