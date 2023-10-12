const {
    createContentAssert,
    createResponse,
    getConnectionFrom,
    createContentError,
    getDatabase,
    getEndDayMonth,
} = require('../../../utils');
const { validateFechas } = require('../validations');
const { validateSucursal } = require('../../../validations');
const { getVentasByFecha, getAllVentasByFecha } = require('../models');

const ServicesCocina = (() => {

    const mainRoute = () => {
        const response = createContentAssert("Ruta principal de cocina");
        return createResponse(200, response);
    }
    
    const getDataBySucursal = async (sucursal, month1, month2, dateMoth1, dateMoth2) => {
        validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        dbMonth1 = getDatabase(month1, sucursal);
        dbMonth2 = getDatabase(month2, sucursal);

        if (!dbMonth1 || !dbMonth2) return createResponse(
            400,
            createContentError('El mes solicitado es mayor de los registros')
        )
        const dateStart1 = `${dateMoth1.slice(0, 6)}01`;
        const dateEnd1 = `${dateMoth1.slice(0, 6)}${getEndDayMonth(dateMoth1.slice(0, 4), dateMoth1.slice(4, 6))}`;
        const dateStart2 = `${dateMoth2.slice(0, 6)}01`;
        const dateEnd2 = `${dateMoth2.slice(0, 6)}${getEndDayMonth(dateMoth2.slice(0, 4), dateMoth2.slice(4, 6))}`;

        const conexion = getConnectionFrom(sucursal);

        if (dbMonth1 === dbMonth2) {
            const response = await getVentasByFecha(conexion, sucursal, dateStart1, dateEnd2, dbMonth1);
            if (!response.success) return createResponse(400, response);
            return response
        } else {
            const consult = [
                {sucursal, conexion, dbMonth: dbMonth1, dateStart: dateStart1, dateEnd: dateEnd1},
                {sucursal, conexion, dbMonth: dbMonth2, dateStart: dateStart2, dateEnd: dateEnd2}
            ]
            const result = await consult.map(async (suc) => {
                const response = await getVentasByFecha(suc.conexion, suc.sucursal, suc.dateStart, suc.dateEnd, suc.dbMonth);
                return response
            });
            
            const arrayResponse = await Promise.all(result)
            if (!arrayResponse[0].success) return createResponse(400, arrayResponse[0]);
            if (!arrayResponse[1].success) return createResponse(400, arrayResponse[1]);
            arrayResponse[1].data.push(...arrayResponse[0].data)

            return arrayResponse[1];
        }
    }

    const getSalesByDate = async (sucursal = '', dateMoth1, dateMoth2) => {
        let validate = validateFechas(dateMoth1, dateMoth2);
        if (!validate.success) return createResponse(400, validate);
        
        const month1 = new Date(parseInt(dateMoth1.slice(0, 4)), parseInt(dateMoth1.slice(4, 6)) - 1, 1);
        const month2 = new Date(parseInt(dateMoth2.slice(0, 4)), parseInt(dateMoth2.slice(4, 6)) - 1, 1);

        let response;
        const sucursales = sucursal.split(',');

        if (sucursales.length > 1) {
                response = await getDataBySucursal(sucursales[0], month1, month2, dateMoth1, dateMoth2);
                if (response.status) return response

                const response2 = await getDataBySucursal(sucursales[1], month1, month2, dateMoth1, dateMoth2);
                if (response2.status) return response2
                response.data.push(...response2.data)
        } else {
            response = await getDataBySucursal(sucursal, month1, month2, dateMoth1, dateMoth2);
            if (response.status) return response
        }

        response.data.sort((mes1, mes2) => {
            if (mes1.Mes !== mes2.Mes) return mes1.Mes - mes2.Mes
            return mes1.Year - mes2.Year
        })

        if (dateMoth1.slice(4, 6) === dateMoth2.slice(4, 6)) {
            response.data = response.data.map((venta) => {
                venta.MesMovimientoLetra += '/' + venta.Year
                return venta
            })
        }

        const fields = ['Dia']
        response.data.forEach((suc) => {
            const sucFinded = fields.find((field) => field === suc.MesMovimientoLetra)
            if (!sucFinded) fields.push(suc.MesMovimientoLetra)
        })
        fields.push('Total')
        response.data = {
            data: response.data,
            fields
        }
        
        return createResponse(200, response);
    }

    const getAllSalesByDate = async (sucursal = '', fechaInicial, fechaFinal) => {
        let validate = validateFechas(fechaInicial, fechaFinal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const dateStart = new Date(parseInt(fechaInicial.slice(0, 4)), parseInt(fechaInicial.slice(4, 6)) - 1, 1);
        const dateEnd = new Date(parseInt(fechaFinal.slice(0, 4)), parseInt(fechaFinal.slice(4, 6)) - 1, 1);

        const dataBaseForDateStart = getDatabase(dateStart, sucursal);
        const dataBaseForDateEnd = getDatabase(dateEnd, sucursal);

        if (dataBaseForDateStart === dataBaseForDateEnd) {
            const response = await getAllVentasByFecha(conexion, sucursal, fechaInicial, fechaFinal, dataBaseForDateStart);
            if (!response.success) return createResponse(400, response);

            return createResponse(200, response);
        } else {
            const consult = [
                {sucursal, conexion, fechaInicial, fechaFinal, db: dataBaseForDateStart},
                {sucursal, conexion, fechaInicial, fechaFinal, db: dataBaseForDateEnd}
            ]
            const result = await consult.map(async (suc) => {
                const response =
                    await getAllVentasByFecha(suc.conexion, suc.sucursal, suc.fechaInicial, suc.fechaFinal, suc.db);
                return response
            });

            const arrayResponse = await Promise.all(result)
            if (!arrayResponse[0].success) return createResponse(400, arrayResponse[0]);
            if (!arrayResponse[1].success) return createResponse(400, arrayResponse[1]);
            arrayResponse[1].data.push(...arrayResponse[0].data)

            return createResponse(200, arrayResponse[1]);
        }
    }

    return {
        mainRoute,
        getSalesByDate,
        getAllSalesByDate,
    }
})();

module.exports = ServicesCocina;