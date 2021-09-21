const router = require("express").Router();
const { getConsolidacionesForDate } = require("../services");

router.route("/api/v1/consolidaciones/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const fechaIni = req.query.fechaIni;
    const fechaFin = req.query.fechaFin;
    const { status, ...response } = await getConsolidacionesForDate(sucursal, fechaIni, fechaFin);
    res.status(200).json(response);
});

module.exports = router;
