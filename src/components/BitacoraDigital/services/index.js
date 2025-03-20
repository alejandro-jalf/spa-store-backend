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
    validateNumber,
    validateFolio,
} = require('../validations');
const { validateSucursal, validateFecha } = require('../../../validations');
const {
    getLastFolios,
    getFoliosByDate,
    getFolio,
    getFolioById,
    getProviders,
    createFolio,
    getLastFolio,
    updateFolio,
    updateStatusFolio,
} = require('../models');

const ServicesGeneral = (() => {
    const conexionBitacora = getConnectionFrom('ZR');
    
    const getUltimosFoliosPorSucursal = async (sucursal = 'ZR') => {
        const validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const response = await getLastFolios(conexionBitacora, sucursal);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }
    
    const getFoliosPorFechaYSucursal = async (sucursal = 'ZR', fecha = '20240101') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateFecha(fecha, ' Fecha de Corte ');
        if (!validate.success) return createResponse(400, validate);

        const response = await getFoliosByDate(conexionBitacora, sucursal, fecha);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }
    
    const getFoliosEspecifico = async (folio = 'ZR2024010101') => {
        const response = await getFolio(conexionBitacora, folio);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }
    
    const getFoliosPorId = async (id = '') => {
        const response = await getFolioById(conexionBitacora, id);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }
    
    const getProveedores = async () => {
        const response = await getProviders(conexionBitacora);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }
    
    const generateFolio = async (sucursal = 'ZR', fecha = '20240101') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateFecha(fecha, ' Fecha de Corte ');
        if (!validate.success) return createResponse(400, validate);

        const response = await getLastFolio(conexionBitacora, sucursal, fecha)

        if (!response.success) return createResponse(400, response);
        const Folio = response.data.length < 1 ? 'SU0000000000' : response.data[0].Folio;

        const lastNumber = Folio === undefined ? 0 : parseInt(Folio.substring(10, 12));
        const newConsecutivo = lastNumber + 1;

        const numberCadena = newConsecutivo.toString();
        const numberComplete = numberCadena.length === 1 ? '0' + newConsecutivo : newConsecutivo;
        const newFolio = sucursal.toUpperCase() + fecha + numberComplete;

        return createResponse(200, createContentAssert('Nuevo Folio', { Folio: newFolio }));
    }
    
    const addFolio = async (body) => {
        const { Sucursal, Fecha, Folio, Proveedor, Subtotal, Descuento, Ieps, Iva, Total, Documento } = body;
        let validate = validateSucursal(Sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateFecha(Fecha, ' Fecha de Corte ');
        if (!validate.success) return createResponse(400, validate);

        validate = validateFolio(Folio);
        if (!validate.success) return createResponse(400, validate);

        const response = await createFolio(conexionBitacora, Sucursal, Fecha, Folio, Proveedor, Subtotal, Descuento, Ieps, Iva, Total, Documento);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }
    
    const createFolioVacio = async (sucursal = 'ZR', fecha = '20240101') => {
        let { response } = generateFolio(sucursal, fecha);
        if (!response.success) return createResponse(200, response);

        let validate = validateFolio(Folio);
        if (!validate.success) return createResponse(400, validate);

        response = await createFolio(conexionBitacora, sucursal, fecha, Folio, 'PROVEEDORES VARIOS', 1.0, 0, 0, 0, 0, 'R');

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }
    
    const updateFolioBitacora = async (Id, body) => {
        const { Proveedor, Subtotal, Descuento, Ieps, Iva, Total, Documento } = body;
        let validate = validateSucursal(Sucursal);
        if (!validate.success) return createResponse(400, validate);

        const response = await updateFolio(conexionBitacora, Id, Proveedor, Subtotal, Descuento, Ieps, Iva, Total, Documento);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }

    const updateEstatusFolio = async (Id, estatus) => {
        const response = await updateStatusFolio(conexionBitacora, Id, estatus);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response);
    }

    return {
        getUltimosFoliosPorSucursal,
        getFoliosPorFechaYSucursal,
        getFoliosEspecifico,
        getFoliosPorId,
        getProveedores,
        addFolio,
        generateFolio,
        createFolioVacio,
        updateFolioBitacora,
        updateEstatusFolio,
    }
})();

module.exports = ServicesGeneral;