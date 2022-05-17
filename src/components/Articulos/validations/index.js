const { schemaCodigoBarras } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationArticulos = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'SA' &&
            sucursal.toUpperCase() !== 'SY' &&
            sucursal.toUpperCase() !== 'SB' &&
            sucursal.toUpperCase() !== 'SU' &&
            sucursal.toUpperCase() !== 'MA' &&
            sucursal.toUpperCase() !== 'RE' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateSucursalWithCompany = (sucursal = '', company = '') => {
        const sucForSPA = [ 'ZR', 'VC', 'OU', 'JL', 'BO', 'ER', 'SY' ];
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

    const validateCodigoBarras = (codigoBarras = '') => {
        const resultValidate = schemaCodigoBarras.validate(codigoBarras);
        if (resultValidate.error)
            return createContentError('El codigo de barras no es valido', resultValidate.error)

        return createContentAssert('Codigo correcto');
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
        validateSucursal,
        validateDayMinAndMax,
        validateCodigoBarras,
        validateSucursalWithCompany,
    }
})();

module.exports = validationArticulos;
