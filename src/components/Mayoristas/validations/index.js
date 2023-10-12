const {
    createContentAssert,
    createContentError,
    toMoment,
} = require('../../../utils');
const { schemaUpdateCosto, schemaUpdateMasivo } = require('../schemas')

const validationMayoristas = (() => {

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
        validateUpdateCostoOrden,
        validateUpdateMasivo,
    }
})();

module.exports = validationMayoristas;
