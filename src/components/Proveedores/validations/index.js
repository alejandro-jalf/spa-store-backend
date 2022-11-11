const { } = require('../schemas/index');
const { createContentError, createContentAssert } = require('../../../utils');

const validationProveedores = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'SY' &&
            sucursal.toUpperCase() !== 'BO' &&
            sucursal.toUpperCase() !== 'ALL'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    return {
        validateSucursal,
    }
})();

module.exports = validationProveedores;
