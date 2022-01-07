const router = require("express").Router();
const { 
    getOfferValidation,
    getMasterOffersBySuc,
    getArticlesByUUIDMaster,
    addMasterOffer,
    changeStatusMasterOffer,
} = require("../services");

router.route("/api/v1/ofertas/:sucursal/validas").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/:sucursal/maestros").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getMasterOffersBySuc(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/articulos/:uuidmaster").get(async (req, res) => {
    const { uuidmaster } = req.params;
    const { status, response } = await getArticlesByUUIDMaster(uuidmaster);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/maestros").post(async (req, res) => {
    const bodyMaster = req.body;
    const { status, response } = await addMasterOffer(bodyMaster);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/articulos").post(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await add(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/:sucursal/maestros/:uuidmaster/status").put(async (req, res) => {
    const { sucursal, uuidmaster } = req.params;
    const bodyMaster = req.body;
    const { status, response } = await changeStatusMasterOffer(sucursal, uuidmaster, bodyMaster);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/:sucursal/maestros/:uuidmaster").put(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/:articulo").put(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/:sucursal/:uuidmaster").delete(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/:articulo").delete(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

module.exports = router;
