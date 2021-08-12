const { createContentAssert, createResponse, getConnectionFrom } = require('../../../utils');
const { validateSucursal, validateFechas } = require('../validations');
const { getVentasByFecha, getAllVentasByFecha } = require('../models');

const ServicesCocina = (() => {

    const mainRoute = () => {
        const response = createContentAssert("Ruta principal de cocina");
        return createResponse(200, response);
    }

    const getSalesByDate = async (sucursal = '', fechaInicial, fechaFinal) => {
        let validate = validateFechas(fechaInicial, fechaFinal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);
        
        const conexion = getConnectionFrom(sucursal);

        const response = await getVentasByFecha(conexion, sucursal, fechaInicial, fechaFinal);
        if (!response.success)
            return createResponse(400, response);
        return createResponse(200, response);
    }

    const getAllSalesByDate = async (sucursal = '', fechaInicial, fechaFinal) => {
        let validate = validateFechas(fechaInicial, fechaFinal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const response = await getAllVentasByFecha(conexion, sucursal, fechaInicial, fechaFinal);
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