const router = require("express").Router();
const { mainRoute, getSalesByDate, getAllSalesByDate } = require("../services");

router.route("/api/v1/cocina").get((req, res) => {
    const { status, ...response } = mainRoute();
    res.status(status).json(response);
});

router.route("/api/v1/cocina/ventas/:sucursal").post(async (req, res) => {
    const { sucursal } = req.params;
    const bodyFechas = req.body;
    const { status, ...response } = await getSalesByDate(sucursal, bodyFechas);
    res.status(status).json(response);
});

router.route("/api/v1/cocina/ventas/:sucursal/detalles").post(async (req, res) => {
    const { sucursal } = req.params;
    const bodyFechas = req.body;
    const { status, ...response } = await getAllSalesByDate(sucursal, bodyFechas);
    res.status(status).json(response);
});

module.exports = router;
