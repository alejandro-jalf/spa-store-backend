const {
    createResponse,
    createContentError,
    createContentAssert,
    getListConnectionByCompany,
    getConnectionFrom,
    getDateActual,
    getDatabaseBySuc,
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
    createBackup,
    createZipBackup,
} = require('../models');

const ServicesGeneral = (() => {
    
    const getStatusConections = async (empresa, tortillerias = true) => {
        let validate = validateEmpresa(empresa);
        if (!validate.success) return createResponse(400, validate);

        let listConnection = getListConnectionByCompany(empresa);
        if (!tortillerias) listConnection = listConnection.filter(
            (conecction) => conecction.name !== 'SAYULA T.' && conecction.name !== 'TORTILLERIA F.'
        )

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

        validate = validateNumber(promMensual, 'Promedio mensual');
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const response = await calculaFoliosSucursal(conexion, sucursal, promMensual);
        if (!response.success) return createResponse(400, response);

        return createResponse(200, response);
    }

    const updateFoliosAvailable = async (sucursal, serie = '', newFolio) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateNumber(newFolio, 'Nuevo folio final');
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const response = await updateFoliosSucursal(conexion, serie, newFolio);
        if (!response.success) return createResponse(400, response);

        if (response.data[1] === 0) return createResponse(
            400,
            createContentError("No se pudo actualizar el folio, verifique que el nuevo folio final sea mayor que el actual o que la sucursal sea la correcta")
        );

        return createResponse(200, response);
    }

    const generateBackup = async (sucursal, source = 'C:\\backups', name = 'bakcup.bak', db) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const dataBase = db || getDatabaseBySuc(sucursal);
        let nameRefactor = name;

        if (name === 'bakcup.bak')
            nameRefactor = getDatabaseBySuc(sucursal.toUpperCase()) + '_' + getDateActual().format('YYYYMMDDHHmm') + '.BAK'

        const response = await createBackup(conexion, source, nameRefactor, dataBase);
        if (!response.success) return createResponse(400, response);

        return createResponse(200, response);
    }

    const zipBackup = async (sucursal, source = 'C:\\backups\\') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const response = await createZipBackup(conexion, source);
        if (!response.success) return createResponse(400, response);

        return createResponse(200, response);
    }

    return {
        getStatusConections,
        getCalculateFolios,
        updateFoliosAvailable,
        generateBackup,
        zipBackup,
    }
})();

module.exports = ServicesGeneral;