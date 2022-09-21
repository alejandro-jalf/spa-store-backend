const router = require("express").Router();
const {
    getProveedores,
} = require("../services");

router.route("/api/v1/proveedores").get(async (req, res) => {
    const { status, response } = await getProveedores();
    res.status(status).json(response);
});

module.exports = router;
