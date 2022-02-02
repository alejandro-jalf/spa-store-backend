const { createContentAssert, createContentError } = require('../../../utils');

const validationGeneral = (() => {
    const validateEmpresa = (empresa = '') => {
        if (
            empresa.toUpperCase() !== 'CAASA' &&
            empresa.toUpperCase() !== 'SPA'
        ) return createContentError('La empresa no es valida');
        return createContentAssert('Empresa valida');
    }

    return {
        validateEmpresa,
    }
})();

module.exports = validationGeneral;
