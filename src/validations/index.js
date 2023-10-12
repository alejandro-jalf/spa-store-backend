const { createContentAssert, createContentError } = require('../utils');

const validationGeneral = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'SY' &&
            sucursal.toUpperCase() !== 'SC' &&
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
        const sucForSPA = [ 'ZR', 'VC', 'OU', 'JL', 'BO', 'ER', 'SY', 'SC' ];
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


    return {
        validateSucursal,
        validateSucursalWithCompany,
    }
})();

module.exports = validationGeneral;
