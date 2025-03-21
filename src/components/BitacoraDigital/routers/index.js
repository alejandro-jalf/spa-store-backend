const router = require("express").Router();
const {
    getUltimosFoliosPorSucursal,
    getFoliosPorFechaYSucursal,
    getFoliosEspecifico,
    getFoliosPorId,
    generateFolio,
    getProveedores,
    updateFolioBitacora,
    updateEstatusFolio,
    addFolio,
    createFolioVacio,
} = require("../services");

router.route("/api/v1/bitacoradigital/compras/last/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { limit } = req.query;
    const { status, response } = await getUltimosFoliosPorSucursal(sucursal, limit);
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/compras/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { fecha } = req.query;
    const { status, response } = await getFoliosPorFechaYSucursal(sucursal, fecha);
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/compras/consulta/folio/:folio").get(async (req, res) => {
    const { folio } = req.params;
    const { status, response } = await getFoliosEspecifico(folio);
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/compras/consulta/id/:id").get(async (req, res) => {
    const { id } = req.params;
    const { status, response } = await getFoliosPorId(id);
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/compras/generate/:sucursal/:fecha").get(async (req, res) => {
    const { sucursal, fecha } = req.params;
    const { status, response } = await generateFolio(sucursal, fecha);
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/proveedores").get(async (req, res) => {
    const { status, response } = await getProveedores();
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/compras/:uuid").put(async (req, res) => {
    const { uuid } = req.params;
    const body = req.body;
    const { status, response } = await updateFolioBitacora(uuid, body);
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/compras/:uuid/estatus/:estatus").put(async (req, res) => {
    const { uuid, estatus } = req.params;
    const { status, response } = await updateEstatusFolio(uuid, estatus);
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/compras").post(async (req, res) => {
    const body = req.body;
    const { status, response } = await addFolio(body);
    res.status(status).json(response);
});

router.route("/api/v1/bitacoradigital/compras/empty").post(async (req, res) => {
    const { sucursal, fecha } = req.body;
    const { status, response } = await createFolioVacio(sucursal, fecha);
    res.status(status).json(response);
});

module.exports = router;
