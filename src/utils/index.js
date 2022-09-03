const {
    connectionZaragoza,
    connectionVictoria,
    connectionOluta,
    connectionJaltipan,
    connectionBodega,
    connectionCaasaEnriquez,
    connectionCaasaSayula,
    connectionCaasaSayulaT,
    connectionTortilleriaAcayucan,
    connectionCaasaSuper,
    connectionEnriquez,
    connectionSayula,
    connectionSayulaT,
    dataBase,
    listHost,
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
        if (from.trim().toUpperCase() === 'ER') return connectionEnriquez;
        if (from.trim().toUpperCase() === 'SA') return connectionSayula;
        if (from.trim().toUpperCase() === 'SY') return connectionSayula;
        if (from.trim().toUpperCase() === 'CEN') return connectionCaasaEnriquez;
        if (from.trim().toUpperCase() === 'CSA') return connectionCaasaSayula;
        if (from.trim().toUpperCase() === 'SB') return connectionCaasaSayula;
        if (from.trim().toUpperCase() === 'TY') return connectionSayulaT;
        if (from.trim().toUpperCase() === 'TF') return connectionTortilleriaAcayucan;
        if (from.trim().toUpperCase() === 'SU') return connectionCaasaSuper;
        if (from.trim().toUpperCase() === 'MA') return connectionCaasaSuper;
        if (from.trim().toUpperCase() === 'RE') return connectionCaasaSuper;
        if (from.trim().toUpperCase() === 'CO') return connectionCaasaSuper;
    }

    const getNameBySiglas= (from = '') => {
        if (from.trim() === '') return from;
        if (from.trim().toUpperCase() === 'HU') return 'Huamuchil';
        if (from.trim().toUpperCase() === 'ZR') return 'SPA Zaragoza';
        if (from.trim().toUpperCase() === 'VC') return 'SPA Victoria';
        if (from.trim().toUpperCase() === 'OU') return 'SPA Oluta';
        if (from.trim().toUpperCase() === 'JL') return 'SPA Jaltipan';
        if (from.trim().toUpperCase() === 'BO') return 'SPA Bodega';
        if (from.trim().toUpperCase() === 'ER') return 'SPA Enriquez';
        if (from.trim().toUpperCase() === 'SA') return 'CAASA Sayula';
        if (from.trim().toUpperCase() === 'SY') return 'SPA Sayula';
        if (from.trim().toUpperCase() === 'SB') return 'Sayula Tortilleria';
        if (from.trim().toUpperCase() === 'TY') return 'Sayula Tortilleria';
        if (from.trim().toUpperCase() === 'TF') return 'Tortilleria Acayucan';
        if (from.trim().toUpperCase() === 'SU') return 'Super';
        if (from.trim().toUpperCase() === 'MA') return 'Mayoreo';
        if (from.trim().toUpperCase() === 'RE') return 'Reparto';
        if (from.trim().toUpperCase() === 'CO') return 'CAASA Oficina';
        return from;
    }

    const getListConnectionByCompany = (company = '') => {
        if (company === '') return [];
        if (company.trim().toUpperCase() === 'CAASA') return [
            { name: 'SUPER', connection: connectionCaasaSuper },
        ]
        if (company.trim().toUpperCase() === 'SPA') return [
            { name: 'ZARAGOZA', connection: connectionZaragoza },
            { name: 'VICTORIA', connection: connectionVictoria },
            { name: 'ENRIQUEZ', connection: connectionEnriquez },
            { name: 'TORTILLERIA F.', connection: connectionTortilleriaAcayucan },
            { name: 'OLUTA', connection: connectionOluta },
            { name: 'SAYULA', connection: connectionSayula },
            { name: 'SAYULA T.', connection: connectionSayulaT },
            { name: 'JALTIPAN', connection: connectionJaltipan },
            { name: 'BODEGA', connection: connectionBodega },
        ]
        return []
    }

    const getSucursalByCategory = (categoria = '') => {
        if (categoria.trim() === '') return undefined;
        if (categoria.toUpperCase() === 'GENERAL') return undefined;
        if (categoria.toUpperCase() === 'CAASAENRIQUEZ') return 'CEN'; //Quitar al migrar
        if (categoria.toUpperCase() === 'CAASASAYULA') return 'CSA'; //Quitar al migrar
        if (categoria.toUpperCase() === 'CAASASAYULABODEGA') return 'SB';
        if (categoria.toUpperCase() === 'SPASAYULAT') return 'TY';
        if (categoria.toUpperCase() === 'SPATORTILLERIAF') return 'TF';
        if (categoria.toUpperCase() === 'CAASAAUTOSERVICIO') return 'SU';
        if (categoria.toUpperCase() === 'CAASAMEDIOMAYOREO') return 'MA';
        if (categoria.toUpperCase() === 'CAASABODEGA') return 'RE';
        if (categoria.toUpperCase() === 'CAASAOFICINA') return 'CO';
        if (categoria.toUpperCase() === 'SPABODEGA') return 'BO';
        if (categoria.toUpperCase() === 'SPAJALTIPAN') return 'JL';
        if (categoria.toUpperCase() === 'SPAOFICINA') return 'ZR';
        if (categoria.toUpperCase() === 'SPAOLUTA') return 'OU';
        if (categoria.toUpperCase() === 'SPAENRIQUEZ') return 'ER';
        if (categoria.toUpperCase() === 'SPASAYULA') return 'SY';
        if (categoria.toUpperCase() === 'SPAVICTORIA') return 'VC';
        if (categoria.toUpperCase() === 'SPAZARAGOZA') return 'ZR';
        if (categoria.toUpperCase() === 'SPACATEMACO') return undefined;
        if (categoria.toUpperCase() === 'SPASANANDRES') return undefined;
        if (categoria.toUpperCase() === 'HUAMUCHIL') return undefined;
        if (categoria.toUpperCase() === 'TXTLABOYA') return undefined;
        if (categoria.toUpperCase() === 'TXTLAESCONDIDA') return undefined;
        return undefined
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

        if (almacen.trim().toLowerCase() === 'spa-enriquez-punto de venta')
            return 'ER';

        if (almacen.trim().toLowerCase() === 'spa-sayula-punto de venta')
            return 'SY';

        if (
            almacen.trim().toLowerCase() === 'bodega bocardo' ||
            almacen.trim().toLowerCase() === 'almacen bocardo' ||
            almacen.trim().toLowerCase() === 'mercancias en transito' ||
            almacen.trim().toLowerCase() === 'spa-almacen'
        ) return 'BO';
    }

    const getHostBySuc = (sucursal = 'ZR') => {
        const host = listHost[sucursal.toUpperCase()];
        if (host) return host;
        return listHost.ZR;
    }

    const getDatabaseBySuc = (sucursal = 'ZR') => {
        const db = dataBase[sucursal.toUpperCase()];
        if (db) return db;
        return dataBase.ZR;
    }

    const getDatabase = (date = getDateActual(), sucursal = 'ZR') => {
        let dateActual = getDateActual();
        const yearActual = parseInt(dateActual.format('YYYY'));
        const monthActual = parseInt(dateActual.format('MM'));
        
        const DB = dataBase[`${sucursal.toUpperCase()}`];
        let startDatabase = toMoment((yearActual - 1) + '0901');
        let endDatabase = toMoment(yearActual + '0831');

        if (
            parseInt(date.format('YYYY')) === yearActual &&
            parseInt(date.format('MM')) > monthActual
        ) return undefined;

        if (
            (
                monthActual <= 8 &&
                date.isBetween(startDatabase, endDatabase, undefined, '[]')
            ) ||
            (
                monthActual > 8 &&
                date.isAfter(endDatabase)
            )
        ) return DB;

        if (date.isAfter(toMoment(yearActual + '0901'))) return DB;

        let yearDB = 2017;
        for (let year = 2017; year <= yearActual; year++) {
            startDatabase = toMoment((year - 1) + '0901');
            endDatabase = toMoment(year + '0831');

            if (date.isBetween(startDatabase, endDatabase, undefined, '[]')) {
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

    const getTiendaBySucursal = (sucursal) => {
        switch (sucursal) {
            case 'ZR':
                return 1;
            case 'VC':
                return 2;
            case 'ER':
                return 3;
            case 'OU':
                return 5;
            case 'SY':
                return 9;
            case 'JL':
                return 4;
            case 'BO':
                return 6;
            default:
                return 0;
        }
    }

    const getAlmacenBySucursal = (sucursal) => {
        switch (sucursal) {
            case 'ZR':
                return 2;
            case 'VC':
                return 3;
            case 'ER':
                return 5;
            case 'OU':
                return 19;
            case 'SY':
                return 16;
            case 'JL':
                return 7;
            case 'BO':
                return 21;
            default:
                return 0;
        }
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
        getNameBySiglas,
        createUUID,
        getTiendaBySucursal,
        getAlmacenBySucursal,
        toDate,
        getDateActual,
        getSucursalByCategory,
        toMoment,
        getHostBySuc,
        getDatabaseBySuc,
        roundTo,
        getListConnectionByCompany,
    }
})();

module.exports = utils;
