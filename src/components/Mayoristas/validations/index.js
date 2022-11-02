const {
    createContentAssert,
    createContentError,
    toMoment,
} = require('../../../utils');
const { schemaUpdateCosto } = require('../schemas')

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

    const validateUpdateCostoOrden = (objectUpdate = {}) => {
        const resultValidate = schemaUpdateCosto.validate(objectUpdate);
        if (resultValidate.error)
            return createContentError('El objeto de actualizacion no cumple con el formato', resultValidate.error)

        return createContentAssert('Objeto correcto');
    }

    return {
        validateSucursal,
        validateUpdateCostoOrden,
    }
})();

module.exports = validationMayoristas;
