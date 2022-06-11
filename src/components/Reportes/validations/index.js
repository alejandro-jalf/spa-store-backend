const {
    createContentAssert,
    createContentError,
    toMoment,
} = require('../../../utils');
const { schemaFecha } = require('../schemas')

const validationReportes = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'SY' &&
            sucursal.toUpperCase() !== 'TY' &&
            sucursal.toUpperCase() !== 'TF' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateAlmacenTienda = (tienda_almacen = 0) => {
        try {
            const tiendaAlmacen = parseInt(tienda_almacen);
            if (tiendaAlmacen === NaN)
                createContentError('El almacen o tienda no es un numero entero');
            if (tiendaAlmacen < 0)
                createContentError('Tienda o almacen menor que 0');
            if (tiendaAlmacen === 0)
                createContentError('Tienda o almacen igual 0');
            return createContentAssert('Numero valido');
        } catch (error) {
            createContentError('El almacen o tienda no es un numero entero', error);
        }
    }

    const validateDate = (date = '') => {
        const resultValidate = schemaFecha.validate(date);
        if (resultValidate.error)
            return createContentError('La fecha no tiene el formato correcto YYYYMMDD', resultValidate.error);

        return createContentAssert('Fecha correcta');
    }

    const validateDates = (fechaIni = '', fechaFin = '') => {
        const dateStart = toMoment(fechaIni.slice(0, 4) + '-' + fechaIni.slice(4, 6) + '-' + fechaIni.slice(6, 8));
        const dateEnd = toMoment(fechaFin.slice(0, 4) + '-' + fechaFin.slice(4, 6) + '-' + fechaFin.slice(6, 8));
        if (dateStart.isAfter(dateEnd))
            return createContentError('La fecha de inicio no puede ser menor que la fecha de termino')
        return createContentAssert('Fechas correctas');
    }

    return {
        validateSucursal,
        validateAlmacenTienda,
        validateDate,
        validateDates,
    }
})();

module.exports = validationReportes;
