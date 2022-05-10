const router = require("express").Router();
const {
    getInventoryCloseYear,
    getVentasPorDia,
} = require("../services");

router.route("/api/v1/reportes/inventario/cierre/:sucursal/:tienda/:almacen").get(async (req, res) => {
    const { sucursal, tienda, almacen } = req.params;
    const { status, response } = await getInventoryCloseYear(sucursal, tienda, almacen);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/ventas/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { FechaIni, FechaFin } = req.query;
    const { status, response } = await getVentasPorDia(sucursal, FechaIni, FechaFin);
    res.status(status).json(response);
});

module.exports = router;
