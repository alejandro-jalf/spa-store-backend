const router = require("express").Router();
const {
    getRequestArticles,
    getRequestArticle,
    createRequestArticle,
    updateRequestArticle,
    updateStatusRequest,
    deleteRequest,
} = require('../services')

router.route("/api/v1/solicitud/articulos").get(async (req, res) => {
    const { status, response } = await getRequestArticles();
    res.status(status).json(response);
});

router.route("/api/v1/solicitud/articulos/:uuid").get(async (req, res) => {
    const { uuid } = req.params;
    const { status, response } = await getRequestArticle(uuid);
    res.status(status).json(response);
});

router.route("/api/v1/solicitud/articulos/:sucursal").post(async (req, res) => {
    const { sucursal } = req.params;
    const { CreadoPor } = req.body;
    const { status, response } = await createRequestArticle(sucursal, CreadoPor);
    res.status(status).json(response);
});

router.route("/api/v1/solicitud/articulos/:uuid/update").put(async (req, res) => {
    const { uuid } = req.params;
    const body = req.body;
    const { status, response } = await updateRequestArticle(uuid, body);
    res.status(status).json(response);
});

router.route("/api/v1/solicitud/articulos/:uuid/status/:estatus").put(async (req, res) => {
    const { uuid, estatus } = req.params;
    const { Articulo } = req.body;
    const { status, response } = await updateStatusRequest(uuid, estatus, Articulo);
    res.status(status).json(response);
});

router.route("/api/v1/solicitud/articulos/:uuid/delete").delete(async (req, res) => {
    const { uuid } = req.params;
    const { status, response } = await deleteRequest(uuid);
    res.status(status).json(response);
});

module.exports = router;
