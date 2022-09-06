const {
    createContentAssert,
    createContentError,
} = require('../../../utils');
const { schemaFecha } = require('../schemas')

const validationConsolidaciones = (() => {

    const validateDate = (date = '') => {
        const resultValidate = schemaFecha.validate(date);
        if (resultValidate.error)
            return createContentError('La fecha no tiene el formato correcto YYYYMMDD', resultValidate.error);

        return createContentAssert('Fecha correcta');
    }

    return {
        validateDate,
    }
})();

module.exports = validationConsolidaciones;
