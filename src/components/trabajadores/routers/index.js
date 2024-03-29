const router = require("express").Router();
const {
    getAllAssists,
    getAllTrabajadores,
    getClaveTrabajador,
    registerAsistenciaTrabajador,
    addClaveTrabajador,
    updateClaveTrabajador,
    updateIdTrabajadorForClave,
    getAllClaves,
    updatePrivilegiosTrabajador,
} = require("../services");

router.route("/api/v1/trabajadores/asistencias/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { fechaini, fechafin, empresa } = req.query;
    const { status, response } = await getAllAssists(sucursal, fechaini, fechafin, empresa);
    res.status(status).json(response);
});

router.route("/api/v1/trabajadores/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getAllTrabajadores(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/trabajadores/claves/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getAllClaves(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/trabajadores/claves/:sucursal/:cajero").get(async (req, res) => {
    const { sucursal, cajero } = req.params;
    const { status, response } = await getClaveTrabajador(sucursal, cajero);
    res.status(status).json(response);
});

router.route("/api/v1/trabajadores/asistencias/:sucursal/:cajero/:estatus").post(async (req, res) => {
    const { sucursal, cajero, estatus } = req.params;
    const { Clave } = req.body;
    const { status, response } = await registerAsistenciaTrabajador(sucursal, cajero, Clave, estatus);
    res.status(status).json(response);
});

router.route("/api/v1/trabajadores/claves/:sucursal").post(async (req, res) => {
    const { sucursal } = req.params;
    const { Clave, Cajero, IdTrabajador, Privilegios } = req.body;
    const { status, response } = await addClaveTrabajador(sucursal, Clave, Cajero, IdTrabajador, Privilegios);
    res.status(status).json(response);
});

router.route("/api/v1/trabajadores/claves/:sucursal/:cajero").put(async (req, res) => {
    const { sucursal, cajero } = req.params;
    const { Clave } = req.body;
    const { status, response } = await updateClaveTrabajador(sucursal, Clave, cajero);
    res.status(status).json(response);
});

router.route("/api/v1/trabajadores/claves/:sucursal/:cajero/IdTrabajador").put(async (req, res) => {
    const { sucursal, cajero } = req.params;
    const { IdTrabajador } = req.body;
    const { status, response } = await updateIdTrabajadorForClave(sucursal, IdTrabajador, cajero);
    res.status(status).json(response);
});

router.route("/api/v1/trabajadores/claves/:sucursal/:cajero/privilegios").put(async (req, res) => {
    const { sucursal, cajero } = req.params;
    const { Privilegios } = req.body;
    const { status, response } = await updatePrivilegiosTrabajador(sucursal, cajero, Privilegios);
    res.status(status).json(response);
});

module.exports = router;
