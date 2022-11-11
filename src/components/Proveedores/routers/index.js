const router = require("express").Router();
const {
    getProveedores,
} = require("../services");

router.route("/api/v1/proveedores/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getProveedores(sucursal);
    res.status(status).json(response);
});

module.exports = router;
