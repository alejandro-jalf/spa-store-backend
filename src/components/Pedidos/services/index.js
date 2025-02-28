const {
    createResponse,
    getConnectionFrom,
    getHostBySuc,
    getDatabaseBySuc,
} = require('../../../utils');
const {
    validateBodyAddArticle,
    validateStatusPedido,
} = require('../validations');
const { validateSucursal, validateFecha } = require('../../../validations');
const {
    getPedidosEnBodega,
    getPedidosBySucursal,
    getListaArticulosByArticulo,
    getListaArticulosByNombre,
    getListaArticulosByDias,
    getListaArticulos,
    getReporteListaArticulos,
    addPedido,
    addArticle,
    cancelPedido,
    enProcesoPedido,
    sendPedido,
    atendidoPedido,
    getOrdersSuggested,
    getOrdersSuggestedToProvider,
    getOrdersWithDetailsToDirect,
} = require('../models');

const ServicesPedidos = (() => {

    const getOrdersBodega = async (database = 'SPASUC2011', source = 'BO') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getPedidosEnBodega(conexion, database);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getPedidoSujerido = async (sucursal = 'ZR') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const hostDatabase = `[${getHostBySuc(sucursal)}].${getDatabaseBySuc(sucursal)}`;

        const conexion = getConnectionFrom('BO');
        const response  = await getOrdersSuggested(conexion, sucursal, hostDatabase);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getPedidoSujeridoAProveedor = async (sucursal = 'ZR', date = '20240101') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateFecha(date, 'de movimientos');
        if (!validate.success) return createResponse(400, validate);

        const hostDatabase = `[${getHostBySuc(sucursal)}].${getDatabaseBySuc(sucursal)}`;

        const conexion = getConnectionFrom('BO');
        const response  = await getOrdersSuggestedToProvider(conexion, sucursal, hostDatabase, date);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getPedidosDirectosDeSucursal = async (fecha = '20240101', aplicaStatus = true, estatus = 'PEDIDO ENVIADO') => {
        let validate = validateFecha(fecha, 'Fecha de Pedido');
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom('BO');
        const response  = await getOrdersWithDetailsToDirect(conexion, fecha, false);

        if (!response.success) return createResponse(400, response);

        const pushRow = (tabla, row) => {
            let PeCajaZr, PePzaZr, PeCajaVc, PePzaVc, PeCajaOu, PePzaOu, PeCajaEr, PePzaEr, PeCajaSy, PePzaSy, PeCajaSc, PePzaSc;
            PeCajaZr = PePzaZr = PeCajaVc = PePzaVc = PeCajaOu = PePzaOu = PeCajaEr = PePzaEr = PeCajaSy = PePzaSy = PeCajaSc = PePzaSc = -1;
            
            const cajas = row.PeCaja, piezas = row.PePieza;
            if (row.Sucursal === 'ZARAGOZA') { PeCajaZr = cajas; PePzaZr = piezas; }
            else if (row.Sucursal === 'VICTORIA') { PeCajaVc = cajas; PePzaVc = piezas; }
            else if (row.Sucursal === 'ENRIQUEZ') { PeCajaEr = cajas; PePzaEr = piezas; }
            else if (row.Sucursal === 'OLUTA') { PeCajaOu = cajas; PePzaOu = piezas; }
            else if (row.Sucursal === 'SAYULA') { PeCajaSy = cajas; PePzaSy = piezas; }
            else if (row.Sucursal === 'SOCONUSCO') { PeCajaSc = cajas; PePzaSc = piezas; }
            tabla.push(
                {
                    Articulo: row.Articulo, Nombre: '', Relacion: '', PeCajaZr, PePzaZr, CostoNetoZr: -1, ExistZr: -1, PeCajaVc, PePzaVc,
                    CostoNetoVc: -1, ExistVc: -1, PeCajaOu, PePzaOu, CostoNetoOu: -1, ExistOu: -1, PeCajaEr, PePzaEr, CostoNetoEr: -1,
                    ExistEr: -1, PeCajaSy, PePzaSy, CostoNetoSy: -1, ExistSy: -1, PeCajaSc, PePzaSc, CostoNetoSc: -1, ExistSc: -1,
                }
            )
            return tabla;
        }

        const listArticles = response.data.reduce((list, row, index) => {
            if (index === 0) {
                list.articles.push(row.Articulo);
                pushRow(list.tabla, row);
            } else {
                const articleFinded = list.articles.find((article) => article === row.Articulo);
                if (!articleFinded) list.articles.push(row.Articulo);

                const indexTabla = list.tabla.findIndex((rowArticle) => rowArticle.Articulo === row.Articulo);
                if (indexTabla === -1)
                    pushRow(list.tabla, row);
                else {
                    const cajas = row.PeCaja, piezas = row.PePieza;
                    if (row.Sucursal === 'ZARAGOZA') { list.tabla[indexTabla].PeCajaZr = cajas; list.tabla[indexTabla].PePzaZr = piezas; }
                    else if (row.Sucursal === 'VICTORIA') { list.tabla[indexTabla].PeCajaVc = cajas; list.tabla[indexTabla].PePzaVc = piezas; }
                    else if (row.Sucursal === 'ENRIQUEZ') { list.tabla[indexTabla].PeCajaEr = cajas; list.tabla[indexTabla].PePzaEr = piezas; }
                    else if (row.Sucursal === 'OLUTA') { list.tabla[indexTabla].PeCajaOu = cajas; list.tabla[indexTabla].PePzaOu = piezas; }
                    else if (row.Sucursal === 'SAYULA') { list.tabla[indexTabla].PeCajaSy = cajas; list.tabla[indexTabla].PePzaSy = piezas; }
                    else if (row.Sucursal === 'SOCONUSCO') { list.tabla[indexTabla].PeCajaSc = cajas; list.tabla[indexTabla].PePzaSc = piezas; }
                }
            }
            return list;
        }, { tabla: [], articles: [] })
        response.countComplete = response.data.length;
        response.countReduce = listArticles.articles.length;

        response.data = listArticles.tabla;
        return createResponse(200, response)
    }

    const getOrdersBySucursal = async (database = 'SPASUC2011', source = 'BO', sucursal = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getPedidosBySucursal(conexion, database, sucursal);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticlesByArticle = async (database = 'SPASUC2011', source = 'BO', sucursal = '', folio = '', article = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulosByArticulo(conexion, database, article, folio, sucursal);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticlesByName = async (database = 'SPASUC2011', source = 'BO', sucursal = '', folio = '', name = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulosByNombre(conexion, database, name, folio, sucursal);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticlesByDias = async (database = 'SPASUC2011', source = 'BO', sucursal = '', folio = '', dias = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulosByDias(conexion, database, sucursal, folio, dias);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getArticles = async (database = 'SPASUC2011', source = 'BO', sucursal = '', folio = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getListaArticulos(conexion, database, sucursal, folio);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getReportArticles = async (database = 'SPASUC2011', source = 'BO', sucursal = '', folio = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await getReporteListaArticulos(conexion, database, sucursal, folio);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const createPedido = async (database = 'SPASUC2011', source = 'BO', sucursal = '') => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await addPedido(conexion, database, sucursal);

        if (!response.success) return createResponse(400, response)
        return createResponse(201, response)
    }

    const addArticleToOrder = async (database = 'SPASUC2011', source = 'BO', article = '', bodyArticle = {}) => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);
        
        validate = validateBodyAddArticle(bodyArticle)
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        const response  = await addArticle(conexion, database, article, bodyArticle);

        if (!response.success) return createResponse(400, response)
        return createResponse(201, response)
    }

    const updateStatuOrder = async (
        database = 'SPASUC2011',
        source = 'BO',
        sucursal = '',
        folio = '',
        status = '',
        entrada = '',
        salida = ''
    ) => {
        let validate = validateSucursal(source);
        if (!validate.success) return createResponse(400, validate);

        validate = validateStatusPedido(status);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(source);
        let response = null;
        if (status.trim().toUpperCase() === 'PEDIDO CANCELADO')
            response  = await cancelPedido(conexion, database, sucursal, folio);
        else if (status.trim().toUpperCase() === 'PEDIDO EN PROCESO')
            response  = await enProcesoPedido(conexion, database, sucursal, folio);
        else if (status.trim().toUpperCase() === 'PEDIDO ENVIADO')
            response  = await sendPedido(conexion, database, sucursal, folio);
        else response  = await atendidoPedido(conexion, database, sucursal, folio, entrada, salida);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getOrdersBodega,
        getOrdersBySucursal,
        getArticlesByArticle,
        getArticlesByName,
        getArticlesByDias,
        getArticles,
        getReportArticles,
        createPedido,
        addArticleToOrder,
        updateStatuOrder,
        getPedidoSujerido,
        getPedidoSujeridoAProveedor,
        getPedidosDirectosDeSucursal,
    }
})();

module.exports = ServicesPedidos;
