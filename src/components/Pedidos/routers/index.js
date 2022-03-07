const router = require("express").Router();
const {
    getOrdersBodega,
    getOrdersBySucursal,
    getArticlesByArticle,
    getArticlesByName,
    getArticlesByDias,
    getArticles,
    getReportArticles,
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
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/detalles/:articulo").post(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/maestros/:sucursal/:folio/:estatus").put(async (req, res) => {
    res.status(200).json(response);
});

module.exports = router;
