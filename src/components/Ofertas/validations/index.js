const { schemaCodigoBarras } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationOfertas = (() => {
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

    return {
        validateSucursal,
    }
})();

module.exports = validationOfertas;
