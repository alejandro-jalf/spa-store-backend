const router = require("express").Router();
const { getOfferValidation } = require("../services");

router.route("/api/v1/ofertas/:sucursal/validas").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/maestros").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/articulos/:uuidmaster").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/maestros").post(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/articulos").post(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/maestros/:uuidmaster/status").put(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/maestros/:uuidmaster").put(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/:articulo").put(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getOfferValidation(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/ofertas/:uuidmaster").delete(async (req, res) => {
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
