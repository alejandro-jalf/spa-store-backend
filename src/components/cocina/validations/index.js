const { schemaFechas } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationCocina = (() => {
    const validateBodyFecha = (bodyFecha) => {
        if (!bodyFecha) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyFecha
            );
        }

        if (typeof bodyFecha !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyFecha
            );
        }

        let resultValidate = schemaFechas.validate(bodyFecha);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        return createContentAssert("Validacion correcta");
    }

    return {
        validateBodyFecha,
    }
})();

module.exports = validationCocina;
