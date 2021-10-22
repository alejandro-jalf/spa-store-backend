const {
    createResponse,
    getConnectionFrom,
    createContentError,
    completeDateHour,
    getDateActual,
} = require('../../../utils');
const {
    validateSucursal,
    validateBodyCreateArticle,
    validateBodyCreateMasterOffer,
    validateBodyUpdateArticle,
    validateBodyUpdateMasterOffer,
    validateBodyUpdateStatusMasterOffer,
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
const conexionPostgres = require('../../../services/dbpostgres');

const ServicesCocina = (() => {
    
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
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        if (sucursal === 'ALL') {
            const response = await getAllMasterOffers(conexionPostgres);
            if (!response.success) return createResponse(400, response);
            return createResponse(200, response);
        } else {
            const response = await getAllMasterOffersOf(connectionPostgres, sucursal);
            if (!response.success) return createResponse(400, response);
            return createResponse(200, response);
        }
    }

    const getArticlesByUUIDMaster = async (uuidmaster) => {
        const response = await getOffersByMasterOffer(connectionPostgres, uuidmaster);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }

    const addMasterOffer = async (bodyMaster) => {
        
        const date = new Date();
        const now = getDateActual();
        console.log(date, now);

        // let validate = validateBodyCreateMasterOffer(bodyMaster);
        // if (!validate.success) return createResponse(400, validate);

        // const uuid = createUUID();
        // bodyMaster.uuid = uuid;


        // const response = await createMasterOffers(connectionPostgres, bodyMaster);
        // if (!response.success) return createResponse(400, response);

        // return createResponse(201, response);
    }

    return {
        getOfferValidation,
        getMasterOffersBySuc,
        getArticlesByUUIDMaster,
        addMasterOffer,
    }
})();

module.exports = ServicesCocina;