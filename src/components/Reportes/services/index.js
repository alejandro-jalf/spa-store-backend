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
} = require('../../../utils');
const {
    validateSucursal,
    validateAlmacenTienda,
    validateDate,
    validateDates,
    validateFechas
} = require('../validations');
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
                    ExistenciaActual: data.ExistenciaActualRegular,
                    ExistenciaActualUC: data.ExistenciaActualUC,
                    CostoExistenciaNeto: data.CostoExistenciaNeto
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
                        ExistenciaActual: data.ExistenciaActualRegular,
                        ExistenciaActualUC: data.ExistenciaActualUC,
                        CostoExistenciaNeto: data.CostoExistenciaNeto
                    }
            }
        }

        if (sucursal.toUpperCase() === 'ALL') {
            const listConexions = getListConnectionByCompany('SPA').filter((suc) => suc.name != 'TORTILLERIA F.' && suc.name != 'SAYULA T.');

            listConexions.push({ name: 'ExistenciaBodega', connection: ''});
            const responses = listConexions.map(async (sucursal) => {
                let response
                if (sucursal.name === 'ExistenciaBodega')
                    response = await getSalesBySuc('ExistenciaBodega', FechaIni, FechaFin, articles)
                else {
                    const suc = getSucursalByCategory('SPA' + sucursal.name);
                    response = await getSalesBySuc(suc, FechaIni, FechaFin, articles);
                }
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
                
                if (sucursal.success && !sucursal.Existencia) {
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
                } else if (!sucursal.Existencia)
                    dias.forEach((dia, index) => dias[index][`${sucursal.Sucursal}`] = { Fail: true })
                return dias;
            }, []);
            const resultExistenceBO = resultVentas.find((result) => result.Existencia);
            if (resultExistenceBO.success) {
                resultExistenceBO.data.forEach((existence) => {
                    if (dataArticles[`${existence.Articulo}`]) {
                        dataArticles[`${existence.Articulo}`].ExistenciaActual += existence.ExistenciaActualRegular;
                        dataArticles[`${existence.Articulo}`].ExistenciaActualUC += existence.ExistenciaActualUC;
                        dataArticles[`${existence.Articulo}`].CostoExistenciaNeto += existence.CostoExistenciaNeto;

                        existencias[`${existence.Articulo}`].BO = {
                            ExistenciaActual: existence.ExistenciaActualRegular,
                            ExistenciaActualUC: existence.ExistenciaActualUC,
                            CostoExistenciaNeto: existence.CostoExistenciaNeto
                        };
                    }
                })
            }
            response = createContentAssert('Ventas de todas las sucursales', data)
            response.Sucursal = sucursal;
            response.Totales = dataArticles;
            response.Existencias = existencias;
        } else {
            response = await getSalesBySuc(sucursal, FechaIni, FechaFin, articles);
            if (!response.success) return createResponse(400, response);
            response.data.forEach((diaToVerify) => _addDataArticle(diaToVerify));
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

        if (sucursal === 'ExistenciaBodega') {
            const response = await getOnlyExistences(getConnectionFrom('BO'), 'BO', articulos);
            response.Existencia = true;
            return response;
        }

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
    }
})();

module.exports = ServicesReportes;