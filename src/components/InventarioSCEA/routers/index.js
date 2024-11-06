const router = require("express").Router();
const { any } = require('../services')

router.route("/api/v1/inventarioscea/departamentos").get(async (req, res) => {
    const { status, response } = await getRequestArticles(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/departamentos/:codigo").get(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await getRequestArticle(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales").get(async (req, res) => {
    const { status, response } = await getRequestArticles(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales/:codigo").get(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await getRequestArticle(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos").get(async (req, res) => {
    const { status, response } = await getRequestArticles(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos/:codigo").get(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await getRequestArticle(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas").get(async (req, res) => {
    const { status, response } = await getRequestArticles(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas/:folio").get(async (req, res) => {
    const { folio } = req.params;
    const { status, response } = await getRequestArticle(folio);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/departamentos").post(async (req, res) => {
    const body = req.body;
    const { status, response } = await createRequestArticle(sucursal, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales").post(async (req, res) => {
    const body = req.body;
    const { status, response } = await createRequestArticle(sucursal, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos").post(async (req, res) => {
    const body = req.body;
    const { status, response } = await createRequestArticle(sucursal, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas").post(async (req, res) => {
    const body = req.body;
    const { status, response } = await createRequestArticle(sucursal, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/departamentos/:codigo").put(async (req, res) => {
    const { codigo } = req.params;
    const body = req.body;
    const { status, response } = await updateRequestArticle(codigo, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales/:codigo").put(async (req, res) => {
    const { codigo } = req.params;
    const body = req.body;
    const { status, response } = await updateRequestArticle(codigo, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos/:codigo").put(async (req, res) => {
    const { codigo } = req.params;
    const body = req.body;
    const { status, response } = await updateRequestArticle(codigo, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas/:folio").put(async (req, res) => {
    const { folio } = req.params;
    const body = req.body;
    const { status, response } = await updateRequestArticle(folio, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/departamentos/:codigo").delete(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await deleteRequest(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales/:codigo").delete(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await deleteRequest(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos/:codigo").delete(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await deleteRequest(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas/:folio").delete(async (req, res) => {
    const { folio } = req.params;
    const { status, response } = await deleteRequest(folio);
    res.status(status).json(response);
});

module.exports = router;
