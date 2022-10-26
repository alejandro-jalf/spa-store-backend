const {
    createContentAssert,
    createContentError,
    toMoment,
} = require('../../../utils');
const { schemaFecha } = require('../schemas')

const validationMayoristas = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'SY' &&
            sucursal.toUpperCase() !== 'TY' &&
            sucursal.toUpperCase() !== 'TF' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    return {
        validateSucursal,
    }
})();

module.exports = validationMayoristas;
