const { schemaCodigoBarras } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationArticulos = (() => {

    const validateCodigoBarras = (codigoBarras = '') => {
        const resultValidate = schemaCodigoBarras.validate(codigoBarras);
        if (resultValidate.error)
            return createContentError('El codigo de barras no es valido', resultValidate.error)

        return createContentAssert('Codigo correcto');
    }

    const validatePorcentaje = (porcentaje = 10) => {
        if (parseInt(porcentaje) === NaN)
            return createContentError(`El procentaje "${porcentaje}" no es valido`)
        return createContentAssert('Porcentaje correcto');
    }

    const validateDayMinAndMax = (daymin, daymax) => {
        daymin = parseInt(daymin)
        daymax = parseInt(daymax)
        if (daymin === null) return createContentError('El dia de stock minimo no puede ser nulo');
        if (daymax === null) return createContentError('El dia de stock maximo no puede ser nulo');

        if (daymin === 0 || daymax === 0) return createContentError('Los dias de stock no pueden ser 0');
        if (daymin > daymax) return createContentError('El dia de stock minimo no puede ser mayor que el maximo')

        return createContentAssert('Dias validos')
    }

    return {
        validatePorcentaje,
        validateDayMinAndMax,
        validateCodigoBarras,
    }
})();

module.exports = validationArticulos;
