const {
    createResponse,
    getConnectionFrom,
    createContentError,
} = require('../../../utils');
const {
    validateSucursal,
    validateAlmacenTienda,
    validateDate,
    validateDates
} = require('../validations');
const {
    getInventoryByShopAndWarehouse,
    GetSalesForDate,
} = require('../models');

const ServicesReportes = (() => {
    
    const getInventoryCloseYear = async (sucursal = '', tienda = 0, almacen = 0) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateAlmacenTienda(tienda);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateAlmacenTienda(almacen);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getInventoryByShopAndWarehouse(conexion, tienda, almacen);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }
    
    const getVentasPorDia = async (sucursal = '', FechaIni = '', FechaFin = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(FechaIni);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(FechaFin);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDates(FechaIni, FechaFin);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await GetSalesForDate(conexion, sucursal, FechaIni, FechaFin);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getInventoryCloseYear,
        getVentasPorDia,
    }
})();

module.exports = ServicesReportes;