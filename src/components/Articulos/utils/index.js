const {
    createContentError,
    createContentAssert,
    toMoment,
    completeDateHour
} = require('../../../utils')

const utils = (() => {
    const mejorPrecio = (arrayCompras) => {
        const validate = validateArray(arrayCompras);
        if (!validate.success) return validate;
    
        let precioInit = arrayCompras[0].CostoUnitarioNetoUC;
    
        const mejorPrecio = arrayCompras.reduce((best, compra) => {
            if (compra.CostoUnitarioNetoUC < precioInit) {
                best = compra;
                precioInit = compra.CostoUnitarioNetoUC;
            }
            return best;
        }, {});

        return createContentAssert('Mejor precio', mejorPrecio);
    };
    
    const cantidadCompras = (arrayCompras) => {
        const validate = validateArray(arrayCompras);
        if (!validate.success) return validate;

        const cantidad = arrayCompras
            .reduce((listCompras, compra) => {
                const indexProveedor = listCompras.findIndex(
                    (itemCompra) => itemCompra.Proveedor === compra.NombreTercero
                );

                if (indexProveedor === -1) {
                    listCompras.push({
                    Proveedor: compra.NombreTercero,
                    Cantidad: 1,
                    });
                } else {
                    listCompras[indexProveedor].Cantidad += 1;
                }
                return listCompras;
            }, [])
            .sort((a, b) => b.Cantidad - a.Cantidad);

        return createContentAssert('Cantidad de compras', cantidad)
    };

    const precioPromedio = (arrayCompras) => {
        const validate = validateArray(arrayCompras);
        if (!validate.success) return validate;

        const suma = arrayCompras.reduce((acumuladorCostos, compra) => {
            acumuladorCostos += compra.CostoUnitarioNetoUC;
            return acumuladorCostos;
        }, 0);

        const prom = suma / arrayCompras.length;
        return createContentAssert('Precio promedio', prom);
    };

    const getComprasByDate = (dateStart = '20200101', dateEnd = '20220101', arrayCompras) => {
        const validate = validateArray(arrayCompras);
        if (!validate.success) return validate;

        const dateInit = toMoment(dateStart);
        const dateLastest = toMoment(dateEnd);

        const compras = arrayCompras.filter((compra) => {
            const date = new Date(compra.Fecha);
            const fechaCompra = toMoment(
                date.getFullYear() + '' + completeDateHour(date.getMonth()) + '' + completeDateHour(date.getDay())
            )
            return fechaCompra.isBetween(dateInit, dateLastest, undefined, '[]');
        });

        return createContentAssert('Compras por fecha', compras);
    };

    const validateArray = (arrayCompras) => {
        if (typeof arrayCompras !== "object")
            return createContentError('Tiene que enviar un objeto');
        if (arrayCompras.length == 0 || Object.values(arrayCompras).length == 0)
            return createContentError('Array vacio');

        return createContentAssert('Array valido');
    }

    return {
        mejorPrecio,
        cantidadCompras,
        precioPromedio,
        getComprasByDate,
    };
})();

module.exports = utils;
