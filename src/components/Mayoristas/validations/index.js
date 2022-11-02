const {
    createContentAssert,
    createContentError,
    toMoment,
} = require('../../../utils');
const { schemaUpdateCosto, schemaUpdateMasivo } = require('../schemas')

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

    const validateUpdateMasivo = (masivo = []) => {
        const resultValidate = schemaUpdateMasivo.validate(masivo);
        if (resultValidate.error)
            return createContentError('Deberia de enviar una coleccion de articulos a actualizar', resultValidate.error)

        return createContentAssert('Array correcto');
    }

    return {
        validateSucursal,
        validateUpdateCostoOrden,
        validateUpdateMasivo,
    }
})();

module.exports = validationMayoristas;
