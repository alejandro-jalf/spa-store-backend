const {
    createResponse,
    getConnectionFrom,
    createContentError,
    completeDateHour,
    getDateActual,
    createUUID,
    createContentAssert,
    toMoment,
    roundTo,
    getTiendaBySucursal,
} = require('../../../utils');
const {
    validateSucursal,
    validateBodyCreateArticle,
    validateBodyCreateMasterOffer,
    validateBodyUpdateArticle,
    validateBodyUpdateMasterOffer,
    validateBodyUpdateStatusMasterOffer,
    validateStatus,
} = require('../validations');
const {
    getValidOffers,
    getAllMasterOffers,
    getAllMasterOffersOf,
    getMasterOffers,
    createMasterOffers,
    createOffers,
    updateDataMasterOffer,
    updateOffer,
    updateStatusMasterOffer,
    deleteMasterOffer,
    deleteOffer,
    getDetailsArticleByArticle,
    getDetailsArticleByName,
    createOffersInWincaja,
    getTimedOffersByDate,
    getOnlyOffersByMasterOffer,
    getDataArticlesWithOffers,
} = require('../models');
const { response } = require('express');

const utilsOfertas = (() => {
    const parseStatusOferta = (status) => {
        switch (status) {
            case 0:
                return 'Creada';
            case 1:
                return 'Enviada';
            case 2:
                return 'En proceso';
            case 3:
                return 'Programada';
            case 4:
                return 'Cancelada';
            default:
                return 'Estatus invalido';
        }
    }

    return {
        parseStatusOferta
    }
})()

const ServicesOfertas = (() => {
    const conexionDB = getConnectionFrom('ZR');
    const OFERTA_CREADA = 0;
    const OFERTA_ENVIADA = 1;
    const OFERTA_EN_PROCESO = 2;
    const OFERTA_PROGRAMADA = 3;
    const OFERTA_CANCELADA = 4;
    
    const getOfferValidation = async (sucursal) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const date = new Date();
        const now = `${date.getFullYear()}${completeDateHour(date.getMonth() + 1)}${completeDateHour(date.getDate())}`

        const response  = await getValidOffers(conexion, sucursal, now);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }

    const getCheckArticlesOffers = async (sucursal, uuidmaster = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(conexionDB, uuidmaster);
        const offersMaster = response.data[0];
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (offersMaster.sucursal !== sucursal.toUpperCase())
            return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const conexion = getConnectionFrom(sucursal);
        const dateInitObject = offersMaster.fechaInicio;
        const dateEndObject = offersMaster.fechaFin;
        const dateInitString = `${dateInitObject.getFullYear()}${completeDateHour(dateInitObject.getMonth() + 1)}${completeDateHour(dateInitObject.getDate())}`;
        const dateEndString = `${dateEndObject.getFullYear()}${completeDateHour(dateEndObject.getMonth() + 1)}${completeDateHour(dateEndObject.getDate())}`;

        response = await getOnlyOffersByMasterOffer(conexionDB, sucursal, uuidmaster);
        if (!response.success) return createResponse(400, response);
        const articles = response.data.reduce((acumArticle, article, index) => {
            if (index > 0) acumArticle += ',';
            acumArticle += `'${article.articulo}'`;
            return acumArticle;
        }, '')

        const articlesInOffers = response.data;

        response  = await getTimedOffersByDate(conexion, sucursal, dateInitString, dateEndString, articles);
        if (!response.success) return createResponse(400, response);

        const resultValidations = articlesInOffers.map((article) => {
            const articleFinded = response.data.find((articleOffered) => articleOffered.Articulo === article.articulo)
            if (articleFinded) article.Offered = true
            else article.Offered = false
            return article
        })
        response.data = resultValidations

        return createResponse(200, response);
    }

    const getDetailsArticleByLike = async (sucursal, name) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        const conexion = getConnectionFrom(sucursal);
        const nameRefactor = name.replace(/\*/g, '%');
        const response  = await getDetailsArticleByName(conexion, sucursal, nameRefactor);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }

    const getDetailsArticleByArticulo = async (sucursal, articulo) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getDetailsArticleByArticle(conexion, sucursal, articulo);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }

    const getMasterOffersBySuc = async (sucursal = 'ALL', limit = 300) => {
        limit = parseInt(limit)
        let validate = validateSucursal(sucursal.toUpperCase());
        if (!validate.success) return createResponse(400, validate);

        let response;
        if (sucursal.toUpperCase() === 'ALL') {
            response = await getAllMasterOffers(conexionDB, limit);
            if (!response.success) return createResponse(400, response);
        } else {
            response = await getAllMasterOffersOf(conexionDB, sucursal.toUpperCase(), limit);
            if (!response.success) return createResponse(400, response);
        }

        const mastersOffers = [];
        response.data.forEach((master, index) => {
            if (index === 0) mastersOffers.push(master)
            else {
                const indexMaster = mastersOffers.findIndex((mOffer) => mOffer.uuid === master.uuid)
                if (indexMaster !== -1)
                    mastersOffers[indexMaster].Articulos = mastersOffers[indexMaster].Articulos + master.Articulos;
                else mastersOffers.push(master)
            }
        });
        const offersToped = mastersOffers.filter((offer, position) => limit === 0 ? true : position < limit)
        response.data = offersToped;

        return createResponse(200, response);
    }

    const addMasterOffer = async (bodyMaster) => {
        let validate = validateBodyCreateMasterOffer(bodyMaster);
        if (!validate.success) return createResponse(400, validate);
        bodyMaster.sucursal = bodyMaster.sucursal.toUpperCase();

        const uuid = createUUID();
        bodyMaster.uuid = uuid;
        bodyMaster.fechaInicio = bodyMaster.fechaInicio.split('T')[0]
        bodyMaster.fechaFin = bodyMaster.fechaFin.split('T')[0]
        bodyMaster.fechaAlta = getDateActual().format('YYYY-MM-DD')

        const response = await createMasterOffers(conexionDB, bodyMaster);
        if (!response.success) return createResponse(400, response);

        response.data = {
            result: response.data,
            newOffer: bodyMaster,
        }

        return createResponse(201, response);
    }

    const changeStatusMasterOffer = async (sucursal, uuidmaster, bodyMaster) => {

        let validate = validateBodyUpdateStatusMasterOffer(bodyMaster);
        if (!validate.success) return createResponse(400, validate);

        validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(conexionDB, uuidmaster);
        const offersMaster = response.data[0];
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (offersMaster.sucursal !== sucursal.toUpperCase())
            return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = offersMaster.estatus;
        const statusNew = bodyMaster.status;

        validate = validateStatus(statusNew, statusActual, utilsOfertas);
        if (!validate.success) return createResponse(200, validate);

        if (statusNew === statusActual)
            return createResponse(200, createContentError('El estatus actual y el nuevo son iguales'))

        const dateInitObject = offersMaster.fechaInicio;
        const dateEndObject = offersMaster.fechaFin;
        const dateInitString = `${dateInitObject.getFullYear()}-${completeDateHour(dateInitObject.getMonth() + 1)}-${completeDateHour(dateInitObject.getDate())}`;
        const dateEndString = `${dateEndObject.getFullYear()}-${completeDateHour(dateEndObject.getMonth() + 1)}-${completeDateHour(dateEndObject.getDate())}`;
        const dateInit = toMoment(dateInitString + ' 23:59:59.999');
        const dateEnd = toMoment(dateEndString + ' 23:59:59.999');
        if (statusNew !== OFERTA_CANCELADA && dateInit.isBefore(getDateActual()))
            return createResponse(
                200,
                createContentError('La fecha de inicio no puede ser menor que la fecha actual')
            )

        switch (statusNew) {
            case OFERTA_ENVIADA:
                const articlesOfOffers = await getOnlyOffersByMasterOffer(conexionDB, sucursal, uuidmaster);
                if (!articlesOfOffers.success) return createResponse(400, articlesOfOffers);
                if (articlesOfOffers.data.length === 0)
                    return createResponse(
                        200, 
                        createContentError('No puede enviar la oferta debido a que no contiene articulos')
                    )
                break;

            case OFERTA_PROGRAMADA:
                const articlesOffers = await getOnlyOffersByMasterOffer(conexionDB, sucursal, uuidmaster);
                if (!articlesOffers.success) return createResponse(400, articlesOffers);

                const articles = articlesOffers.data.reduce((acumArticle, article, index) => {
                    if (index > 0) acumArticle += ', ';
                    acumArticle += `'${article.articulo}'`;
                    return acumArticle;
                }, '')

                response = await validaArticlesOffer(sucursal, dateInitString, dateEndString, articles, articlesOffers.data);
                if (!response.success) return createResponse(200, response);
                const conexionSucursal = getConnectionFrom(sucursal);

                let querysInserts = '';
                const tienda = getTiendaBySucursal(sucursal.toUpperCase());
                articlesOffers.data.forEach((article, indexArticle) => {
                    const dataArticle = dataForValidate.data.find((dataArt) => dataArt.Articulo === article.articulo)
                    if (!dataArticle) article.Descuento = undefined;
                    else article.Descuento = dataArticle.Precio1IVAUV - article.oferta;
                    if (indexArticle > 0) querysInserts += ',';
                    querysInserts += `
                    (
                        @Consecutivo + 1 + ${indexArticle}, CAST((@Consecutivo + 1 + ${indexArticle}) AS nvarchar) + REPLACE(CONVERT(nvarchar, GETDATE(), 108), ':', ''),
                        '${article.articulo}', ${article.Descuento}, 0, 1, @FechaInicial, @FechaFinal, 0.0, 0.0,
                        GETDATE(), GETDATE(), 0 ,${tienda}, 0, 0.00, 0
                    )
                    `;
                })
                const bodyOffers = {
                    sucursal,
                    fechaInicio: dateInit.format('YYYYMMDD'),
                    fechaFin: dateEnd.format('YYYYMMDD'),
                    articulos: querysInserts
                }
                response = await createOffersInWincaja(conexionSucursal, bodyOffers);
                if (!response.success) return createResponse(400, response);
        
            default:
                break;
        }

        bodyMaster.fechamodificado = getDateActual().format('YYYY-MM-DD');

        response = await updateStatusMasterOffer(conexionDB, uuidmaster, bodyMaster);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const getValidationArticlesOffersForWincaja = async (sucursal = '', uuid_maestro = '') => {
        const validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(conexionDB, uuid_maestro);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (response.data[0].sucursal.toUpperCase() !== sucursal.toUpperCase())
            return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const dateInitObject = response.data[0].fechaInicio;
        const dateEndObject = response.data[0].fechaFin;
        const fechaInicio = `${dateInitObject.getFullYear()}-${completeDateHour(dateInitObject.getMonth() + 1)}-${completeDateHour(dateInitObject.getDate())}`;
        const fechaFin = `${dateEndObject.getFullYear()}-${completeDateHour(dateEndObject.getMonth() + 1)}-${completeDateHour(dateEndObject.getDate())}`;

        const articlesOffers = await getOnlyOffersByMasterOffer(conexionDB, sucursal, uuid_maestro);
        if (!articlesOffers.success) return createResponse(400, articlesOffers);

        const articles = articlesOffers.data.reduce((acumArticle, article, index) => {
            if (index > 0) acumArticle += ', ';
            acumArticle += `'${article.articulo}'`;
            return acumArticle;
        }, '')

        response = await validaArticlesOffer(sucursal, fechaInicio, fechaFin, articles, articlesOffers.data);
        return createResponse(200, response);
    }

    let dataForValidate;
    const validaArticlesOffer = async (
        sucursal = '', fechaInicio = '2000-01-01', fechaFin = '2000-01-01', articles, dataOffers
    ) => {
        const now = getDateActual().format('YYYYMMDD');
        const conexion = getConnectionFrom(sucursal);
        const dateStartNew = toMoment(fechaInicio);
        const dateEndNew = toMoment(fechaFin);

        dataForValidate = await getDataArticlesWithOffers(conexion, sucursal, now, articles);
        if (!dataForValidate.success) return createResponse(400, dataForValidate);

        const articleValidated = dataOffers.map((articleOfOffers) => {
            const articleData = dataForValidate.data.find((art) => art.Articulo === articleOfOffers.articulo);
            if (articleData) {
                const UtilidadOferta = 1 - (articleData.UltimoCostoNeto / articleOfOffers.oferta);
                if (articleData.FechaInicial !== null && articleData.FechaFinal !== null) {
                    const dateStarObject = articleData.FechaInicial;
                    const dateStartOld = `${dateStarObject.getFullYear()}-${completeDateHour(dateStarObject.getMonth() + 1)}-${completeDateHour(dateStarObject.getDate())}`;
                    const dateEndObject = articleData.FechaFinal;
                    const dateEndOld = `${dateEndObject.getFullYear()}-${completeDateHour(dateEndObject.getMonth() + 1)}-${completeDateHour(dateEndObject.getDate())}`;
    
                    if (
                        dateStartNew.isBetween(dateStartOld, dateEndOld, 'days', '[]') ||
                        dateEndNew.isBetween(dateStartOld, dateEndOld, 'days', '[]') ||
                        toMoment(dateStartOld).isBetween(dateStartNew, dateEndNew, 'days', '[]') ||
                        toMoment(dateEndOld).isBetween(dateStartNew, dateEndNew, 'days', '[]')
                    ) articleOfOffers.OfertaFechaVigente = 'SI';
                    else articleOfOffers.OfertaFechaVigente = 'NO';
                } else articleOfOffers.OfertaFechaVigente = 'NO';
                articleOfOffers.Articulo = articleOfOffers.articulo;
                articleOfOffers.Nombre = articleOfOffers.nombre;
                articleOfOffers.Precio1IVAUV = articleData.Precio1IVAUV;
                articleOfOffers.Oferta = articleOfOffers.oferta;
                articleOfOffers.UltimoCosto = articleData.UltimoCostoNeto;
                articleOfOffers.UtilidadOferta = UtilidadOferta;
                articleOfOffers.OfertaValida = UtilidadOferta >= 0.1 ? 'SI' : 'NO';
                articleOfOffers.OfertaMayor = (articleData.Precio1IVAUV - articleOfOffers.oferta) < 0.0000001 ? 'NO' : 'SI';
                articleOfOffers.OfertaCaduca = articleData.OfertaCaduca;
                articleOfOffers.FechaInicial = articleData.FechaInicial;
                articleOfOffers.FechaFinal = articleData.FechaFinal;
            } else {
                articleOfOffers.Articulo = '';
                articleOfOffers.Nombre = '';
                articleOfOffers.Precio1IVAUV = 0.0;
                articleOfOffers.Oferta = 0.0;
                articleOfOffers.UltimoCosto = 0.0;
                articleOfOffers.UtilidadOferta = 0.0;
                articleOfOffers.OfertaValida = 'SI';
                articleOfOffers.OfertaMayor = 'SI';
                articleOfOffers.OfertaCaduca = 'NO';
                articleOfOffers.OfertaFechaVigente = 'NO';
                articleOfOffers.FechaInicial = null;
                articleOfOffers.FechaFinal = null;
            }
            return articleOfOffers;
        })

        const articlesWithFails = articleValidated.filter((article) => (
            article.OfertaValida === 'NO' ||
            article.OfertaCaduca === 'NO' ||
            article.OfertaMayor === 'NO' ||
            article.OfertaFechaVigente === 'SI'
        ));
        if (articlesWithFails.length > 0) return createContentError(
                'Hay articulos con detalles, Verifica los detalles para poder programar las ofertas',
                articlesWithFails
            )
        return createContentAssert('Articulos Validados y listos para programar', articlesWithFails);
    }

    const changeDataMasterOffer = async (sucursal, uuidmaster, bodyMaster) => {
        let validate = validateBodyUpdateMasterOffer(bodyMaster);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(conexionDB, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'))
        if (response.data[0].sucursal !== sucursal.toUpperCase())
        return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = response.data[0].estatus;
        const statusNew = bodyMaster.status;
        bodyMaster.editable = bodyMaster.editable ? 1 : 0

        if (statusActual !== OFERTA_CREADA && statusActual !== OFERTA_EN_PROCESO)
            return createResponse(
                200,
                createContentError(`No puede modificar la oferta maestro debido a que el estatus cambio a ${utilsOfertas.parseStatusOferta(statusActual)}`)
            );

        if (statusActual !== statusNew) {
            validate = validateStatus(statusNew, statusActual, utilsOfertas);
            if (!validate.success) return createResponse(200, validate);
        }

        bodyMaster.fechaInicio = bodyMaster.fechaInicio.split('T')[0]
        bodyMaster.fechaFin = bodyMaster.fechaFin.split('T')[0]
        bodyMaster.fechaModificado = getDateActual().format('YYYY-MM-DD');

        response = await updateDataMasterOffer(conexionDB, uuidmaster, bodyMaster);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const removeMasterOffer = async (sucursal, uuidmaster) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(conexionDB, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (response.data[0].sucursal !== sucursal.toUpperCase())
            return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = response.data[0].estatus;
        if (statusActual !== OFERTA_CANCELADA)
            return createResponse(
                200,
                createContentError(`No puede eliminar la oferta maestro debido a que el estatus cambio a ${utilsOfertas.parseStatusOferta(statusActual)}`)
            );

        response = await deleteMasterOffer(conexionDB, uuidmaster, sucursal);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const getArticlesByUUIDMaster = async (uuidmaster) => {
        let response = await getMasterOffers(conexionDB, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));

        const sucursal = response.data[0].sucursal;

        response = await getOnlyOffersByMasterOffer(conexionDB, sucursal, uuidmaster);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }

    const createArticleOffer = async (sucursal, bodyArticle) => {
        let validate = validateBodyCreateArticle(bodyArticle);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(conexionDB, bodyArticle.uuid_maestro);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (response.data[0].estatus !== OFERTA_CREADA)
            return createResponse(
                200,
                createContentError('No puede agregar articulos a la lista de oferta debido a que esta ' + utilsOfertas.parseStatusOferta(response.data[0].estatus))
            );

        const conexion = getConnectionFrom(sucursal);
        response = await getDetailsArticleByArticle(conexion, sucursal, bodyArticle.articulo);

        const dateActual = getDateActual().format('YYYY-MM-DD');
        bodyArticle.fechaAlta = dateActual;
        bodyArticle.fechaModificado = dateActual;
        bodyArticle.modificadoPor = bodyArticle.creadoPor;

        const utilidad = 1 - (response.data[0].UltimoCosto / bodyArticle.oferta);
        const rounded = parseFloat(roundTo(utilidad));

        if (rounded < 0.1)
            return createResponse(200, createContentError('La oferta no puede ser menor del 10% de la utilidad'));

        response = await createOffers(conexionDB, bodyArticle);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const changeDataOffer = async (sucursal, uuidmaster, articulo, bodyArticle) => {
        let validate = validateBodyUpdateArticle(bodyArticle);
        if (!validate.success) return createResponse(400, validate);

        validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(conexionDB, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'))
        if (response.data[0].sucursal !== sucursal.toUpperCase())
            return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = response.data[0].estatus;

        if (statusActual !== OFERTA_CREADA && statusActual !== OFERTA_EN_PROCESO)
            return createResponse(
                200,
                createContentError(`No puede modificar la oferta maestro debido a que el estatus cambio a ${utilsOfertas.parseStatusOferta(statusActual)}`)
            );

        bodyArticle.fechaModificado = getDateActual().format('YYYY-MM-DD');

        response = await getOnlyOffersByMasterOffer(conexionDB, sucursal, uuidmaster);
        if (!response.success) return createResponse(400, response);
        const existArticle = response.data.find((article) => article.articulo === articulo)

        if (!existArticle)
            return createResponse(200, createContentError('Este articulo no esta en esta lista oferta'))

        const conexion = getConnectionFrom(sucursal);
        response = await getDetailsArticleByArticle(conexion, sucursal, articulo);

        const utilidad = 1 - (response.data[0].UltimoCosto / bodyArticle.oferta);
        const rounded = parseFloat(roundTo(utilidad));

        if (rounded < 0.1)
            return createResponse(200, createContentError('La oferta no puede ser menor del 10% de la utilidad'));

        response = await updateOffer(conexionDB, articulo, uuidmaster, bodyArticle);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const removeArticleOffer = async (sucursal, articulo, uuidmaster) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(conexionDB, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (response.data[0].sucursal !== sucursal.toUpperCase())
            return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = response.data[0].estatus;
        if (statusActual !== OFERTA_CREADA && statusActual !== OFERTA_EN_PROCESO)
            return createResponse(
                200,
                createContentError(`No puede eliminar el articulo debido a que el estatus cambio a ${utilsOfertas.parseStatusOferta(statusActual)}`)
            );

        response = await deleteOffer(conexionDB, articulo, uuidmaster);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    return {
        getValidationArticlesOffersForWincaja,
        getCheckArticlesOffers,
        changeStatusMasterOffer,
        changeDataMasterOffer,
        getOfferValidation,
        getMasterOffersBySuc,
        getArticlesByUUIDMaster,
        addMasterOffer,
        removeMasterOffer,
        createArticleOffer,
        removeArticleOffer,
        changeDataOffer,
        getDetailsArticleByLike,
        getDetailsArticleByArticulo,
    }
})();

module.exports = ServicesOfertas;