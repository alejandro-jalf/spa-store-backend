const { schemaCreateDetallesPedidos } = require('../schemas/index');
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

    const validateBodyAddArticle = (bodyArticle = {}) => {
        const resultValidate = schemaCreateDetallesPedidos.validate(bodyArticle)
        if (resultValidate.error)
            return createContentError('Algun dato fue enviado de manera incorrecta', resultValidate.error);
        return createContentAssert('Body correcto');
    }

    const validateStatusPedido = (status = '') => {
        if (status.trim() === '') return createContentError('Se recibio estatus vacio');
        if (
            status.trim().toUpperCase() !== 'PEDIDO CANCELADO' &&
            status.trim().toUpperCase() !== 'PEDIDO EN PROCESO' &&
            status.trim().toUpperCase() !== 'PEDIDO ENVIADO' &&
            status.trim().toUpperCase() !== 'PEDIDO ATENDIDO'
        ) return createContentError('Estatus invalido');
        return createContentAssert('Estatus correcto');
    }

    return {
        validateSucursal,
        validateStatusPedido,
        validateBodyAddArticle,
    }
})();

module.exports = validationPedidos;
