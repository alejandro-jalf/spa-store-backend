const { schemaCodigoBarras } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationCocina = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateCodigoBarras = (codigoBarras = '') => {
        const resultValidate = schemaCodigoBarras.validate(codigoBarras);
        if (resultValidate.error)
            return createContentError('El codigo de barras no es valido', resultValidate.error)

        return createContentAssert('Codigo correcto');
    }

    return {
        validateSucursal,
        validateCodigoBarras,
    }
})();

module.exports = validationCocina;
