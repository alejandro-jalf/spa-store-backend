const router = require("express").Router();
const {
    getInventoryCloseYear,
    getVentasPorDia,
    getReposicionesCompras,
    getReposicionesGastos,
    getBitacoraCompras,
    getListaCreditoTrabajadores,
    getSalesByDate,
    getMovesTortillas,
    getInformeOperativoMensual,
    getVentasPorArticulos,
    getDataOfDocument,
    getListDocuments,
    getVentasPorHora,
    getArticulosTopEnVentas,
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

router.route("/api/v1/reportes/ventas/:sucursal/estadisticas").get(async (req, res) => {
    const { sucursal } = req.params;
    const fechaIni = req.query.fechaIni;
    const fechaFin = req.query.fechaFin;
    const { status, ...response } = await getSalesByDate(sucursal, fechaIni, fechaFin);
    res.status(200).json(response);
});

router.route("/api/v1/reportes/ventas/:sucursal/porhora").get(async (req, res) => {
    const { sucursal } = req.params;
    const { FechaIni, FechaFin} = req.query;
    const { status, response } = await getVentasPorHora(sucursal, FechaIni, FechaFin);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/ventas/:sucursal/toparticulosventas").get(async (req, res) => {
    const { sucursal } = req.params;
    const { FechaIni, FechaFin } = req.query;
    const { status, response } = await getArticulosTopEnVentas(sucursal, FechaIni, FechaFin);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/ventas/:sucursal/articulos").post(async (req, res) => {
    const { sucursal } = req.params;
    const { articulos } = req.body;
    const { fechaIni, fechaFin } = req.query;
    const { status, response } = await getVentasPorArticulos(sucursal, fechaIni, fechaFin, articulos);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/movimientos/:sucursal/documento/:document").get(async (req, res) => {
    const { sucursal, document } = req.params;
    const database = req.query.database;
    const { status, response } = await getDataOfDocument(sucursal, document, database);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/movimientos/:sucursal/referencia/:referencia").get(async (req, res) => {
    const { sucursal, referencia } = req.params;
    const database = req.query.database;
    const { status, response } = await getDataOfDocument(sucursal, referencia, database, 'referencia');
    res.status(status).json(response);
});

router.route("/api/v1/reportes/movimientos/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { database, typeDoc, likeDoc, likeRef, article, order, dateInit, dateEnd } = req.query;
    const { status, response } = await getListDocuments(sucursal, database, typeDoc, likeDoc, likeRef, article, order, dateInit, dateEnd);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/movimientos/:sucursal/tortillas").get(async (req, res) => {
    const { sucursal } = req.params;
    const fecha = req.query.fecha;
    const { status, response } = await getMovesTortillas(sucursal, fecha);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/movimientos/:sucursal/informeoperativo").get(async (req, res) => {
    const { sucursal } = req.params;
    const { fechaStart, fechaEnd } = req.query;
    const { status, ...response } = await getInformeOperativoMensual(sucursal, fechaStart, fechaEnd);
    res.status(200).json(response);
});

router.route("/api/v1/reportes/reposiciones/compras/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { FechaCorte } = req.query;
    const { status, response } = await getReposicionesCompras(sucursal, FechaCorte);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/reposiciones/gastos/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { FechaCorte } = req.query;
    const { status, response } = await getReposicionesGastos(sucursal, FechaCorte);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/bitacora/compras/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { FechaCorte } = req.query;
    const { status, response } = await getBitacoraCompras(sucursal, FechaCorte);
    res.status(status).json(response);
});

router.route("/api/v1/reportes/trabajadores/creditos/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { FechaCorte } = req.query;
    const { status, response } = await getListaCreditoTrabajadores(sucursal, FechaCorte);
    res.status(status).json(response);
});

module.exports = router;
