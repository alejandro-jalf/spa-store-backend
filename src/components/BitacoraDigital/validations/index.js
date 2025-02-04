const { schemaFolio } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationGeneral = (() => {
    const validateFolio = (folio) => {
        const resultValidate = schemaFolio.validate(folio);
        if (resultValidate.error)
            return createContentError('El Folio no es valido', resultValidate.error)

        return createContentAssert('Folio correcto');
    }

    const validateNumber = (number = 0, nameCamp = '') => {
        number = parseInt(number);
        if (number.toString() === 'NaN') return createContentError('Envio un valor no numerico');
        if (number <= 0) return createContentError(nameCamp+ ' no puede ser menor que o igual a 0');
        return createContentAssert('Numero valido');
    }    

    return {
        validateNumber,
        validateFolio,
    }
})();

module.exports = validationGeneral;
