const { createContentAssert, createResponse, getConnectionFrom, createContentError, getDatabase, getEndDayMonth } = require('../../../utils');
const { validateSucursal, validateFechas } = require('../validations');
const { getVentasByFecha, getAllVentasByFecha } = require('../models');

const ServicesCocina = (() => {

    const mainRoute = () => {
        const response = createContentAssert("Ruta principal de cocina");
        return createResponse(200, response);
    }

    const getSalesByDate = async (sucursal = '', mes1, mes2) => {
        let validate = validateFechas(mes1, mes2);
        if (!validate.success)
            return createResponse(400, validate);
        
        const month1 = new Date(parseInt(mes1.slice(0, 4)), parseInt(mes1.slice(4, 6)), 1);
        const month2 = new Date(parseInt(mes2.slice(0, 4)), parseInt(mes2.slice(4, 6)), 1);

        const dbMonth1 = getDatabase(month1);
        const dbMonth2 = getDatabase(month2);

        if (!dbMonth1 || !dbMonth2) return createResponse(
            400,
            createContentError('El mes solicitado es mayor de los registros')
        )

        let dateStart1 = `${mes1.slice(0, 6)}01`
        let dateEnd1 = `${mes1.slice(0, 6)}${getEndDayMonth(mes1.slice(0, 4), mes1.slice(4, 6))}`
        let dateStart2 = `${mes1.slice(0, 6)}01`
        let dateEnd2 = `${mes1.slice(0, 6)}${getEndDayMonth(mes1.slice(0, 4), mes1.slice(4, 6))}`
        
        const sucursales = sucursal.split(',');
        if (sucursales.length > 1) {
            sucursales.forEach((suc) => {
                validate = validateSucursal(suc);
                if (!validate.success)
                    return createResponse(400, validate);
            })
            const data = await sucursales.map(async (suc) => {
                const conexion = getConnectionFrom(suc);
    
                const response = await getVentasByFecha(conexion, suc, mes1, mes2);
                if (response.success) return response.data
                return [
                    {
                        Suc: suc,
                        Mes: 0,
                        MesMovimientoLetra: 'Vacio',
                        Dia: 0,
                        Venta: 0,
                        PrimeraVenta: 0,
                        UltimaVenta: 0,
                        error: 'Fallo con la conexion en ' + suc
                    }
                ];
            })
            const info = await Promise.all(data);

            let error = false;
            let message = ''
            const fields = ['Dia']
            const response = info.reduce((acumInfo, suc) => {
                if (suc.length === 1 && suc[0].error) {
                    error = true
                    message = suc[0].error
                };
                suc.forEach((sc) => {
                    const sucFinded = fields.find((field) => field === sc.MesMovimientoLetra)
                    if (!sucFinded) fields.push(sc.MesMovimientoLetra)
                })
                acumInfo.push(...suc)
                return acumInfo
            }, []);
            fields.push('Total')

            if (error) {
                return createResponse(400, createContentError(message, response));
            }
            
            return createResponse(
                200,
                createContentAssert(
                    'Datos encontrados en la base de datos',
                    { data: response, fields}
                )
            );
        } else {
            validate = validateSucursal(sucursal);
            if (!validate.success)
                return createResponse(400, validate);
            const conexion = getConnectionFrom(sucursal);
            const response = await getVentasByFecha(conexion, sucursal, mes1, mes2);
                if (!response.success) return createResponse(400, response);
            
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
    }

    const getAllSalesByDate = async (sucursal = '', fechaInicial, fechaFinal) => {
        let validate = validateFechas(fechaInicial, fechaFinal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);

        const response = await getAllVentasByFecha(conexion, sucursal, fechaInicial, fechaFinal);
        if (!response.success)
            return createResponse(400, response);
        return createResponse(200, response);
    }

    return {
        mainRoute,
        getSalesByDate,
        getAllSalesByDate,
    }
})();

module.exports = ServicesCocina;