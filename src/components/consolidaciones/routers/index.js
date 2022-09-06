const router = require("express").Router();
const {
    getConsolidacionesForDate,
    getArticlesOfConsolidacion,
} = require("../services");

router.route("/api/v1/consolidaciones/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const fechaIni = req.query.fechaIni;
    const fechaFin = req.query.fechaFin;
    const { status, ...response } = await getConsolidacionesForDate(sucursal, fechaIni, fechaFin);
    res.status(200).json(response);
});

router.route("/api/v1/consolidaciones/:sucursal/articulos/:documento").get(async (req, res) => {
    const { dateDocument } = req.query;
    const { sucursal, documento } = req.params;
    const { status, response } = await getArticlesOfConsolidacion(sucursal, documento, dateDocument);
    res.status(status).json(response);
});

module.exports = router;
