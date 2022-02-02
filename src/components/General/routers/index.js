const router = require("express").Router();
const { getStatusConections } = require("../services");

router.route("/api/v1/general/:empresa/conexiones/activas").get(async (req, res) => {
    const { empresa } = req.params;
    const { status, response } = await getStatusConections(empresa);
    res.status(status).json(response);
});

module.exports = router;
