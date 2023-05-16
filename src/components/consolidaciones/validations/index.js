const {
    createContentAssert,
    createContentError,
} = require('../../../utils');
const { schemaFecha, schemaBodyListCost } = require('../schemas')

const validationConsolidaciones = (() => {

    const validateDate = (date = '') => {
        const resultValidate = schemaFecha.validate(date);
        if (resultValidate.error)
            return createContentError('La fecha no tiene el formato correcto YYYYMMDD', resultValidate.error);

        return createContentAssert('Fecha correcta');
    }

    const validateListCost = (bodyListCost = []) => {
        if (bodyListCost.length === 0)
            return createContentError('No hay datos para actualizar');

        const resultValidate = schemaBodyListCost.validate(bodyListCost);
        if (resultValidate.error)
            return createContentError('Deberia ser un arreglo con Articulo y CostoUnitario', resultValidate.error);

        return createContentAssert('Lista de datos correctos');
    }

    return {
        validateDate,
        validateListCost,
    }
})();

module.exports = validationConsolidaciones;
