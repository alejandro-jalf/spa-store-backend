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
    getOffersByMasterOffer,
    createMasterOffers,
    createOffers,
    updateDataMasterOffer,
    updateOffer,
    updateStatusMasterOffer,
    deleteMasterOffer,
    deleteOffer,
    getDetailsArticleByArticle,
    getDetailsArticleByName,
} = require('../models');

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

    const getMasterOffersBySuc = async (sucursal = 'ALL') => {
        let validate = validateSucursal(sucursal.toUpperCase());
        if (!validate.success) return createResponse(400, validate);

        if (sucursal.toUpperCase() === 'ALL') {
            const response = await getAllMasterOffers(conexionDB);
            if (!response.success) return createResponse(400, response);
            return createResponse(200, response);
        } else {
            const response = await getAllMasterOffersOf(conexionDB, sucursal.toUpperCase());
            if (!response.success) return createResponse(400, response);
            return createResponse(200, response);
        }
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
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (response.data[0].sucursal !== sucursal.toUpperCase())
            return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = response.data[0].estatus;
        const statusNew = bodyMaster.status;

        validate = validateStatus(statusNew, statusActual, utilsOfertas);
        if (!validate.success) return createResponse(200, validate);

        if (statusNew === statusActual)
            return createResponse(200, createContentError('El estatus actual y el nuevo son iguales'))

        const dateinit = toMoment(response.data[0].fechainicio + ' 23:59:59.999');
        if (statusNew === OFERTA_ENVIADA) {
            if (dateinit.isBefore(getDateActual()))
                return createResponse(
                    200,
                    createContentError('La fecha de inicio no puede ser menor que la fecha actual')
                )
        }

        response = await getOffersByMasterOffer(conexionDB, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (statusNew === OFERTA_ENVIADA && response.data.length === 0)
            return createResponse(
                200, 
                createContentError('No puede enviar la oferta debido a que no contiene articulos')
            )

        bodyMaster.fechamodificado = getDateActual().format('YYYY-MM-DD');

        response = await updateStatusMasterOffer(conexionDB, uuidmaster, bodyMaster);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const validaArticlesOffer = (uuid_maestro = '') => {

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

        response = await getOffersByMasterOffer(conexionDB, uuidmaster);
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

        if (rounded < 0.08)
            return createResponse(200, createContentError('La oferta no puede ser menor del 8% de la utilidad'));

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

        response = await getOffersByMasterOffer(conexionDB, uuidmaster);
        if (!response.success) return createResponse(400, response);
        const existArticle = response.data.find((article) => article.articulo === articulo)

        if (!existArticle)
            return createResponse(200, createContentError('Este articulo no esta en esta lista oferta'))

        const conexion = getConnectionFrom(sucursal);
        response = await getDetailsArticleByArticle(conexion, sucursal, articulo);

        const utilidad = 1 - (response.data[0].UltimoCosto / bodyArticle.oferta);
        const rounded = parseFloat(roundTo(utilidad));

        if (rounded < 0.08)
            return createResponse(200, createContentError('La oferta no puede ser menor del 8% de la utilidad'));


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
        if (statusActual !== OFERTA_CREADA)
            return createResponse(
                200,
                createContentError(`No puede eliminar el articulo debido a que el estatus cambio a ${utilsOfertas.parseStatusOferta(statusActual)}`)
            );

        response = await deleteOffer(conexionDB, articulo, uuidmaster);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    return {
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