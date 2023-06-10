const { schemaUpdateRequest } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationPedidos = (() => {

    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ALL' &&
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'SY' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateCreatedBy = (nameCreated = '') => {
        if (nameCreated.trim() === '') return createContentError('El nombre de quien crea la solicitud no debe de estar vacio');
        return createContentAssert('Nombre valido');
    }

    const validateBodyUpdateRequest = (bodyRequest = {}) => {
        const resultValidate = schemaUpdateRequest.validate(bodyRequest)
        if (resultValidate.error)
            return createContentError('Algun dato fue enviado de manera incorrecta', resultValidate.error);
        return createContentAssert('Body correcto');
    }

    const validateStatusRequest = (status = '') => {
        if (status.trim() === '') return createContentError('Se recibio estatus vacio');
        if (
            status.trim().toUpperCase() !== 'EN SUCURSAL' &&
            status.trim().toUpperCase() !== 'ENVIADO' &&
            status.trim().toUpperCase() !== 'EN PROCESO' &&
            status.trim().toUpperCase() !== 'ATENDIDO' &&
            status.trim().toUpperCase() !== 'CANCELADO'
        ) return createContentError('Estatus invalido');
        return createContentAssert('Estatus correcto');
    }

    return {
        validateSucursal,
        validateStatusRequest,
        validateBodyUpdateRequest,
        validateCreatedBy,
    }
})();

module.exports = validationPedidos;
