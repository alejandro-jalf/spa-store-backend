const { createContentAssert, createContentError } = require('../../../utils');

const validationReportes = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'SY' &&
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

    return {
        validateSucursal,
        validateAlmacenTienda,
    }
})();

module.exports = validationReportes;
