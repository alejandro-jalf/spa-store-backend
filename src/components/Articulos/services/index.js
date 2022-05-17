const {
    createResponse,
    getConnectionFrom,
    createContentError,
    getDateActual,
} = require('../../../utils');
const { dataBase } = require('../../../configs');
const {
    validateSucursal,
    validateCodigoBarras,
    validateSucursalWithCompany,
    validateDayMinAndMax,
    validatePorcentaje,
} = require('../validations');
const {
    getPrecio,
    calculateStocks,
    updateStockByScripts,
    getArticulosConUtilidadBaja,
    getDetailsArticleForCodificador,
} = require('../models');

const ServicesArticulos = (() => {

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

    const getArticlesWithLowUtilities = async (sucursal, porcentajeUtilidad = 10) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validatePorcentaje(porcentajeUtilidad);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getArticulosConUtilidadBaja(conexion, sucursal, (porcentajeUtilidad / 100));

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getDatabaseOldBySucAndCompany = (sucursal, company) => {
        let DB = dataBase[`${sucursal.toUpperCase()}`];
        const dateActual = getDateActual();
        const yearOld = parseInt(getDateActual().format('YYYY')) - 1;
        const monthActual = parseInt(getDateActual().format('MM'));
        if (company === 'SPA') {
            if (monthActual > 8) return `${DB}_${dateActual.format('YYYY')}08`
            return `${DB}_${yearOld}08`
        } else {
            const sucGlobal = {
                EN: 'EN', SA: 'SA', SB: 'SA', ST: 'SA', SU: 'SU', MA: 'SU', RE: 'SU', CO: 'SU'
            }
            const dbGlobal = sucGlobal[`${sucursal.toUpperCase()}`]
            DB = dataBase[`${dbGlobal}`];
            if (monthActual > 11) return `${DB}_${dateActual.format('YYYY')}11`
            return `${DB}_${yearOld}11`
        }
    }

    const getDataForStocks = async (sucursal, company, daymin = 30, daymax = 45) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);
        sucursal = sucursal.toUpperCase()

        validate = validateSucursalWithCompany(sucursal, company);
        if (!validate.success)
            return createResponse(400, validate);
        company = company.toUpperCase()

        validate = validateDayMinAndMax(daymin, daymax);
        if (!validate.success)
            return createResponse(400, validate);

        const databaseOld = getDatabaseOldBySucAndCompany(sucursal, company);

        const conexion = getConnectionFrom(sucursal);

        const response = await calculateStocks(conexion, sucursal, databaseOld, daymin, daymax);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateStocksBySucursal = async (sucursal, company, script = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);
        sucursal = sucursal.toUpperCase()

        validate = validateSucursalWithCompany(sucursal, company);
        if (!validate.success)
            return createResponse(400, validate);
        company = company.toUpperCase();

        const conexion = getConnectionFrom(sucursal);

        const response = await updateStockByScripts(conexion, script);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const getDetallesArticulosByCodificador = async (sucursal, codigoBarras) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateCodigoBarras(codigoBarras);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getDetailsArticleForCodificador(conexion, sucursal, codigoBarras);

        if (!response.success) return createResponse(400, response)
        if (response.data.length === 0)
            return createResponse(400, createContentError('No se encontro el articulo'))
        return createResponse(200, response)
    }

    return {
        getPriceArticle,
        getDataForStocks,
        updateStocksBySucursal,
        getArticlesWithLowUtilities,
        getDetallesArticulosByCodificador,
    }
})();

module.exports = ServicesArticulos;