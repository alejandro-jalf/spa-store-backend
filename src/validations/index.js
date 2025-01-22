const { createContentAssert, createContentError } = require('../utils');
const { schemaFecha } = require('../components/cocina/schemas')

const validationGeneral = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ALL' &&
            sucursal.toUpperCase() !== 'ALLS' &&
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'SY' &&
            sucursal.toUpperCase() !== 'SC' &&
            sucursal.toUpperCase() !== 'SCB' &&
            sucursal.toUpperCase() !== 'SN' &&
            sucursal.toUpperCase() !== 'SNP' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'SA' &&
            sucursal.toUpperCase() !== 'SB' &&
            sucursal.toUpperCase() !== 'SU' &&
            sucursal.toUpperCase() !== 'MA' &&
            sucursal.toUpperCase() !== 'RE' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateSucursalWithCompany = (sucursal = '', company = '') => {
        const sucForSPA = [ 'ZR', 'VC', 'OU', 'JL', 'BO', 'ER', 'SY', 'SC', 'SCB', 'SN', 'SNP' ];
        const sucForCAASA = [ 'SA', 'SB', 'SU', 'MA', 'RE', 'EN', 'CO' ];
        let sucFinded;
        if (company.toUpperCase() === 'SPA')
            sucFinded = sucForSPA.find((suc) => suc === sucursal.toUpperCase());
        else if (company.toUpperCase() === 'CAASA')
            sucFinded = sucForCAASA.find((suc) => suc === sucursal.toUpperCase());
        else return createContentError('La empresa no es correcta');
        if (!sucFinded) return createContentError('Verifique que la sucursal pertenesca la empresa')
        return createContentAssert('Sucursal y empresa valida');
    }

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


    return {
        validateSucursal,
        validateSucursalWithCompany,
        validateFecha,
        validateFechas,
    }
})();

module.exports = validationGeneral;
