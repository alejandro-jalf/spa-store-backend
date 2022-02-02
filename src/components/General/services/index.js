const {
    createResponse,
    createContentError,
    createContentAssert,
    getListConnectionByCompany,
} = require('../../../utils');
const { validateEmpresa } = require('../validations');
const { testConnection } = require('../models');
const { listConnectionCaasa } = require('../../../configs')

const ServicesGeneral = (() => {
    
    const getStatusConections = async (empresa) => {
        let validate = validateEmpresa(empresa);
        if (!validate.success) return createResponse(400, validate)

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

    return {
        getStatusConections,
    }
})();

module.exports = ServicesGeneral;