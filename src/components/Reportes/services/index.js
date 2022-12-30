const {
    createResponse,
    getConnectionFrom,
    createContentError,
    getNameBySiglas,
    getDatabase,
    toMoment,
} = require('../../../utils');
const {
    validateSucursal,
    validateAlmacenTienda,
    validateDate,
    validateDates
} = require('../validations');
const {
    getInventoryByShopAndWarehouse,
    GetSalesForDate,
    getReplacementsBuys,
    getReplacementsBills,
    getBinnacleBuys,
    getListCreditsCustomers,
} = require('../models');

const ServicesReportes = (() => {
    
    const getInventoryCloseYear = async (sucursal = '', tienda = 0, almacen = 0) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateAlmacenTienda(tienda);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateAlmacenTienda(almacen);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getInventoryByShopAndWarehouse(conexion, tienda, almacen);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }
    
    const getVentasPorDia = async (sucursal = '', FechaIni = '', FechaFin = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(FechaIni);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(FechaFin);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDates(FechaIni, FechaFin);
        if (!validate.success)
            return createResponse(400, validate);

        const dataBaseStart = getDatabase(toMoment(FechaIni), sucursal);
        const dataBaseEnd = getDatabase(toMoment(FechaFin), sucursal);

        let union = '';
        if (dataBaseStart !== dataBaseEnd)
            union = `
                    UNION ALL
                    SELECT
                        Fecha,
                        VentaTotal = SUM(VentaValorNeta),
                        CostoTotal = SUM(CostoValorNeto),
                        UnidadesTotales = COUNT(*)
                    FROM ${dataBaseEnd}.dbo.QVDEMovAlmacen
                    WHERE (Fecha BETWEEN @FechaInicial AND @FechaFinal)
                        AND TipoDocumento = 'V'
                        AND Estatus = 'E'
                    GROUP BY Fecha, Documento
            `;

        const conexion = getConnectionFrom(sucursal);
        const response  = await GetSalesForDate(conexion, getNameBySiglas(sucursal), FechaIni, FechaFin, dataBaseStart, union);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }
    
    const getReposicionesCompras = async (sucursal = '', FechaCorte = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(FechaCorte);
        if (!validate.success)
            return createResponse(400, validate);

        const dataBase = (sucursal === 'TY' || sucursal === 'TF') ? 'CA2015REPOSICIONESTORTILLERIAS' : 'CA2015REPOSICIONES';
        const conexion = getConnectionFrom('ZR');
        const response  = await getReplacementsBuys(conexion, sucursal, dataBase, FechaCorte);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getReposicionesGastos = async (sucursal = '', FechaCorte = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(FechaCorte);
        if (!validate.success)
            return createResponse(400, validate);

        const dataBase = (sucursal === 'TY' || sucursal === 'TF') ? 'CA2015REPOSICIONESTORTILLERIAS' : 'CA2015REPOSICIONES';
        const conexion = getConnectionFrom('ZR');
        const response  = await getReplacementsBills(conexion, sucursal, dataBase, FechaCorte);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getBitacoraCompras = async (sucursal = '', FechaCorte = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(FechaCorte);
        if (!validate.success)
            return createResponse(400, validate);

        const dataBase = (sucursal === 'TY' || sucursal === 'TF') ? 'CA2015REPOSICIONESTORTILLERIAS' : 'CA2015REPOSICIONES';
        const conexion = getConnectionFrom('ZR');
        const response  = await getBinnacleBuys(conexion, sucursal, dataBase, FechaCorte);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getListaCreditoTrabajadores = async (sucursal = '', FechaCorte = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(FechaCorte);
        if (!validate.success)
            return createResponse(400, validate);

        const dataBase = getDatabase(toMoment(FechaCorte), sucursal);
        const conexion = getConnectionFrom(sucursal);
        const response  = await getListCreditsCustomers(conexion, sucursal, dataBase, FechaCorte);

        if (!response.success) return createResponse(400, response)

        const listSeparated = response.data.reduce((creditAcum, credit) => {
            if (creditAcum.length === 0) creditAcum.push({
                Caja: credit.Caja,
                SubTotal: credit.Pagado,
                Details: [credit]
            })
            else {
                const cajaFinded = creditAcum.findIndex((cred) => cred.Caja === credit.Caja)
                if (cajaFinded === -1) creditAcum.push({
                        Caja: credit.Caja,
                        SubTotal: credit.Pagado,
                        Details: [credit]
                    })
                else {
                    creditAcum[cajaFinded].Details.push(credit)
                    creditAcum[cajaFinded].SubTotal += credit.Pagado
                }
            }
            return creditAcum;
        }, [])
        response.data = listSeparated
        return createResponse(200, response)
    }

    return {
        getInventoryCloseYear,
        getVentasPorDia,
        getReposicionesCompras,
        getReposicionesGastos,
        getBitacoraCompras,
        getListaCreditoTrabajadores,
    }
})();

module.exports = ServicesReportes;