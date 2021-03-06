const { schemaFecha } = require('../schemas/index');
const { createContentAssert, createContentError } = require('../../../utils');

const validationTrabajadores = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'GENERAL' &&
            sucursal.toUpperCase() !== 'ENRIQUEZ' &&
            sucursal.toUpperCase() !== 'SAYULA' &&
            sucursal.toUpperCase() !== 'SPAENRIQUEZ' &&
            sucursal.toUpperCase() !== 'SPASAYULA' &&
            sucursal.toUpperCase() !== 'SPATORTILLERIAF' &&
            sucursal.toUpperCase() !== 'SAYULABODEGA' &&
            sucursal.toUpperCase() !== 'TSAYULA' &&
            sucursal.toUpperCase() !== 'SPASAYULAT' &&
            sucursal.toUpperCase() !== 'AUTOSERVICIO' &&
            sucursal.toUpperCase() !== 'MEDIOMAYOREO' &&
            sucursal.toUpperCase() !== 'BODEGA' &&
            sucursal.toUpperCase() !== 'OFICINA' &&
            sucursal.toUpperCase() !== 'SPABODEGA' &&
            sucursal.toUpperCase() !== 'SPACATEMACO' &&
            sucursal.toUpperCase() !== 'SPAJALTIPAN' &&
            sucursal.toUpperCase() !== 'SPAOFICINA' &&
            sucursal.toUpperCase() !== 'SPAOLUTA' &&
            sucursal.toUpperCase() !== 'SPASANANDRES' &&
            sucursal.toUpperCase() !== 'SPAVICTORIA' &&
            sucursal.toUpperCase() !== 'SPAZARAGOZA' &&
            sucursal.toUpperCase() !== 'HUAMUCHIL' &&
            sucursal.toUpperCase() !== 'TXTLABOYA' &&
            sucursal.toUpperCase() !== 'TXTLAESCONDIDA'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateDate = (date = '') => {
        const resultValidate = schemaFecha.validate(date);
        if (resultValidate.error)
            return createContentError('La fecha no tiene el formato correcto', resultValidate.error)

        return createContentAssert('Fecha correcta');
    }

    return {
        validateSucursal,
        validateDate,
    }
})();

module.exports = validationTrabajadores;
