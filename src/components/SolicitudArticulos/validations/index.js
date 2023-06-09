const { schemaUpdateRequest } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationPedidos = (() => {

    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'SU' &&
            sucursal.toUpperCase() !== 'SY' &&
            sucursal.toUpperCase() !== 'SU' &&
            sucursal.toUpperCase() !== 'MA' &&
            sucursal.toUpperCase() !== 'RE' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
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
            status.trim().toUpperCase() !== 'EN PROCESO' &&
            status.trim().toUpperCase() !== 'ENVIADO' &&
            status.trim().toUpperCase() !== 'CANCELADO' &&
            status.trim().toUpperCase() !== 'ATENDIDO'
        ) return createContentError('Estatus invalido');
        return createContentAssert('Estatus correcto');
    }

    return {
        validateSucursal,
        validateStatusRequest,
        validateBodyUpdateRequest,
    }
})();

module.exports = validationPedidos;
