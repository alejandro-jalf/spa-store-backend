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
    getExistenceByProvider,
} = require('../models');
const {
    getComprasByDate,
    mejorPrecio,
    cantidadCompras,
    precioPromedio
} = require('../utils');

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
        const listConexions = getListConnectionByCompany('SPA').filter((suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.');

        const articleOfSubsidiarys = listConexions.map(async (sucursal) => {
            const suc = getSucursalByCategory('SPA' + sucursal.name);
            const response = await getArticlesByNameOnline(sucursal.connection, suc, nombre);
            return response;
        });

        const responsesArticles = await Promise.all(articleOfSubsidiarys);
        const serversOffline = responsesArticles.filter((server) => !server.success);
        if (serversOffline.length === responsesArticles.length)
            return createResponse(200, createContentError('No hay conexion con los servidores'));

        const data = responsesArticles.reduce((articles, responseSuc) => {
            if (responseSuc.success) {
                responseSuc.data.forEach((article) => {
                    const articleFinded = articles.find((articleInsert) => articleInsert.Articulo === article.Articulo);
                    if (!articleFinded) articles.push(article);
                });
            }
            return articles;
        }, []).sort((a, b) => a.Articulo > b.Articulo ? 1 : -1);

        const articulos = createContentAssert('Articulos por nombre ' + nombre, {});
        articulos.status = 'Online';
        articulos.count = data.length;
        articulos.data = data
        return createResponse(200, articulos)
    }

    const getDetallesExistenciasBySku = async (sku) => {
        if (!sku) return createResponse(400, createContentError('Debe enviar un sku'));
        const listConexions = getListConnectionByCompany('SPA').filter((suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.');
        const yearActual = getDateActual().format('YYYY');

        const resultOnline = listConexions.map(async (sucursal) => {
            const suc = getSucursalByCategory('SPA' + sucursal.name);
            const response = await getArticlesWithShoppsBySkuOnline(sucursal.connection, suc, sku);
            response.status = response.success ? 'Online' : 'Offline';
            response.sucursal = sucursal.name;
            response.compras = response.success ? getComprasByDate('20200101', yearActual + '1231', response.data[0].compras) : [];
            return response;
        });

        const responsesOnline = await Promise.all(resultOnline);
        const responsesFails = responsesOnline.filter((response) => !response.success);

        if (responsesFails.length === 0) return sumExistenciasTotales(responsesOnline);

        const bodegaFail = responsesFails.find((suc) => suc.sucursal === 'BODEGA');
        if (bodegaFail) return sumExistenciasTotales(responsesOnline);

        let connectionBodega = null;
        const listConnectionFails = listConexions.filter((sucursal) => {
            const sucFinded = responsesFails.find((suc) => suc.sucursal === sucursal.name);
            if (sucursal.name === 'BODEGA') connectionBodega = sucursal.connection;
            return !!sucFinded;
        });
        const resultOffline = listConnectionFails.map(async (sucursal) => {
            const suc = getSucursalByCategory('SPA' + sucursal.name);
            const response = await getArticlesWithShoppsBySkuOffline(connectionBodega, suc, sku);
            response.status = 'Offline';
            response.sucursal = sucursal.name;
            response.compras = response.success ? getComprasByDate('20200101', yearActual + '1231', response.data[0].compras) : [];
            return response;
        });
        const responsesOffline = await Promise.all(resultOffline);

        const allResponses = responsesOnline.map((sucursal) => {
            const sucFinded = responsesOffline.find((sucOffline) => sucOffline.sucursal === sucursal.sucursal)
            return sucFinded || sucursal;
        });

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
                if (dataResponses.Articulo) data.Articulo = dataResponses.Articulo;
                if (dataResponses.Nombre) data.Nombre = dataResponses.Nombre;
                if (dataResponses.Relacion) data.Relacion = dataResponses.Relacion;
            }
            data.ExistActualUC += (dataResponses.ExistUC && dataResponses.ExistUC !== null) ? dataResponses.ExistUC : 0;
            data.Stock30UC += (dataResponses.Stock30UC && dataResponses.Stock30UC !== null) ? dataResponses.Stock30UC : 0;
            data.CostoExistActual += (dataResponses.CostoExist && dataResponses.CostoExist !== null) ? dataResponses.CostoExist : 0;

            data.existencias.push(dataResponses);
        });

        data.CostoPromedioUC = data.ExistActualUC === 0 ?  0 : data.CostoExistActual / data.ExistActualUC;

        const yearActual = getDateActual().format('YYYY');
        const sucBodega = responses.find((response) => {
            const dataResponses = (response.success && response.data.length === 1) ? response.data[0] : {};
            return dataResponses.Almacen === 21
        });
    
        if (sucBodega) {
            const arrayCompras = sucBodega.compras.data;
            let compras = getComprasByDate('20200101', yearActual + '1231', arrayCompras);
            compras = compras.success ? compras.data : [];

            if (compras.length !== 0 && typeof arrayCompras === "object") {
                data.proveedores.mejorPrecio = mejorPrecio(compras).data;
                data.proveedores.cantidadCompras = cantidadCompras(compras).data;
                data.proveedores.precioPromedio = precioPromedio(compras).data;
            }
        }

        return createResponse(200, createContentAssert('Existencias en sucursales', data))
    }

    const getExistenciasByProveedor = async (proveedor, sucursal = 'ALL') => {
        if (!proveedor) return createResponse(400, createContentError('Debe enviar un proveedor'));

        if (sucursal != 'ALL') {
            const conexion = getConnectionFrom(sucursal);
            const response = await getExistenceByProvider(conexion, sucursal, proveedor);
            response.resumen = [];
            return createResponse(200, response);
        } else {
            const listConexions = getListConnectionByCompany('SPA').filter((suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.');

            const resultExistencias = listConexions.map(async (sucursal) => {
                const suc = getSucursalByCategory('SPA' + sucursal.name);
                const response = await getExistenceByProvider(sucursal.connection, suc, proveedor);
                response.status = response.success ? 'Online' : 'Offline';
                response.sucursal = sucursal.name;
                return response;
            });
    
            const responsesExistencias = await Promise.all(resultExistencias);
            const { dataExistencias, resumen } = responsesExistencias.reduce((existences,  response) => {
                if (response.success) {
                    existences.dataExistencias.push(...response.data);
                    if (existences.resumen.length === 0)
                        response.data.forEach((existArt) => { existences.resumen.push({...existArt}); });
                    else {
                        response.data.forEach((existArt) => {
                            const indexFinded = existences.resumen.findIndex((article) => article.Articulo === existArt.Articulo)
                            if (indexFinded === -1) existences.resumen.push({...existArt});
                            else {
                                const ExistenciaUV = existences.resumen[indexFinded].ExistenciaActualRegular;
                                const ExistenciaUC = existences.resumen[indexFinded].ExistenciaActualUC;

                                const ExistenciaUVAcum = ExistenciaUV !== null ? ExistenciaUV : 0;
                                const ExistenciaUCAcum = ExistenciaUC !== null ? ExistenciaUC : 0;

                                const ExistenciaUVNew = existArt.ExistenciaActualRegular !== null ? existArt.ExistenciaActualRegular : 0;
                                const ExistenciaUCNew = existArt.ExistenciaActualUC !== null ? existArt.ExistenciaActualUC : 0;

                                existences.resumen[indexFinded].ExistenciaActualRegular = ExistenciaUVAcum + ExistenciaUVNew;
                                existences.resumen[indexFinded].ExistenciaActualUC = ExistenciaUCAcum + ExistenciaUCNew;
                            }
                        });
                    }
                } else {
                    insertFailedConnection(existences.dataExistencias, response);
                    insertFailedConnection(existences.resumen, response);
                }
                return existences;
            }, { dataExistencias: [], resumen: []});

            const response = createContentAssert('Existencias por sucursal', dataExistencias);
            response.resumen = resumen;
    
            return createResponse(200, response)
        }
    }

    const insertFailedConnection = (arrayExistencia = [], response = {}) => {
        arrayExistencia.push({
            Suc: response.sucursal, 
            Articulo: 'Offline',
            Nombre: 'Offline',
            Relacion: 'Offline',
            ExistenciaActualRegular: 'Offline',
            ExistenciaActualUC: 'Offline',
        });
    }

    return {
        getPriceArticle,
        getDataForStocks,
        updateStocksBySucursal,
        getArticlesWithLowUtilities,
        getDetallesArticulosByCodificador,
        getExistenciasByNombre,
        getDetallesExistenciasBySku,
        getExistenciasByProveedor,
    }
})();

module.exports = ServicesArticulos;