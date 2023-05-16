const router = require("express").Router();
const {
    getConsolidacionesForDate,
    getArticlesOfConsolidacion,
    getConsolidacionByCreateAt,
    getListCostTransfers,
    updateCostsTranfers,
} = require("../services");

router.route("/api/v1/consolidaciones/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const fechaIni = req.query.fechaIni;
    const fechaFin = req.query.fechaFin;
    const { status, ...response } = await getConsolidacionesForDate(sucursal, fechaIni, fechaFin);
    res.status(200).json(response);
});

router.route("/api/v1/consolidaciones/articulos/:fechaIni/:fechaFin").get(async (req, res) => {
    const { fechaIni, fechaFin } = req.params;
    const { status, ...response } = await getConsolidacionByCreateAt(fechaIni, fechaFin);
    res.status(200).json(response);
});

router.route("/api/v1/consolidaciones/:sucursal/articulos/:documento").get(async (req, res) => {
    const { dateDocument } = req.query;
    const { sucursal, documento } = req.params;
    const { status, response } = await getArticlesOfConsolidacion(sucursal, documento, dateDocument);
    res.status(status).json(response);
});

router.route("/api/v1/consolidaciones/:sucursal/costos/:fecha").get(async (req, res) => {
    const { sucursal, fecha } = req.params;
    const { status, response } = await getListCostTransfers(sucursal, fecha);
    res.status(status).json(response);
});

router.route("/api/v1/consolidaciones/:sucursal/costos").put(async (req, res) => {
    const { sucursal } = req.params;
    const { listCostos } = req.body;
    const { status, response } = await updateCostsTranfers(sucursal, listCostos);
    res.status(status).json(response);
});

module.exports = router;
