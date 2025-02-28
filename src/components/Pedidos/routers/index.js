const router = require("express").Router();
const {
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
} = require('../services')

const response = {
    success: true,
    message: 'No habilitado por el momento',
    data: []
}

router.route("/api/v1/pedidos/maestros").get(async (req, res) => {
    const { database, source } = req.query;
    const { status, response } = await getOrdersBodega(database, source);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/directos").get(async (req, res) => {
    const { fecha, estatus, aplica } = req.query;
    const { status, response } = await getPedidosDirectosDeSucursal(fecha, aplica, estatus);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/:sucursal/sujerido").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getPedidoSujerido(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/:sucursal/sugerido/proveedor").get(async (req, res) => {
    const { sucursal } = req.params;
    const { date } = req.query;
    const { status, response } = await getPedidoSujeridoAProveedor(sucursal, date);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio/articulos/:articulo").get(async (req, res) => {
    const { database, source } = req.query;
    const { sucursal, folio, articulo } = req.params;
    const { status, response } = await getArticlesByArticle(database, source, sucursal, folio, articulo);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio/nombres/:nombre").get(async (req, res) => {
    const { database, source } = req.query;
    const { sucursal, folio, nombre } = req.params;
    const { status, response } = await getArticlesByName(database, source, sucursal, folio, nombre);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio/dias/:dias").get(async (req, res) => {
    const { database, source } = req.query;
    const { sucursal, folio, dias } = req.params;
    const { status, response } = await getArticlesByDias(database, source, sucursal, folio, dias);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio").get(async (req, res) => {
    const { database, source } = req.query;
    const { sucursal, folio } = req.params;
    const { status, response } = await getArticles(database, source, sucursal, folio);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio/reporte").get(async (req, res) => {
    const { database, source } = req.query;
    const { sucursal, folio } = req.params;
    const { status, response } = await getReportArticles(database, source, sucursal, folio);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/maestros/:sucursal").get(async (req, res) => {
    const { database, source } = req.query;
    const { sucursal } = req.params;
    const { status, response } = await getOrdersBySucursal(database, source, sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/maestros/:sucursal").post(async (req, res) => {
    const { database, source } = req.query;
    const { sucursal } = req.params;
    const { status, response } = await createPedido(database, source, sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/detalles/:articulo").post(async (req, res) => {
    const { database, source } = req.query;
    const { articulo } = req.params;
    const bodyArticle = req.body;
    const { status, response } = await addArticleToOrder(database, source, articulo, bodyArticle);
    res.status(status).json(response);
});

router.route("/api/v1/pedidos/maestros/:sucursal/:folio/:estatus").put(async (req, res) => {
    const { database, source, entrada, salida } = req.query;
    const { sucursal, folio, estatus } = req.params;
    const { status, response } = await updateStatuOrder(database, source, sucursal, folio, estatus, entrada, salida);
    res.status(status).json(response);
});

module.exports = router;
