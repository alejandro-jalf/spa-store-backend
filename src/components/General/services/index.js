const {
    createResponse,
    createContentError,
    createContentAssert,
    getListConnectionByCompany,
} = require('../../../utils');
const {
    validateEmpresa,
    validateSucursal,
    validateNumber,
} = require('../validations');
const {
    testConnection,
    calculaFoliosSucursal,
    updateFoliosSucursal,
} = require('../models');

const ServicesGeneral = (() => {
    
    const getStatusConections = async (empresa) => {
        let validate = validateEmpresa(empresa);
        if (!validate.success) return createResponse(400, validate);

        const listConnection = getListConnectionByCompany(empresa);

        const arrayResponse = listConnection.map(async (connection) => {
            const response = await testConnection(connection.connection);
            return {
                success: response.success,
                conexion: connection.name,
                message: response.success ? 'Conexion exitosa' : 'Conexion fallida'
            }
        })
        const resultTests = await Promise.all(arrayResponse);
        return createResponse(
            200,
            createContentAssert('Test de Conexion', resultTests)
        );
    }

    const getCalculateFolios = async (sucursal, promMensual) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateNumber(promMensual);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const response = await calculaFoliosSucursal(conexion, sucursal, promMensual);
        if (!response.success) return createResponse(400, response);

        return createResponse(200, response);
    }

    const updateFoliosAvailable = async (sucursal, newFolio) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateNumber(newFolio);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const response = await updateFoliosSucursal(conexion, sucursal, newFolio);
        if (!response.success) return createResponse(400, response);

        return createResponse(200, response);
    }

    return {
        getStatusConections,
        getCalculateFolios,
        updateFoliosAvailable,
    }
})();

module.exports = ServicesGeneral;