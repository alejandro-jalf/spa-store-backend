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
    user,
    password,
} = require('../configs');
const { v4: uuidv4 } = require('uuid')
const moment = require('moment');
const sha1 = require("sha1");
const mail = require("nodemailer");

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

    const completeDataForDate = (value, length = 2) => {
        if (length === 2)
            if (value.toString().length === 1) return `0${value}`
        if (length === 3) {
            if (value.toString().length === 1) return `00${value}`
            if (value.toString().length === 2) return `0${value}`
        }
        return value;
    }
    
    const encriptData = (message) => sha1(message);

    const sendEmail = async (to, code) => {
        const transporter = mail.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user,
                pass: password,
            },
        });

        try {
            const info = await transporter.sendMail({
                from: '"Super Promociones de acayucan" <alexlofa45@gmail.com>',
                to,
                subject: "Codigo de seguridad",
                html: `
                <h3>Se esta recuperando tu cuenta</h3>
                <p>
                Si no has sido tu, ignora este correo y te recomendamos cambiar tu
                contraseña
                </p>
                <div>Para recuperar tu cuenta sigue los siguiente pasos:</div>
                <div style="padding-left: 4%; margin: 10px 0px">
                1. Entra a la pagina de SPA-Store, dando click en el acceso directo de tu
                pantalla inicio o click en el siguiente enlace
                <a
                    href="https://spastore.herokuapp.com/"
                    style="
                    display: block;
                    cursor: pointer;
                    width: max-content;
                    background: rgb(0, 99, 212);
                    color: #fff;
                    padding: 4px 10px;
                    border-radius: 3px;
                    border: 2px solid #fff;
                    "
                    target="_blank"
                >
                    Abrir SPA Store
                </a>
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">
                2. En la pantalla de iniciar sesion: Ingresa tu correo electronico
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">
                3. En esa misma pantalla en lugar de tu contraseña ingresa este Codigo de
                Seguridad:
                <span
                    style="
                    width: max-content;
                    padding: 0px;
                    color: blue;
                    font-weight: bold;
                    font-size: 20px;
                    background: #fff;
                    "
                    >${code}</span
                >
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">4. Inicia Sesion</div>
                <div style="padding-left: 4%; margin: 10px 0px">
                5. Listo ya estas nuevamente en la SPA-Store
                </div>
                <p style="color: rgb(3, 202, 36); font-size: 30px">
                ¡Uff!, Ya casi terminamos
                </p>
                <hr />
                <p>Ya solo falta cambiar tu contraseña. Sigue los siguientes pasos:</p>
                <div style="padding-left: 4%; margin: 10px 0px">
                1. Ve a la pagina inicio de SPA-Store
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">
                2. Busca en la parte de abajo de inicio, una seccion que diga: "Cambio de
                contraseña"
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">
                3. En la caja de texto de "Nueva contraseña", ingresa tu nueva contraseña.
                <div style="font-style: italic">
                    Nota: Recuerda tu nueva contraseña debe ser mayor de 6 caracteres y
                    ademas debera tener por lo menos una letra y un numero.
                </div>
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">
                4. Repite tu nueva contraseña en la siguiente caja de texto
                <div style="font-style: italic">
                    Nota: Si la nueva contraseña cumple con el formato correcto y ambas
                    coinciden podras notar una palomita en cada caja de texto, de lo
                    contrario habra un mensaje de advertencia en la parte de abajo
                </div>
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">
                5. En la caja de texto de "Contraseña actual", escribe el mismo codigo de
                recuperacion:
                <span
                    style="
                    width: max-content;
                    padding: 0px;
                    color: blue;
                    font-weight: bold;
                    font-size: 20px;
                    background: #fff;
                    "
                    >${code}</span
                >
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">
                6. Click en Cambiar tu contraseña
                </div>
                <div style="padding-left: 4%; margin: 10px 0px">7. Confirma el cambio</div>
                <div style="color: rgb(3, 202, 36); font-size: 30px">
                ¡En hora buena, hemos terminado!
                </div>
                <p>
                ¡Listo!, ahora solo vueve a iniciar se sesion con tu nueva contraseña y
                guarda tu nueva contraseña en un lugar seguro
                </p>
                `
            });

            return createContentAssert('Correo enviado', info);
        } catch (error) {
            console.log(error);
            return createContentError('Error al enviar el correo', error);
        }
    }

    const toBit = (value = false) => {
        return value ? 1 : 0;
    }

    const cifraData = (string) => {
        string = decodeURI(encodeURIComponent(string));
        let newString = '', char, nextChar, combinedCharCode;
        for (let i = 0; i < string.length; i += 2) {
            char = string.charCodeAt(i);
            if ((i + 1) < string.length) {
                nextChar = string.charCodeAt(i + 1) - 31;
                combinedCharCode = char + "" + nextChar.toLocaleString('en', {
                    minimumIntegerDigits: 2
                });
                newString += String.fromCharCode(parseInt(combinedCharCode, 10));
            } else newString += string.charAt(i);
        }
        return newString.split("").reduce((hex,c)=>hex+=c.charCodeAt(0).toString(16).padStart(4,"0"),"");
    }

    const descifraData = (string) => {
        let newString = '', char, codeStr, firstCharCode, lastCharCode;
        string = string.match(/.{1,4}/g).reduce((acc,char)=>acc+String.fromCharCode(parseInt(char, 16)),"");
        for (let i = 0; i < string.length; i++) {
            char = string.charCodeAt(i);
            if (char > 132) {
                codeStr = char.toString(10);
                firstCharCode = parseInt(codeStr.substring(0, codeStr.length - 2), 10);
                lastCharCode = parseInt(codeStr.substring(codeStr.length - 2, codeStr.length), 10) + 31;
                newString += String.fromCharCode(firstCharCode) + String.fromCharCode(lastCharCode);
            } else newString += string.charAt(i);
        }
        return newString;
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
        completeDataForDate,
        encriptData,
        sendEmail,
        toBit,
        cifraData,
        descifraData,
    }
})();

module.exports = utils;
