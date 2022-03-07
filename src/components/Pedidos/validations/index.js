const { schemaCreateDetallesPedidos } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationPedidos = (() => {

    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'SA' &&
            sucursal.toUpperCase() !== 'SB' &&
            sucursal.toUpperCase() !== 'SU' &&
            sucursal.toUpperCase() !== 'MA' &&
            sucursal.toUpperCase() !== 'RE' &&
            sucursal.toUpperCase() !== 'EN' &&
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

    return {
        validateSucursal,
        validateBodyAddArticle,
    }
})();

module.exports = validationPedidos;
