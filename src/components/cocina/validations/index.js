const { schemaFechas, schemaFecha } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationCocina = (() => {
    const validateFecha = (fecha = '', position = '') => {
        if (fecha.trim() === '')
            return createContentError(`Se esperaba la fecha ${position} y no fue enviado`);

        const resultValidate = schemaFecha.validate(fecha);
        if (resultValidate.error)
            return createContentError(`La fecha ${position} no cumple el formato YYYYMMDD`, resultValidate.error)

        if (
            parseInt(fecha.substring(0, 4)) < 2016 ||
            (parseInt(fecha.substring(0, 4)) === 2016 && parseInt(fecha.substring(4, 6)) < 9)
        ) return createContentError(`El año de la fecha ${position} no puede ser menor a septiembre-2016`)

        if (parseInt(fecha.substring(4, 6)) < 1 || parseInt(fecha.substring(4, 6)) > 12)
            return createContentError(`Mes de la fecha ${position} incorrecto`)

        if (parseInt(fecha.substring(6, 8)) < 1 || parseInt(fecha.substring(4, 6)) > 31)
            return createContentError(`Dia de la fecha ${position} incorrecto`)

        return createContentAssert('Fecha valida');
    }

    const validateFechas = (fechaInicial, fechaFinal) => {
        let resultValidate = validateFecha(fechaInicial, 'inicial');
        if (!resultValidate.success) return resultValidate;

        resultValidate = validateFecha(fechaFinal, 'final');
        if (!resultValidate.success) return resultValidate;

        if (parseInt(fechaInicial) > parseInt(fechaFinal))
            return createContentError('La fecha final no puede ser menor que la inicial')

        return createContentAssert('Fechas aprovadas');
    }

    const validateSucursal = (sucursal = '') => {
        if (
            sucursal !== 'ZR' &&
            sucursal !== 'VC' &&
            sucursal !== 'OU' &&
            sucursal !== 'JL' &&
            sucursal !== 'ER' &&
            sucursal !== 'SA' &&
            sucursal !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    return {
        validateSucursal,
        validateFecha,
        validateFechas,
    }
})();

module.exports = validationCocina;
