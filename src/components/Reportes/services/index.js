const {
    createResponse,
    getConnectionFrom,
    createContentError,
    getNameBySiglas,
    getDatabase,
    toMoment,
    getEndDayMonth,
    getListConnectionByCompany,
    getSucursalByCategory,
    createContentAssert,
    configSearch,
} = require('../../../utils');
const {
    validateAlmacenTienda,
    validateDate,
    validateDates,
    validateFechas,
    validateEmpty
} = require('../validations');
const { validateSucursal } = require('../../../validations');
const {
    getInventoryByShopAndWarehouse,
    GetSalesForDate,
    getReplacementsBuys,
    getReplacementsBills,
    getBinnacleBuys,
    getListCreditsCustomers,
    getVentasByFecha,
    getIOTortillas,
    getReportMonthlyCPS,
    getReportMonthlyInvF,
    getReportMonthlyMEntradas,
    getReportMonthlyMSalidas,
    getReportMonthlyRecargas,
    getReportMonthlyUAI,
    getReportMonthlyVPS,
    getReportMonthlyVentas,
    getSalesByArticles,
    getOnlyExistences,
    getMove,
    getMovesByFilter,
    getSalesByHour,
    getTopSalesArticles,
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

        if (sucursal === 'ALLS') {
            let listConexions = getListConnectionByCompany('SPA').filter((suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.' && suc.name !== 'BODEGA');

            const resultOnline = listConexions.map(async (sucursal) => {
                const suc = getSucursalByCategory('SPA' + sucursal.name);
                const response = await _getSalesForDate(FechaIni, FechaFin, suc, sucursal.connection);
                response.status = response.success ? 'Online' : 'Offline';
                response.sucursal = sucursal.name;
                return response;
            });

            const results = await Promise.all(resultOnline);
            return createResponse(200, createContentAssert('Informacion de ventas', results));
        } else {
            const conexion = getConnectionFrom(sucursal);
            const response = await _getSalesForDate(FechaIni, FechaFin, sucursal, conexion);
            if (!response.success) return createResponse(400, response)
            return createResponse(200, response)
        }
    }

    const _getSalesForDate = async (FechaIni, FechaFin, sucursal, conexion) => {
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

        // const conexion = getConnectionFrom(sucursal);
        const response  = await GetSalesForDate(conexion, getNameBySiglas(sucursal), FechaIni, FechaFin, dataBaseStart, union);

        return response
    }
    
    const getVentasPorArticulos = async (sucursal = '', FechaIni = '', FechaFin = '', articles = []) => {
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

        if (articles.length === 0)
            return createResponse(400, createContentError('No se recibieron articulos'));

        let response;
        let dataArticles = {};
        let existencias = {};
        const articlesSucs = [];
        const _addDataArticle = (data) => {
            if (!dataArticles[`${data.Articulo}`]) {
                articlesSucs.push(`${data.Sucursal}-${data.Articulo}`)
                dataArticles[`${data.Articulo}`] = {
                    Articulo: data.Articulo,
                    Nombre: data.Nombre,
                    Relacion: data.Relacion,
                    Piezas: data.VentasPza,
                    Cajas: data.VentasCja,
                    Valor: data.VentasValor,
                    ExistenciaActual: data.ExistenciaActualRegular,
                    ExistenciaActualUC: data.ExistenciaActualUC,
                    CostoExistenciaNeto: data.CostoExistenciaNeto
                }
                existencias[`${data.Articulo}`] = {}
                existencias[`${data.Articulo}`][`${data.Sucursal}`] = {
                    Piezas: data.ExistenciaActualRegular,
                    Cajas: data.ExistenciaActualUC,
                    Valor: data.CostoExistenciaNeto
                }
            } else {
                dataArticles[`${data.Articulo}`].Piezas += data.VentasPza;
                dataArticles[`${data.Articulo}`].Cajas += data.VentasCja;
                dataArticles[`${data.Articulo}`].Valor += data.VentasValor;
                const existeceSuc = articlesSucs.find((articleSuc) => articleSuc === `${data.Sucursal}-${data.Articulo}`)
                if (!existeceSuc) {
                    articlesSucs.push(`${data.Sucursal}-${data.Articulo}`)
                    dataArticles[`${data.Articulo}`].ExistenciaActual += data.ExistenciaActualRegular;
                    dataArticles[`${data.Articulo}`].ExistenciaActualUC += data.ExistenciaActualUC;
                    dataArticles[`${data.Articulo}`].CostoExistenciaNeto += data.CostoExistenciaNeto;
                }
                if (!existencias[`${data.Articulo}`][`${data.Sucursal}`])
                    existencias[`${data.Articulo}`][`${data.Sucursal}`] = {
                        Piezas: data.ExistenciaActualRegular,
                        Cajas: data.ExistenciaActualUC,
                        Valor: data.CostoExistenciaNeto
                    }
            }
        }

        if (sucursal.toUpperCase() === 'ALL') {
            const listConexions = getListConnectionByCompany('SPA').filter((suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.');

            const responses = listConexions.map(async (sucursal) => {
                let response
                const suc = getSucursalByCategory('SPA' + sucursal.name);
                response = await getSalesBySuc(suc, FechaIni, FechaFin, articles);
                return response;
            });

            const resultVentas = await Promise.all(responses);
            const serversOffline = resultVentas.filter((server) => !server.success);
            if (serversOffline.length === resultVentas.length)
                return createResponse(200, createContentError('No hay conexion con los servidores'));

            const data = resultVentas.reduce((dias, sucursal) => {
                if (dias.length === 0) {
                    const dateStartMoment = toMoment(FechaIni.slice(0, 4) + '-' + FechaIni.slice(4, 6) + '-' + FechaIni.slice(6, 8));
                    const dateEndMoment = toMoment(FechaFin.slice(0, 4) + '-' + FechaFin.slice(4, 6) + '-' + FechaFin.slice(6, 8));
                    const totalDias = dateEndMoment.diff(dateStartMoment, 'days');
    
                    for (let day = 0; day <= totalDias; day++) {
                        const newDay = dateStartMoment.add((day === 0) ? 0 : 1, 'days');
                        dias.push({ Fecha: newDay.format('DD-MM-YYYY'), FechaMoment: newDay, Totales: {} })
                    }
                }
                
                if (sucursal.success) {
                    sucursal.data.forEach((diaToVerify) => {
                        const diaIndex = dias.findIndex((daySaved) => daySaved.Fecha === toMoment(diaToVerify.Fecha).format('DD-MM-YYYY'))
                        if (diaIndex !== -1) {
                            if (!dias[diaIndex][`${diaToVerify.Sucursal}`]) dias[diaIndex][`${diaToVerify.Sucursal}`] = {};
                            dias[diaIndex][`${diaToVerify.Sucursal}`][`${diaToVerify.Articulo}`] = {
                                Piezas: diaToVerify.VentasPza,
                                Cajas: diaToVerify.VentasCja,
                                Valor: diaToVerify.VentasValor
                            }

                            if (!dias[diaIndex].Totales[`${diaToVerify.Articulo}`]) dias[diaIndex].Totales[`${diaToVerify.Articulo}`] = { Piezas: 0, Cajas: 0, Valor: 0 };
                            dias[diaIndex].Totales[`${diaToVerify.Articulo}`].Piezas += diaToVerify.VentasPza;
                            dias[diaIndex].Totales[`${diaToVerify.Articulo}`].Cajas += diaToVerify.VentasCja;
                            dias[diaIndex].Totales[`${diaToVerify.Articulo}`].Valor += diaToVerify.VentasValor;
                        }

                        _addDataArticle(diaToVerify);
                    })
                } else
                    dias.forEach((dia, index) => dias[index][`${sucursal.Sucursal}`] = { Fail: true })
                return dias;
            }, []);

            response = createContentAssert('Ventas de todas las sucursales', data)
            response.Sucursal = sucursal;
            response.Totales = dataArticles;
            response.Existencias = existencias;
        } else {
            response = await getSalesBySuc(sucursal, FechaIni, FechaFin, articles);
            if (!response.success) return createResponse(400, response);
            const dateStartMoment = toMoment(FechaIni.slice(0, 4) + '-' + FechaIni.slice(4, 6) + '-' + FechaIni.slice(6, 8));
            const dateEndMoment = toMoment(FechaFin.slice(0, 4) + '-' + FechaFin.slice(4, 6) + '-' + FechaFin.slice(6, 8));
            const totalDias = dateEndMoment.diff(dateStartMoment, 'days');

            const data = response.data.reduce((dias, diaToVerify) => {
                if (dias.length === 0) {
                    for (let day = 0; day <= totalDias; day++) {
                        const newDay = dateStartMoment.add((day === 0) ? 0 : 1, 'days');
                        dias.push({ Fecha: newDay.format('DD-MM-YYYY') })
                    }
                }

                const diaIndex = dias.findIndex(
                    (daySaved) => daySaved.Fecha === toMoment(diaToVerify.Fecha).format('DD-MM-YYYY')
                )

                if (diaIndex !== -1)
                    dias[diaIndex][`${diaToVerify.Articulo}`] = {
                        Piezas: diaToVerify.VentasPza,
                        Cajas: diaToVerify.VentasCja,
                        Valor: diaToVerify.VentasValor
                    }
                _addDataArticle(diaToVerify)
                return dias
            }, []);
            response.data = data
            response.Sucursal = sucursal;
            response.Totales = dataArticles;
            response.Existencias = existencias;
        }

        return createResponse(200, response)
    }

    const getSalesBySuc = async (sucursal, FechaIni, FechaFin, articles) => {
        const dataBaseStart = getDatabase(toMoment(FechaIni), sucursal);
        const dataBaseEnd = getDatabase(toMoment(FechaFin), sucursal);

        const articulos = articles.reduce((arts, article, index) => {
            if (index === 0) arts += '\'' + article + '\'';
            else arts += ',\'' + article + '\'';
            return arts;
        }, '')

        let union = '';
        if (dataBaseStart !== dataBaseEnd)
            union = `
            UNION ALL
            SELECT
                Sucursal = @Sucursal,
                M.Articulo, M.Nombre, M.Fecha, VentasPza = SUM(M.CantidadRegular), VentasCja = SUM(M.CantidadRegularUC), VentasValor = SUM(M.VentaValorNeta),
                Relacion = CAST(CAST(M.FactorCompra AS INT) AS NVARCHAR) + '/' + M.UnidadCompra + ' - ' + CAST(CAST(M.FactorVenta AS INT) AS NVARCHAR) + '/' + M.UnidadVenta,
                E.ExistenciaActualRegular, E.ExistenciaActualUC, E.CostoExistenciaNeto
            FROM ${dataBaseEnd}.dbo.QVDEMovAlmacen AS M
            LEFT JOIN QVExistencias AS E ON M.Articulo = E.Articulo AND M.Almacen = E.Almacen AND M.Tienda = E.Tienda
            WHERE M.Articulo IN (${articulos})
                AND M.TipoDocumento = 'V' AND M.Estatus = 'E'
                AND (M.Fecha BETWEEN @fechaInicial AND @FechaFinal)
                AND M.Tienda = @Tienda
                AND M.Almacen = @Almacen
            GROUP BY M.Articulo, M.Nombre, M.Fecha, M.FactorCompra, M.FactorVenta, M.UnidadCompra, M.UnidadVenta, E.ExistenciaActualRegular, E.ExistenciaActualUC, E.CostoExistenciaNeto;
            `;

        const conexion = getConnectionFrom(sucursal);
        const response  = await getSalesByArticles(conexion, sucursal, FechaIni, FechaFin, dataBaseStart, union, articulos);
        return response;
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
        return createResponse(200, response);
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
                Counts: 1,
                Details: [credit]
            })
            else {
                const cajaFinded = creditAcum.findIndex((cred) => cred.Caja === credit.Caja)
                if (cajaFinded === -1) creditAcum.push({
                        Caja: credit.Caja,
                        SubTotal: credit.Pagado,
                        Counts: 1,
                        Details: [credit]
                    })
                else {
                    creditAcum[cajaFinded].Details.push(credit);
                    creditAcum[cajaFinded].SubTotal += credit.Pagado;
                    creditAcum[cajaFinded].Counts ++;
                }
            }
            return creditAcum;
        }, [])
        response.data = listSeparated
        return createResponse(200, response)
    }
    
    const getDataBySucursal = async (sucursal, month1, month2, dateMoth1, dateMoth2) => {
        console.log('pasa 2.0');
        validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        console.log('pasa 2.1'.replace(), month1, sucursal, month2);
        dbMonth1 = getDatabase(toMoment(month1.toString().replace('Z', '')), sucursal);
        dbMonth2 = getDatabase(toMoment(month2.toString().replace('Z', '')), sucursal);

        if (!dbMonth1 || !dbMonth2) return createResponse(
            400,
            createContentError('El mes solicitado es mayor de los registros')
        )
        const dateStart1 = `${dateMoth1.slice(0, 6)}01`;
        const dateEnd1 = `${dateMoth1.slice(0, 6)}${getEndDayMonth(dateMoth1.slice(0, 4), dateMoth1.slice(4, 6))}`;
        const dateStart2 = `${dateMoth2.slice(0, 6)}01`;
        const dateEnd2 = `${dateMoth2.slice(0, 6)}${getEndDayMonth(dateMoth2.slice(0, 4), dateMoth2.slice(4, 6))}`;

        console.log('pasa 2.2');
        const conexion = getConnectionFrom(sucursal);

        if (dbMonth1 === dbMonth2) {
            const response = await getVentasByFecha(conexion, sucursal, dateStart1, dateEnd2, dbMonth1);
            if (!response.success) return createResponse(400, response);
            console.log('pasa 2.3');
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
            console.log('pasa 2.4');
            
            const arrayResponse = await Promise.all(result)
            if (!arrayResponse[0].success) return createResponse(400, arrayResponse[0]);
            if (!arrayResponse[1].success) return createResponse(400, arrayResponse[1]);
            arrayResponse[1].data.push(...arrayResponse[0].data)

            return arrayResponse[1];
        }
    }

    const getSalesByDate = async (sucursal = '', dateMoth1, dateMoth2) => {
        console.log('pasa 0');
        let validate = validateFechas(dateMoth1, dateMoth2);
        if (!validate.success) return createResponse(400, validate);
        console.log('pasa 1');
        
        const month1 = new Date(parseInt(dateMoth1.slice(0, 4)), parseInt(dateMoth1.slice(4, 6)) - 1, 1);
        const month2 = new Date(parseInt(dateMoth2.slice(0, 4)), parseInt(dateMoth2.slice(4, 6)) - 1, 1);

        console.log('pasa 2');
        let response;
        // const sucursales = sucursal.split(',');format

        // if (sucursales.length > 1) {
        //         response = await getDataBySucursal(sucursales[0], month1, month2, dateMoth1, dateMoth2);
        //         if (response.status) return response

        //         const response2 = await getDataBySucursal(sucursales[1], month1, month2, dateMoth1, dateMoth2);
        //         if (response2.status) return response2
        //         response.data.push(...response2.data)
        // } else {
        // }
        response = await getDataBySucursal(sucursal, month1, month2, dateMoth1, dateMoth2);
        if (response.status) return response

        console.log('pasa 3');
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

        console.log('pasa 4');
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
        console.log('pasa 5');
        
        return createResponse(200, response);
    }

    const getMovesTortillas = async (sucursal = '', Fecha = '') => {
        let validate;
        if (sucursal.toUpperCase().trim() !== 'ALL') {
            validate = validateSucursal(sucursal);
            if (!validate.success) return createResponse(400, validate);
        }

        validate = validateDate(Fecha);
        if (!validate.success)
            return createResponse(400, validate);

        if (sucursal.toUpperCase().trim() !== 'ALL')
            return await dataIOTortillas(sucursal, Fecha);
        else {
            const listConexions = getListConnectionByCompany('SPA').filter(
                (suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.' && suc.name != 'BODEGA'
            );

            const resultMoves = listConexions.map(async (sucursal) => {
                const suc = getSucursalByCategory('SPA' + sucursal.name);
                const response = await dataIOTortillas(suc, Fecha);
                response.response.name = sucursal.name
                return response.response;
            });

            const responsesMoves = await Promise.all(resultMoves);
            return createResponse(200, createContentAssert('Todas las sucursales', responsesMoves));
        }
    }

    const dataIOTortillas = async (sucursal = '', Fecha = '') => {
        const conexion = getConnectionFrom(sucursal);
        const response  = await getIOTortillas(conexion, sucursal, Fecha);

        if (!response.success) {
            response.data = []
            response.inputs = 0;
            response.outputs = 0;
            response.sucursal = sucursal;
            response.Fecha = Fecha;
            return createResponse(400, response);
        }

        let countMoves = 0;
        let sumCantidad = 0;
        let movePrevious;
        let inputs = 0, outputs = 0;
        const listMoves = response.data.reduce((moves, move, index) => {
            if (move.TipoDocumento !== 'V') {
                countMoves = 0;
                inputs += move.CantidadRegular;
            } else outputs += move.CantidadRegular;

            if (countMoves === 0) {
                if (index !== 0) {
                    movePrevious.CantidadRegular = sumCantidad;
                    moves.push(movePrevious);
                    sumCantidad = 0;
                } else if (move.TipoDocumento === 'V') sumCantidad = move.CantidadRegular;
                if ((moves.length === 0 && move.TipoDocumento !== 'V') || move.TipoDocumento !== 'V')
                    moves.push(move);
            } else sumCantidad += move.CantidadRegular;

            countMoves++;
            movePrevious = move;
            if (index === response.data.length - 1) {
                if (move.TipoDocumento === 'V') movePrevious.CantidadRegular = sumCantidad;
                moves.push(movePrevious);
            }

            return moves;
        }, [])
        response.data = listMoves
        response.inputs = inputs;
        response.outputs = outputs;
        response.sucursal = sucursal;
        response.Fecha = Fecha;
        return createResponse(200, response)
    }

    const getInformeOperativoMensual = async (sucursal = '', FechaIni, FechaFin) => {
        let response;
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateDate(FechaIni);
        if (!validate.success) return createResponse(400, validate);

        validate = validateDate(FechaFin);
        if (!validate.success) return createResponse(400, validate);

        validate = validateDates(FechaIni, FechaFin);
        if (!validate.success) return createResponse(400, validate);

        const dataBase = getDatabase(toMoment(FechaIni), sucursal);
        const conexion = getConnectionFrom(sucursal);

        const requestReports = [
            getReportMonthlyCPS,
            getReportMonthlyInvF,
            getReportMonthlyMEntradas,
            getReportMonthlyMSalidas,
            getReportMonthlyRecargas,
            getReportMonthlyUAI,
            getReportMonthlyVPS,
            getReportMonthlyVentas,
        ];

        const results = requestReports.map(async(callback) => {
            response = await callback(conexion, sucursal, FechaIni, FechaFin, dataBase);
            return response;
        });
        const responses = await Promise.all(results);

        return createResponse(200, createContentAssert('Contenido', responses));
    }

    const getDataOfDocument = async (sucursal = '', document = '', dataBase = '', by = 'document') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateEmpty(document, 'El Documento');
        if (!validate.success) return createResponse(400, validate);

        validate = validateEmpty(dataBase, 'La Base de Datos');
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const where = by === 'document' ? `WHERE Documento = '${document}'` : `WHERE Referencia = '${document}'`;
        const response  = await getMove(conexion, sucursal, where, dataBase);

        if (!response.success) return createResponse(400, response)

        const docs = []
        const { dataDoc, data } = response.data.reduce((result, row) => {
            if (Object.keys(result.dataDoc).length === 0)
                result.dataDoc = {
                    Documento: row.Documento,
                    Referencia: row.Referencia,
                    DescripcionAlmacen: row.DescripcionAlmacen,
                    Caja: row.Caja,
                    Cajero: row.Cajero,
                    NombreCajero: row.NombreCajero,
                    Observaciones: row.Observaciones,
                    Fecha: row.Fecha,
                    Hora: row.Hora,
                    TipoDocumento: row.TipoDocumento,
                    Estatus: row.Estatus,
                    Tercero: row.Tercero,
                    NombreTercero: row.NombreTercero,
                    Subtotal: row.Subtotal,
                    Descuentos: row.Descuentos,
                    IvaValor: row.IvaValor,
                    IepsValor: row.IepsValor,
                    Total: row.Total,
                }
            else {
                result.dataDoc.Subtotal += row.Subtotal;
                result.dataDoc.Descuentos += row.Descuentos;
                result.dataDoc.IvaValor += row.IvaValor;
                result.dataDoc.IepsValor += row.IepsValor;
                result.dataDoc.Total += row.Total;
            }
            result.data.push({
                Articulo: row.Articulo,
                CantidadRegular: row.CantidadRegular,
                Nombre: row.Nombre,
                UnidadVenta: row.UnidadVenta,
                Relacion: row.Relacion,
                Costo: row.CostoUnitarioSinDcto,
                Subtotal: row.Subtotal,
                Iva: row.IvaTasa,
                Ieps: row.IepsTasa,
                Descuento: row.DescuentoTasaFinal,
            })
            const docFinded = docs.find((docu) => docu === row.Documento)
            if (!docFinded) docs.push(row.Documento)
            return result
        }, { dataDoc: {}, data: [] })

        const res = {
            success: response.success,
            message: response.message,
            documents: docs,
            articles: data.length,
            dataDoc: dataDoc,
            data: data,
        }
        return createResponse(200, res);
    }

    const getListDocuments = async (sucursal = '', dataBase = '', typeDoc = '', likeDoc = '', likeRef = '', article = '', order = '', fechaInit = '', fechaEnd = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateEmpty(typeDoc, 'El Tipo de Documento');
        if (!validate.success) return createResponse(400, validate);

        validate = validateEmpty(dataBase, 'La Base de Datos');
        if (!validate.success) return createResponse(400, validate);

        validate = validateEmpty(order, 'el orden por fechas');
        if (!validate.success) return createResponse(400, validate);
        
        if (order !== 'ASC' && order !== 'DESC')
        return createResponse(400, createContentError('Ordenamiento invalido'));

        let whereFechas = '';

        if (fechaInit.trim() !== '' && fechaEnd.trim() !== '')
            whereFechas = ` AND (Fecha BETWEEN CAST('${fechaInit}' AS DATETIME) AND CAST('${fechaEnd}' AS DATETIME))`;
        else if (fechaInit.trim() !== '')
            whereFechas = ` AND Fecha >= CAST('${fechaInit}' AS DATETIME)`
        else if (fechaEnd.trim() !== '')
            whereFechas = ` AND Fecha <= CAST('${fechaEnd}' AS DATETIME)`

        const whereDocument = likeDoc.trim() === '' ? '' : ` AND Documento LIKE '%${configSearch(likeDoc)}%' `;
        const whereReference = likeRef.trim() === '' ? '' : ` AND Referencia LIKE '%${configSearch(likeRef)}%' `;
        const whereArticle = article === '' ? '' : ` AND Articulo = '${article}' `;
        const groupArticle = article === '' ? '' : ', Articulo ';

        const conexion = getConnectionFrom(sucursal);
        const response  = await getMovesByFilter(
            conexion,
            sucursal,
            dataBase,
            typeDoc,
            whereDocument,
            whereReference,
            whereArticle,
            groupArticle,
            order,
            whereFechas,
        );

        if (!response.success) return createResponse(400, response)
        const res = {
            success: response.success,
            message: response.message,
            count: response.data.length,
            data: response.data
        }
        return createResponse(200, res);
    }
    
    const getVentasPorHora = async (sucursal = '', FechaIni = '', FechaFin = '') => {
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

        if (sucursal === 'ALLS') {
            return createResponse(200, createContentError('No se puede extraer de todas las sucursales'));
        } else {
            const conexion = getConnectionFrom(sucursal);
            const response = await _getSalesForHo(FechaIni, FechaFin, sucursal, conexion);
            if (!response.success) return createResponse(400, response)
            return createResponse(200, response)
        }
    }

    const _getSalesForHo = async (FechaIni, FechaFin, sucursal, conexion) => {
        const dataBaseStart = getDatabase(toMoment(FechaIni), sucursal);
        const dataBaseEnd = getDatabase(toMoment(FechaFin), sucursal);

        let union = '';
        if (dataBaseStart !== dataBaseEnd)
            union = `
                UNION ALL
                SELECT  
                    Fecha, HoraVenta = DATEPART(HOUR, Hora), CantidadRegular, VentaValorNeta
                FROM ${dataBaseEnd}.dbo.QVDEMovAlmacen
                WHERE Tipodocumento = 'V' AND Estatus = 'E'
                    AND (Fecha BETWEEN @FechaInicial AND @FechaFinal)
            `;

        const response  = await getSalesByHour(conexion, getNameBySiglas(sucursal), FechaIni, FechaFin, dataBaseStart, union);

        return response
    }

    const getArticulosTopEnVentas = async (sucursal = '', FechaIni = '', FechaFin = '') => {
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

        if (sucursal === 'ALLS') {
            return createResponse(200, createContentError('No se puede extraer de todas las sucursales'));
        } else {
            const conexion = getConnectionFrom(sucursal);
            const response = await _getTopSales(FechaIni, FechaFin, sucursal, conexion);
            if (!response.success) return createResponse(400, response)
            return createResponse(200, response)
        }
    }

    const _getTopSales = async (FechaIni, FechaFin, sucursal, conexion) => {
        const dataBaseStart = getDatabase(toMoment(FechaIni), sucursal);
        const dataBaseEnd = getDatabase(toMoment(FechaFin), sucursal);

        let union = '';
        if (dataBaseStart !== dataBaseEnd)
            union = `
                UNION ALL
                SELECT
                    Articulo, CostoValorNeto, CantidadRegular, VentaValorNeta
                FROM  ${dataBaseEnd}.dbo.QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E' AND ( Fecha BETWEEN @FechaInicio AND @FechaFinal ) AND Almacen = @Almacen AND Tienda = @Tienda
            `;

        const response  = await getTopSalesArticles(conexion, sucursal, FechaIni, FechaFin, dataBaseStart, union);

        return response
    }

    return {
        getInventoryCloseYear,
        getVentasPorDia,
        getVentasPorArticulos,
        getReposicionesCompras,
        getReposicionesGastos,
        getBitacoraCompras,
        getListaCreditoTrabajadores,
        getSalesByDate,
        getMovesTortillas,
        getInformeOperativoMensual,
        getDataOfDocument,
        getListDocuments,
        getVentasPorHora,
        getArticulosTopEnVentas,
    }
})();

module.exports = ServicesReportes;