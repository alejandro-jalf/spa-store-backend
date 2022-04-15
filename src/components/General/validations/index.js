const { createContentAssert, createContentError } = require('../../../utils');

const validationGeneral = (() => {
    const validateEmpresa = (empresa = '') => {
        if (
            empresa.toUpperCase() !== 'CAASA' &&
            empresa.toUpperCase() !== 'SPA'
        ) return createContentError('La empresa no es valida');
        return createContentAssert('Empresa valida');
    }

    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'SA' &&
            sucursal.toUpperCase() !== 'SB' &&
            sucursal.toUpperCase() !== 'SU' &&
            sucursal.toUpperCase() !== 'MA' &&
            sucursal.toUpperCase() !== 'RE' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateNumber = (number = 0, nameCamp = '') => {
        number = parseInt(number);
        if (number.toString() === 'NaN') return createContentError('Envio un valor no numerico');
        if (number <= 0) return createContentError(nameCamp+ ' no puede ser menor que o igual a 0');
        return createContentAssert('Numero valido');
    }    

    return {
        validateNumber,
        validateEmpresa,
        validateSucursal,
    }
})();

module.exports = validationGeneral;
