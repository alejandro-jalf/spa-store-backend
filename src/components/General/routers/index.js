const router = require("express").Router();
const {
    getStatusConections,
    getCalculateFolios,
    updateFoliosAvailable,
} = require("../services");

router.route("/api/v1/general/:empresa/conexiones/activas").get(async (req, res) => {
    const { empresa } = req.params;
    const { status, response } = await getStatusConections(empresa);
    res.status(status).json(response);
});

router.route("/api/v1/general/folios/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { promMensual } = req.query;
    const { status, response } = await getCalculateFolios(sucursal, promMensual);
    res.status(status).json(response);
});

router.route("/api/v1/general/folios/:sucursal").put(async (req, res) => {
    const { sucursal } = req.params;
    const { newFolio } = req.query;
    const { status, response } = await updateFoliosAvailable(sucursal, newFolio);
    res.status(status).json(response);
});

module.exports = router;
