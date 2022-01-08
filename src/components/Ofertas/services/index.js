const {
    createResponse,
    getConnectionFrom,
    createContentError,
    completeDateHour,
    getDateActual,
    createUUID,
    createContentAssert,
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
} = require('../models');
const { connectionPostgres } = require('../../../configs');

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
    
    const getOfferValidation = async (sucursal) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const date = new Date();
        const now = `${date.getFullYear()}${completeDateHour(date.getMonth() + 1)}${completeDateHour(date.getDate())}`

        const response  = await getValidOffers(conexion, sucursal, now);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getMasterOffersBySuc = async (sucursal = 'ALL') => {
        let validate = validateSucursal(sucursal.toUpperCase());
        if (!validate.success) return createResponse(400, validate);

        if (sucursal.toUpperCase() === 'ALL') {
            const response = await getAllMasterOffers(connectionPostgres);
            if (!response.success) return createResponse(400, response);
            return createResponse(200, response);
        } else {
            const response = await getAllMasterOffersOf(connectionPostgres, sucursal.toUpperCase());
            if (!response.success) return createResponse(400, response);
            return createResponse(200, response);
        }
    }

    const getArticlesByUUIDMaster = async (uuidmaster) => {
        let response = await getMasterOffers(connectionPostgres, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));

        response = await getOffersByMasterOffer(connectionPostgres, uuidmaster);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }

    const addMasterOffer = async (bodyMaster) => {
        bodyMaster.sucursal = bodyMaster.sucursal.toUpperCase();
        let validate = validateBodyCreateMasterOffer(bodyMaster);
        if (!validate.success) return createResponse(400, validate);

        const uuid = createUUID();
        bodyMaster.uuid = uuid;
        bodyMaster.fechaInicio = bodyMaster.fechaInicio.split('T')[0]
        bodyMaster.fechaFin = bodyMaster.fechaFin.split('T')[0]
        bodyMaster.fechaAlta = getDateActual().format('YYYY-MM-DD')

        const response = await createMasterOffers(connectionPostgres, bodyMaster);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const changeStatusMasterOffer = async (sucursal, uuidmaster, bodyMaster) => {
        let validate = validateBodyUpdateStatusMasterOffer(bodyMaster);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(connectionPostgres, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (response.data[0].sucursal !== sucursal.toUpperCase())
        return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = response.data[0].status;
        const statusNew = bodyMaster.status;

        validate = validateStatus(statusNew, statusActual, utilsOfertas);
        if (!validate.success) return createResponse(200, validate);

        if (statusNew === statusActual)
            return createResponse(200, createContentError('El estatus actual y el nuevo son iguales'))

        bodyMaster.fechamodificado = getDateActual().format('YYYY-MM-DD');

        response = await updateStatusMasterOffer(connectionPostgres, uuidmaster, bodyMaster);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const changeDataMasterOffer = async (sucursal, uuidmaster, bodyMaster) => {
        let validate = validateBodyUpdateMasterOffer(bodyMaster);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(connectionPostgres, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'))
        if (response.data[0].sucursal !== sucursal.toUpperCase())
        return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = response.data[0].status;
        const statusNew = bodyMaster.status;

        if (statusActual !== 0)
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

        response = await updateDataMasterOffer(connectionPostgres, uuidmaster, bodyMaster);
        if (!response.success) return createResponse(400, response);

        return createResponse(201, response);
    }

    const removeMasterOffer = async (sucursal, uuidmaster) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        let response = await getMasterOffers(connectionPostgres, uuidmaster);
        if (!response.success) return createResponse(400, response);
        if (response.data.length <= 0) return createResponse(200, createContentError('el uuid maestro no existe'));
        if (response.data[0].sucursal !== sucursal.toUpperCase())
            return createResponse(200, createContentError('el uuid maestro no pertenece a la sucursal: ' + sucursal.toUpperCase()));

        const statusActual = response.data[0].status;
        if (statusActual !== 4)
            return createResponse(
                200,
                createContentError(`No puede eliminar la oferta maestro debido a que el estatus cambio a ${utilsOfertas.parseStatusOferta(statusActual)}`)
            );

        response = await deleteMasterOffer(connectionPostgres, uuidmaster, sucursal);
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
    }
})();

module.exports = ServicesOfertas;