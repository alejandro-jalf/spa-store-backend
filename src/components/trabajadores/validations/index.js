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
            sucursal.toUpperCase() !== 'SPASANANDRESP' &&
            sucursal.toUpperCase() !== 'SPAVICTORIA' &&
            sucursal.toUpperCase() !== 'SPAZARAGOZA' &&
            sucursal.toUpperCase() !== 'SPASOCONUSCO' &&
            sucursal.toUpperCase() !== 'HUAMUCHIL' &&
            sucursal.toUpperCase() !== 'TXTLABOYA' &&
            sucursal.toUpperCase() !== 'TXTLAESCONDIDA'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateEstatus = (estatus = '') => {
        if (
            estatus.toUpperCase() !== 'ENTRADA DIA' &&
            estatus.toUpperCase() !== 'SALIDA COMIDA' &&
            estatus.toUpperCase() !== 'ENTRADA COMIDA' &&
            estatus.toUpperCase() !== 'SALIDA DIA'
        ) return createContentError('Estatus no valido');
        return createContentAssert('Estatus Valido');
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
        validateEstatus,
    }
})();

module.exports = validationTrabajadores;
