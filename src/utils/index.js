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

    const getDatabase = (date = new Date(), sucursal = 'ZR') => {
        const dateActual = new Date();
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
    }
})();

module.exports = utils;
