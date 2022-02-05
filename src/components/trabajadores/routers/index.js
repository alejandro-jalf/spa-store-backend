const router = require("express").Router();
const { getAllAssists } = require("../services");

router.route("/api/v1/trabajadores/asistencias/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { fechaini, fechafin, empresa } = req.query;
    const { status, response } = await getAllAssists(sucursal, fechaini, fechafin, empresa);
    res.status(status).json(response);
});

module.exports = router;
