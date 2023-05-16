const {
    createContentAssert,
    createResponse,
    getConnectionFrom,
    getDatabase,
    getSucursalByAlmacen,
    toMoment,
    getListConnectionByCompany,
    getSucursalByCategory,
} = require('../../../utils');
const { validateSucursal, validateFechas } = require('../../cocina/validations');
const {
    getEntradasToday,
    getTransferenciasToday,
    getArticlesByTranfer,
    getArticleByCreateAt,
    getListRevisionCosto,
    updateListCosto,
} = require('../models');
const {
    validateDate, validateListCost
} = require('../validations');

const servicesConsolidaciones = (() => {

    const getArticlesOfConsolidacion = async (sucursal = '', documento = '', dateDocument = '') => {
        sucursal = sucursal.trim().toLocaleUpperCase();
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateDate(dateDocument);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const dataBase = getDatabase(toMoment(dateDocument), sucursal);

        const response = await getArticlesByTranfer(conexion, documento, dataBase);
        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getConsolidacionesForDate = async (sucursal = '', dateStart, dateEnd) => {
        let validate = validateFechas(dateStart, dateEnd);
        if (!validate.success) return createResponse(400, validate);
        sucursal = sucursal.trim().toLocaleUpperCase();
        validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        const dateIni = toMoment(dateStart);
        const dateFin = toMoment(dateEnd);

        const conexion = getConnectionFrom(sucursal);

        const databaseStart = getDatabase(dateIni, sucursal);
        const databaseEnd = getDatabase(dateFin, sucursal);

        if (databaseStart === databaseEnd) {
            const transferenciasVerificadas =
                await getTransferenciasVerificadas(conexion, dateStart, dateEnd, databaseStart, dateIni);
            if (transferenciasVerificadas.status) return transferenciasVerificadas;

            return createResponse(200, createContentAssert('Datos encontrados', transferenciasVerificadas));
        } else {
            const transferenciasVerificadasStart =
                await getTransferenciasVerificadas(conexion, dateStart, dateEnd, databaseStart, dateIni);
            if (transferenciasVerificadasStart.status) return transferenciasVerificadasStart;

            const transferenciasVerificadasEnd =
                await getTransferenciasVerificadas(conexion, dateStart, dateEnd, databaseEnd, dateFin);
            if (transferenciasVerificadasEnd.status) return transferenciasVerificadasEnd;

            transferenciasVerificadasEnd.push(...transferenciasVerificadasStart)

            return createResponse(
                200,
                createContentAssert('Datos encontrados', transferenciasVerificadasEnd)
            );
        }
    }

    const getTransferenciasVerificadas = async (conexion, dateStart, dateEnd, database, date) => {
        const data = await getTransferenciasToday(conexion, dateStart, dateEnd, database)
        if (!data.success) return createResponse(200, data);

        const transferencias = refactorTransferencias(data.data);
        const resultEntradas = await getEntradasForDate(transferencias, dateStart, dateEnd, date);
        return verificaTransferencias(data.data, resultEntradas);
    }

    const verificaTransferencias = (transferencias, entradas) => {
        return transferencias.map((tranferencia) => {
            return {
                Fecha: tranferencia.Fecha,
                Hora: tranferencia.Hora,
                Transferencia: tranferencia.Documento,
                Articulos: tranferencia.Articulos,
                Entrada: tranferencia.Entrada,
                Referencia: tranferencia.Referencia.toUpperCase(),
                AlmacenOrigen: tranferencia.DescripcionAlmacen,
                AlmacenDestino: tranferencia.AlmacenDestinoEntrada,
                Observaciones: tranferencia.Observaciones,
                NombreCajero: tranferencia.NombreCajero,
                Estatus: getVerificacion(entradas, tranferencia),
            }
        })
    }

    const refactorTransferencias = (transferencias) => {
        const transferenciasRefactor = []
        transferencias.forEach((transferencia) => {
            const tranferenciaFinded = transferenciasRefactor.find((transf) => {
                return transf.suc === getSucursalByAlmacen(transferencia.AlmacenDestinoEntrada)
            })
            if (!tranferenciaFinded) transferenciasRefactor.push({
                suc: getSucursalByAlmacen(transferencia.AlmacenDestinoEntrada),
                listEntradas: `'${transferencia.Entrada}'`
            })
            else {
                tranferenciaFinded.listEntradas += `,'${transferencia.Entrada}'`
            }
        })
        return transferenciasRefactor;
    }

    const getVerificacion = (entradas, tranferencia) => {
        const sucursal = getSucursalByAlmacen(tranferencia.AlmacenDestinoEntrada);
        let documento = undefined;
        let offLine = false;

        entradas.forEach((entrada) => {
            if (sucursal === entrada.suc) {
                if (!entrada.success)
                    offLine = true;
                else
                    documento = entrada.data.find((doc) => doc.Documento === tranferencia.Entrada);
            }
        })
        if (offLine) return 'Sin conexion';
        return documento ? 'Exito' : 'Fallo'
    }

    const getEntradasForDate = async (transferencias, dateStart, dateEnd, dateIni) => {
        const resultEntradas = await transferencias.map(async (suc) => {

            const dat = await getEntradasToday(
                getConnectionFrom(suc.suc),
                suc.listEntradas,
                dateStart,
                dateEnd,
                getDatabase(dateIni, suc.suc)
            );
            dat.suc = suc.suc
            return dat
        })
        return await Promise.all(resultEntradas);
    }

    const getConsolidacionByCreateAt = async (dateInit = '20221206', dateEnd = '20221206') => {
        const listConexions = getListConnectionByCompany('SPA').filter((suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.');

        const resultDataArticles = listConexions.map(async (sucursal) => {
            const suc = getSucursalByCategory('SPA' + sucursal.name);
            const response = await getArticleByCreateAt(sucursal.connection, suc, dateInit, dateEnd);
            response.status = response.success ? 'Conexion Activa' : 'Sin Conexion';
            response.sucursal = sucursal.name;
            response.sucursalSiglas = suc;
            return response;
        });

        const responsesDataArticles = await Promise.all(resultDataArticles);
        const { dataArticles, resumen } = responsesDataArticles.reduce((existences,  response) => {
            existences.dataArticles.push(response);
            if (!response.success) response.data = [];
            response.data.forEach((existArt) => {
                const indexFinded = existences.resumen.findIndex((article) => article.Articulo === existArt.Articulo)
                if (indexFinded === -1) {
                    let data = {...existArt};
                    data = createExistArticle(data);
                    existences.resumen.push(data);
                } else {
                    existences.resumen[indexFinded].Sucursales[`${response.sucursalSiglas}`] = 'Encontrado';
                }
            });
            return existences;
        }, { dataArticles: [], resumen: []});

        const response = createContentAssert('Articulo por sucursal', dataArticles);
        response.resumen = resumen;

        return createResponse(200, response)
    }

    const createExistArticle = (dataArticle) => {
        const article = {
            Articulo: '', CodigoBarras: '', Nombre: '', Relacion: '', Fecha: '', Hora: '',
            Sucursales: {
                ZR: 'No Encontrado',
                VC: 'No Encontrado',
                ER: 'No Encontrado',
                OU: 'No Encontrado',
                SY: 'No Encontrado',
                JL: 'No Encontrado',
                BO: 'No Encontrado',
            }
        }
        article.Articulo = dataArticle.Articulo;
        article.CodigoBarras = dataArticle.CodigoBarras;
        article.Nombre = dataArticle.Nombre;
        article.Relacion = dataArticle.Relacion;
        article.Fecha = dataArticle.FechaAlta;
        article.Hora = dataArticle.HoraAlta;
        article.Sucursales[`${dataArticle.Suc}`] = 'Encontrado';
        return article;
    }

    const getListCostTransfers = async (sucursal = '', date = '') => {
        sucursal = sucursal.trim().toLocaleUpperCase();
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateDate(date);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const response = await getListRevisionCosto(conexion, sucursal, date);
        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const updateCostsTranfers = async (sucursal = '', listCostos) => {
        sucursal = sucursal.trim().toLocaleUpperCase();
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateListCost(listCostos);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        let whenLastCost = '';
        let articles = '';

        listCostos.forEach((costo, position) => {
            whenLastCost += `\nWHEN '${costo.Article}' THEN ${costo.CostoUnitario}`;
            if (position > 0) articles += ',';
            articles += `'${costo.Article}'`;
        });

        const response = await updateListCosto(conexion, sucursal, whenLastCost, articles);
        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getArticlesOfConsolidacion,
        getConsolidacionesForDate,
        getConsolidacionByCreateAt,
        getListCostTransfers,
        updateCostsTranfers,
    }
})();

module.exports = servicesConsolidaciones;