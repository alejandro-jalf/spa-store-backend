const {
    createResponse,
    getConnectionFrom,
    createContentError,
    getDateActual,
    createContentAssert,
    getListConnectionByCompany,
    getSucursalByCategory,
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
    getArticlesByNameOnline,
} = require('../models');
const { getStatusConections } = require('../../General/services');

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
        if (sucursal === 'ER' || sucursal === 'SY') return DB;
        const dateActual = getDateActual();
        const yearOld = parseInt(getDateActual().format('YYYY')) - 1;
        const monthActual = parseInt(getDateActual().format('MM'));
        if (company === 'SPA') {
            if (monthActual > 8) return `${DB}_${dateActual.format('YYYY')}08`
            return `${DB}_${yearOld}08`
        } else {
            const sucGlobal = {
                ER: 'ER', SY: 'SY', SB: 'SA', ST: 'SA', SU: 'SU', MA: 'SU', RE: 'SU', CO: 'SU'
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

    const updateStocksBySucursal = async (sucursal, company, dataUpdates) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);
        sucursal = sucursal.toUpperCase()

        validate = validateSucursalWithCompany(sucursal, company);
        if (!validate.success)
            return createResponse(400, validate);
        company = company.toUpperCase();

        const conexion = getConnectionFrom(sucursal);

        let script = '';
        const updates = dataUpdates.data;
        updates.forEach((update) => {
            script += `UPDATE Existencias SET StockMinimo = ${update.StockMinimo}, StockMaximo = ${update.StockMaximo} WHERE Almacen = ${dataUpdates.Almacen} AND Articulo = '${update.Articulo}'; `;
        });

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

    const getExistenciasByNombre = async (nombre = '') => {
        const statusConections = await getStatusConections('SPA', false);
        const dataTest = statusConections.response.data;
        const server = dataTest
            .map((test) => {
                if (test.conexion === 'BODEGA') test.priority = 0;
                else if (test.conexion === 'VICTORIA') test.priority = 1;
                else if (test.conexion === 'ZARAGOZA') test.priority = 2;
                else if (test.conexion === 'OLUTA') test.priority = 3;
                else if (test.conexion === 'JALTIPAN') test.priority = 4;
                else if (test.conexion === 'ENRIQUEZ') test.priority = 5;
                else if (test.conexion === 'SAYULA') test.priority = 6;
                return test
            })
            .sort((a,b) => a.priority < b.priority ? -1 : 1)
            .reduce((acumServer, test) => {
                if (!acumServer && test.success) acumServer = test
                return acumServer;
            }, undefined)

        if (!server) return createResponse(200, createContentError('No hay conexion con los servidores'))
        const listConexions = getListConnectionByCompany('SPA')
        const conexion = listConexions.filter((sucursal) => sucursal.name === server.conexion);
        const articulos = await getArticlesByNameOnline(conexion[0].connection, getSucursalByCategory('SPA' + conexion[0].name), '*aceite*');

        articulos.count = articulos.data.length;
        articulos.status = 'Online';
        articulos.sucursal = server.conexion;
        return createResponse(200, articulos)
    }

    return {
        getPriceArticle,
        getDataForStocks,
        updateStocksBySucursal,
        getArticlesWithLowUtilities,
        getDetallesArticulosByCodificador,
        getExistenciasByNombre,
    }
})();

module.exports = ServicesArticulos;