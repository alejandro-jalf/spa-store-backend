const router = require("express").Router();
const { getInventoryCloseYear } = require("../services");

router.route("/api/v1/reportes/inventario/cierre/:sucursal/:tienda/:almacen").get(async (req, res) => {
    const { sucursal, tienda, almacen } = req.params;
    const { status, response } = await getInventoryCloseYear(sucursal, tienda, almacen);
    res.status(status).json(response);
});

module.exports = router;
