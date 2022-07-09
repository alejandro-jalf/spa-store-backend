const {
    createContentAssert,
    createResponse,
    getConnectionFrom,
    getDatabase,
    getSucursalByAlmacen,
} = require('../../../utils');
const { validateSucursal, validateFechas } = require('../../cocina/validations');
const { getEntradasToday, getTransferenciasToday } = require('../models');

const servicesConsolidaciones = (() => {

    const getConsolidacionesForDate = async (sucursal = '', dateStart, dateEnd) => {
        let validate = validateFechas(dateStart, dateEnd);
        if (!validate.success) return createResponse(400, validate);
        sucursal = sucursal.trim().toLocaleUpperCase();
        validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);
        
        const dateStartString =
            dateStart.slice(0, 4) +
            '-' +
            dateStart.slice(4, 6) +
            '-' +
            dateStart.slice(6, 8) +
            'T05:00:00.000Z';

        const dateEndString =
            dateEnd.slice(0, 4) +
            '-' +
            dateEnd.slice(4, 6) +
            '-' +
            dateEnd.slice(6, 8) +
            'T05:00:00.000Z';

        const dateIni = new Date(dateStartString);
        const dateFin = new Date(dateEndString);

        const conexion = getConnectionFrom(sucursal);

        const databaseStart = getDatabase(dateIni, sucursal);
        const databaseEnd = getDatabase(dateFin, sucursal);

        if (databaseStart === databaseEnd) {
            const transferenciasVerificadas =
                await getTransferenciasVerificadas(conexion, dateStart, dateEnd, databaseStart, dateIni);
            if (transferenciasVerificadas.status) return transferenciasVerificadas;

            return createResponse(200, createContentAssert('Datos encontrados', transferenciasVerificadas));
        } else {
            const transferenciasVerificadasStart =
                await getTransferenciasVerificadas(conexion, dateStart, dateEnd, databaseStart, dateIni);
            if (transferenciasVerificadasStart.status) return transferenciasVerificadasStart;

            const transferenciasVerificadasEnd =
                await getTransferenciasVerificadas(conexion, dateStart, dateEnd, databaseEnd, dateFin);
            if (transferenciasVerificadasEnd.status) return transferenciasVerificadasEnd;

            transferenciasVerificadasEnd.push(...transferenciasVerificadasStart)

            return createResponse(
                200,
                createContentAssert('Datos encontrados', transferenciasVerificadasEnd)
            );
        }
    }

    const getTransferenciasVerificadas = async (conexion, dateStart, dateEnd, database, date) => {
        const data = await getTransferenciasToday(conexion, dateStart, dateEnd, database)
        if (!data.success) return createResponse(200, data);

        const transferencias = refactorTransferencias(data.data);
        const resultEntradas = await getEntradasForDate(transferencias, dateStart, dateEnd, date);
        return verificaTransferencias(data.data, resultEntradas);
    }

    const verificaTransferencias = (transferencias, entradas) => {
        return transferencias.map((tranferencia) => {
            return {
                Fecha: tranferencia.Fecha,
                Hora: tranferencia.Hora,
                Transferencia: tranferencia.Documento,
                Articulos: tranferencia.Articulos,
                Entrada: tranferencia.Entrada,
                Referencia: tranferencia.Referencia.toUpperCase(),
                AlmacenDestino: tranferencia.AlmacenDestinoEntrada,
                Observaciones: tranferencia.Observaciones,
                Estatus: getVerificacion(entradas, tranferencia),
            }
        })
    }

    const refactorTransferencias = (transferencias) => {
        const transferenciasRefactor = []
        transferencias.forEach((transferencia) => {
            const tranferenciaFinded = transferenciasRefactor.find((transf) => {
                return transf.suc === getSucursalByAlmacen(transferencia.AlmacenDestinoEntrada)
            })
            if (!tranferenciaFinded) transferenciasRefactor.push({
                suc: getSucursalByAlmacen(transferencia.AlmacenDestinoEntrada),
                listEntradas: `'${transferencia.Entrada}'`
            })
            else {
                tranferenciaFinded.listEntradas += `,'${transferencia.Entrada}'`
            }
        })
        return transferenciasRefactor;
    }

    const getVerificacion = (entradas, tranferencia) => {
        const sucursal = getSucursalByAlmacen(tranferencia.AlmacenDestinoEntrada);
        let documento = undefined;
        let offLine = false;

        entradas.forEach((entrada) => {
            if (sucursal === entrada.suc) {
                if (!entrada.success)
                    offLine = true;
                else
                    documento = entrada.data.find((doc) => doc.Documento === tranferencia.Entrada);
            }
        })
        if (offLine) return 'Sin conexion';
        return documento ? 'Exito' : 'Fallo'
    }

    const getEntradasForDate = async (transferencias, dateStart, dateEnd, dateIni) => {
        const resultEntradas = await transferencias.map(async (suc) => {
            
            const dat = await getEntradasToday(
                getConnectionFrom(suc.suc),
                suc.listEntradas,
                dateStart,
                dateEnd,
                getDatabase(dateIni, suc.suc)
            );
            dat.suc = suc.suc
            return dat
        })
        return await Promise.all(resultEntradas);
    }

    return {
        getConsolidacionesForDate,
    }
})();

module.exports = servicesConsolidaciones;