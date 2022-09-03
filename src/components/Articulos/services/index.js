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
    getArticlesWithShoppsBySkuOnline,
    getArticlesWithShoppsBySkuOffline,
} = require('../models');
const { getStatusConections } = require('../../General/services');
const { getComprasByDate, mejorPrecio, cantidadCompras, precioPromedio } = require('../utils');

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
        const articulos = await getArticlesByNameOnline(conexion[0].connection, getSucursalByCategory('SPA' + conexion[0].name), nombre);

        articulos.count = articulos.data.length;
        articulos.status = 'Online';
        articulos.sucursal = server.conexion;
        return createResponse(200, articulos)
    }

    const getDetallesExistenciasBySku = async (sku) => {
        if (!sku) return createResponse(400, createContentError('Debe enviar un sku'));
        const listConexions = getListConnectionByCompany('SPA').filter((suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.')
        const yearActual = getDateActual().format('YYYY');

        const resultOnline = listConexions.map(async (sucursal) => {
            const suc = getSucursalByCategory('SPA' + sucursal.name);
            const response = await getArticlesWithShoppsBySkuOnline(sucursal.connection, suc, sku);
            response.status = response.success ? 'Online' : 'Offline';
            response.sucursal = sucursal.name;
            // console.log('Servicios***********************************************', response.data[0].compras);
            response.compras = response.success ? getComprasByDate('20200101', yearActual + '1231', response.data[0].compras) : [];
            // console.log('Servicios 2***********************************************', response.compras);
            return response;
        });

        const responsesOnline = await Promise.all(resultOnline);
        const responsesFails = responsesOnline.filter((response) => !response.success);

        if (responsesFails.length === 0) return sumExistenciasTotales(responsesOnline);

        const bodegaFail = responsesFails.find((suc) => suc.sucursal === 'BODEGA');
        if (bodegaFail) return sumExistenciasTotales(responsesOnline);

        const listConnectionFails = listConexions.filter((sucursal) => {
            const sucFinded = responsesFails.find((suc) => suc.sucursal === sucursal.name);
            return !!sucFinded;
        });
        const responsesSuccess = responsesOnline.filter((response) => response.success);
        const resultOffline = listConnectionFails.map(async (sucursal) => {
            const suc = getSucursalByCategory('SPA' + sucursal.name);
            const response = await getArticlesWithShoppsBySkuOffline(sucursal.connection, suc, sku);
            response.status = response.success ? 'Online' : 'Offline';
            response.sucursal = sucursal.name;
            response.compras = response.success ? getComprasByDate('20200101', yearActual + '1231', response.compras) : [];
            return response;
        });

        const responsesOffline = await Promise.all(resultOffline);
        const allResponses = [...responsesSuccess, ...responsesOffline];
        return sumExistenciasTotales(allResponses);
    }

    const sumExistenciasTotales = (responses = []) => {
        let data = {
            Articulo: null,
            Nombre: null,
            Relacion: null,
            ExistActualUC: null,
            Stock30UC: null,
            CostoExistActual: null,
            CostoPromedioUC: null,
            existencias: [],
            proveedores: {
                mejorPrecio: null,
                cantidadCompras: null,
                precioPromedio: null,
            },
        };

        responses.forEach((response) => {
            const dataResponses = (response.success && response.data.length === 1) ? response.data[0] : {};
            dataResponses.status = response.status;
            dataResponses.sucursal = response.sucursal;
            dataResponses.compras = response.compras.success ? response.compras.data : [];
            if (response.success) {
                data.Articulo = dataResponses.Articulo;
                data.Nombre = dataResponses.Nombre;
                data.Relacion = dataResponses.Relacion;
            }
            data.ExistActualUC += (dataResponses.ExistUC && dataResponses.ExistUC !== null) ? dataResponses.ExistUC : 0;
            data.Stock30UC += (dataResponses.Stock30UC && dataResponses.Stock30UC !== null) ? dataResponses.Stock30UC : 0;
            data.CostoExistActual += (dataResponses.CostoExist && dataResponses.CostoExist !== null) ? dataResponses.CostoExist : 0;

            data.existencias.push(dataResponses);
        });

        data.CostoPromedioUC = data.ExistActualUC === 0 ?  0 : data.CostoExistActual / data.ExistActualUC;

        const yearActual = getDateActual().format('YYYY');
        const filtro = responses.find((response) => {
            const dataResponses = (response.success && response.data.length === 1) ? response.data[0] : {};
            return dataResponses.Almacen === 21
        });
    
        const arrayCompras = filtro ? filtro.compras.data : [];
        let compras = getComprasByDate('20200101', yearActual + '1231', arrayCompras);
        compras = !compras.success ? [] : compras.data;

        // console.log('Compras***************************************', compras);
        const bestPrice = mejorPrecio(compras);
        data.proveedores.mejorPrecio = bestPrice.success ? bestPrice.data : {};
        const countShopps = cantidadCompras(compras);
        data.proveedores.cantidadCompras = countShopps.success ? countShopps.data : [];
        const averagePrice = precioPromedio(compras);
        data.proveedores.precioPromedio = averagePrice.success ? averagePrice.data : 0.0;

        return createResponse(200, createContentAssert('Existencias en sucursales', data))
    }

    return {
        getPriceArticle,
        getDataForStocks,
        updateStocksBySucursal,
        getArticlesWithLowUtilities,
        getDetallesArticulosByCodificador,
        getExistenciasByNombre,
        getDetallesExistenciasBySku,
    }
})();

module.exports = ServicesArticulos;