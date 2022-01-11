const {
    connectionZaragoza,
    connectionVictoria,
    connectionOluta,
    connectionJaltipan,
    connectionBodega,
    dataBase,
} = require('../configs');
const { v4: uuidv4 } = require('uuid')
const moment = require('moment');

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
        if (from.trim().toUpperCase() === 'HU') return connectionZaragoza;
        if (from.trim().toUpperCase() === 'ZR') return connectionZaragoza;
        if (from.trim().toUpperCase() === 'VC') return connectionVictoria;
        if (from.trim().toUpperCase() === 'OU') return connectionOluta;
        if (from.trim().toUpperCase() === 'JL') return connectionJaltipan;
        if (from.trim().toUpperCase() === 'BO') return connectionBodega;
    }

    const getSucursalByCategory = (categoria = '') => {
        if (categoria.trim() === '') return undefined;
        if (categoria.toUpperCase() === 'GENERAL') return undefined;
        if (categoria.toUpperCase() === 'SAENRIQUEZ') return undefined;
        if (categoria.toUpperCase() === 'SPABODEGA') return 'BO';
        if (categoria.toUpperCase() === 'SPACATEMACO') return undefined;
        if (categoria.toUpperCase() === 'SPAJALTIPAN') return 'JL';
        if (categoria.toUpperCase() === 'SPAOFICINA') return 'ZR';
        if (categoria.toUpperCase() === 'SPAOLUTA') return 'OU';
        if (categoria.toUpperCase() === 'SPASANANDRES') return undefined;
        if (categoria.toUpperCase() === 'SPAVICTORIA') return 'VC';
        if (categoria.toUpperCase() === 'SPAZARAGOZA') return 'ZR';
        if (categoria.toUpperCase() === 'HUAMUCHIL') return undefined;
        if (categoria.toUpperCase() === 'TXTLABOYA') return undefined;
        if (categoria.toUpperCase() === 'TXTLAESCONDIDA') return undefined;
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
    
    const toDate = (stringDate = '2021-08-24T00:00:00', invertido = false) => {
        const splitDate = stringDate.split('-')
        if (invertido) return `${splitDate[0]}/${splitDate[1]}/${splitDate[2].slice(0, 2)}`
        return `${splitDate[2].slice(0, 2)}/${splitDate[1]}/${splitDate[0]}`
    }

    const getDateActual = () => {
        return moment().local(true);
    }

    const roundTo = (number, digits = 2, autoComplete = true) => {
        const stringNumber =
        number === null || number === undefined ? '0' : number.toString()
        const arrayDivision = stringNumber.split('.')
        const lengthDivision = arrayDivision.length
        let rounded = '0.00'
        let digitsString = ''
        if (lengthDivision === 1) {
            if (!autoComplete) return arrayDivision[0]
            for (let index = 0; index < digits; index++) {
                digitsString += '0'
            }
            rounded = arrayDivision[0] + '.' + digitsString
            return rounded
        }
        if (digits === 0) {
            rounded = Math.round(number)
            return rounded
        }
        digitsString = arrayDivision[1].slice(0, digits - 1)
        let digitToRound = parseInt(arrayDivision[1].slice(digits, digits + 1))
        digitsString = arrayDivision[1].slice(0, digits - 1)
        if (isNaN(digitToRound)) digitToRound = 0
        let digitRounded = -1
        const endDigit = arrayDivision[1].slice(digits - 1, digits)
        if (digitToRound < 5) {
            digitRounded = endDigit
        }
        if (digitToRound >= 5 && digitToRound < 9) {
            if (parseInt(endDigit) < 9) {
            digitRounded = parseInt(endDigit) + 1
            } else {
            digitRounded = parseInt(endDigit)
            }
        }
        if (digitToRound === 9) {
            if (parseInt(endDigit) < 9) {
            digitRounded = parseInt(endDigit) + 1
            } else {
            digitRounded = parseInt(endDigit)
            }
        }
        rounded = arrayDivision[0] + '.' + digitsString + digitRounded
        const lengthDigits = digits - rounded.split('.')[1].length
        if (lengthDigits > 0)
            for (let index = 0; index < lengthDigits; index++) rounded += '0'
        return rounded
    }

    const toMoment = (cadena) => new moment(cadena);

    const createUUID = () => uuidv4();

    return {
        createContentAssert,
        createContentError,
        createResponse,
        getConnectionFrom,
        getDatabase,
        getEndDayMonth,
        completeDateHour,
        getSucursalByAlmacen,
        createUUID,
        toDate,
        getDateActual,
        getSucursalByCategory,
        toMoment,
        roundTo,
    }
})();

module.exports = utils;
