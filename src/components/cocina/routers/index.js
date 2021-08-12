const router = require("express").Router();
const { mainRoute, getSalesByDate, getAllSalesByDate } = require("../services");

router.route("/api/v1/cocina").get((req, res) => {
    const { status, ...response } = mainRoute();
    res.status(status).json(response);
});

router.route("/api/v1/cocina/ventas/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const fechaIni = req.query.fechaIni;
    const fechaFin = req.query.fechaFin;
    const { status, ...response } = await getSalesByDate(sucursal, fechaIni, fechaFin);
    res.status(200).json(response);
});

router.route("/api/v1/cocina/ventas/:sucursal/detalles").get(async (req, res) => {
    const { sucursal } = req.params;
    const fechaIni = req.query.fechaIni;
    const fechaFin = req.query.fechaFin;
    const { status, ...response } = await getAllSalesByDate(sucursal, fechaIni, fechaFin);
    res.status(status).json(response);
});

module.exports = router;
