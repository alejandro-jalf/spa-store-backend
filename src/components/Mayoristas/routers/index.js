const router = require("express").Router();
const {
    getDocumentCompra,
    getDocumentOrden,
    updateCostoOrden,
    updateCostoOrdenMassive,
    getRequestsStores,
} = require("../services");

router.route("/api/v1/mayoristas/:sucursal/compra/:documento").get(async (req, res) => {
    const { sucursal, documento } = req.params;
    const { status, response } = await getDocumentCompra(sucursal, documento);
    res.status(status).json(response);
});

router.route("/api/v1/mayoristas/:sucursal/orden/:consecutivo").get(async (req, res) => {
    const { sucursal, consecutivo } = req.params;
    const { status, response } = await getDocumentOrden(sucursal, consecutivo);
    res.status(status).json(response);
});

router.route("/api/v1/mayoristas/solicitudes").get(async (req, res) => {
    const { dateAt, dateTo } = req.query;
    const { status, response } = await getRequestsStores(dateAt, dateTo);
    res.status(status).json(response);
});

router.route("/api/v1/mayoristas/:sucursal/orden/:consecutivo").put(async (req, res) => {
    const { sucursal, consecutivo } = req.params;
    const body = req.body;
    const { status, response } = await updateCostoOrden(sucursal, consecutivo, body);
    res.status(status).json(response);
});

router.route("/api/v1/mayoristas/:sucursal/orden/:consecutivo/masivo").put(async (req, res) => {
    const { sucursal, consecutivo } = req.params;
    const body = req.body;
    const { status, response } = await updateCostoOrdenMassive(sucursal, consecutivo, body);
    res.status(status).json(response);
});

module.exports = router;
