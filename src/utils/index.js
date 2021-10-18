const {
    connectionZaragoza,
    connectionVictoria,
    connectionOluta,
    connectionJaltipan,
    connectionBodega,
    dataBase,
} = require('../configs');

const utils = (() => {
    const createContentAssert = (message, data = null) => (data === null) ?
        { success: true, message } :
        { success: true, message, data}

    const createContentError = (message, error = null) => (error === null) ?
        { success: false, message } :
        { success: false, message, error }

    const createResponse = (status, response) => ({ status, response })

    const getConnectionFrom = (from = '') => {
        if (from.trim() === '')
            return null;
        if (from.trim().toUpperCase() === 'ZR') return connectionZaragoza;
        if (from.trim().toUpperCase() === 'VC') return connectionVictoria;
        if (from.trim().toUpperCase() === 'OU') return connectionOluta;
        if (from.trim().toUpperCase() === 'JL') return connectionJaltipan;
        if (from.trim().toUpperCase() === 'BO') return connectionBodega;
    }

    const getSucursalByAlmacen = (almacen = '') => {
        if (almacen.trim() === '') return null;

        if (almacen.trim().toLowerCase() === 'spa-super1-punto de venta')
            return 'ZR';

        if (
            almacen.trim().toLowerCase() === 'spa-centro-punto de venta' ||
            almacen.trim().toLowerCase() === 'spa-centro-confiteria'
        ) return 'VC';

        if (almacen.trim().toLowerCase() === 'spa-oluta-punto de venta')
            return 'OU';

        if (
            almacen.trim().toLowerCase() === 'spa-jaltipan-punto de venta' ||
            almacen.trim().toLowerCase() === 'spa-jaltipan-confiteria'
        ) return 'JL';

        if (
            almacen.trim().toLowerCase() === 'bodega bocardo' ||
            almacen.trim().toLowerCase() === 'almacen bocardo' ||
            almacen.trim().toLowerCase() === 'mercancias en transito' ||
            almacen.trim().toLowerCase() === 'spa-almacen'
        ) return 'BO';
    }

    const getDatabase = (date = new Date(), sucursal = 'ZR') => {
        let dateActual = new Date();
        
        const DB = dataBase[`${sucursal.toUpperCase()}`];
        let startDatabase = new Date(dateActual.getFullYear() - 1, 8, 1);
        let endDatabase = new Date(dateActual.getFullYear(), 7, 31);

        if (
            date.getFullYear() === dateActual.getFullYear() &&
            date.getMonth() > dateActual.getMonth()
        ) return undefined;

        if (
            dateActual.getMonth() <= 7 &&
            date >= startDatabase &&
            date <= endDatabase
        ) return DB;

        if (date >= new Date(dateActual.getFullYear(), 8, 1)) return DB;

        let yearDB = 2017;
        for (let year = 2017; year <= dateActual.getFullYear(); year++) {
            startDatabase = new Date(year - 1, 8, 1);
            endDatabase = new Date(year, 7, 31);

            if (date >= startDatabase && date <= endDatabase) {
                yearDB = year;
                break;
            }
        }
        return `${DB}_${yearDB}08`
    }

    const completeDateHour = (number) => {
        if (!number) return number
        const numberString = number.toString()
        if (numberString.length < 2) return '0' + number
        return number
    }

    const getEndDayMonth = (year, month) => {
        return completeDateHour(
            new Date(parseInt(year), parseInt(month), 0).getDate()
        );
    }

    return {
        createContentAssert,
        createContentError,
        createResponse,
        getConnectionFrom,
        getDatabase,
        getEndDayMonth,
        completeDateHour,
        getSucursalByAlmacen,
        dbpostgresql,
    }
})();

module.exports = utils;
