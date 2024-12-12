const router = require("express").Router();
const {
    getDepartamentos,
    getDepartamentoByCodigo,
    getSucursales,
    getSucursalByCodigo,
    getTiposEquipos,
    getTipoEquipoByCodigo,
    getFichasTecnicas,
    getFichaTecnicaByCodigo,
    addDepartamento,
    addSucursal,
    addTipoEquipo,
    addFichaTecnica,
    getConsecutivoFicha,
    deleteTokens,
    deleteTypeEquipment,
    deleteBranchs,
    deleteDepartment,
    updateDepartment,
    updateBranch,
    updateTypeEquipment,
    updateTokens,
} = require('../services')

router.route("/api/v1/inventarioscea/departamentos").get(async (req, res) => {
    const { status, response } = await getDepartamentos();
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/departamentos/:codigo").get(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await getDepartamentoByCodigo(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales").get(async (req, res) => {
    const { status, response } = await getSucursales();
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales/:codigo").get(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await getSucursalByCodigo(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos").get(async (req, res) => {
    const { status, response } = await getTiposEquipos();
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos/:codigo").get(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await getTipoEquipoByCodigo(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas").get(async (req, res) => {
    const { status, response } = await getFichasTecnicas();
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas/:folio").get(async (req, res) => {
    const { folio } = req.params;
    const { status, response } = await getFichaTecnicaByCodigo(folio);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas/:TipoEquipo/last").get(async (req, res) => {
    const { TipoEquipo } = req.params;
    const { status, response } = await getConsecutivoFicha(TipoEquipo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales").post(async (req, res) => {
    const bodyCreateSucursal = req.body;
    const { status, response } = await addSucursal(bodyCreateSucursal);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/departamentos").post(async (req, res) => {
    const bodyCreateDepartamento = req.body;
    const { status, response } = await addDepartamento(bodyCreateDepartamento);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos").post(async (req, res) => {
    const bodyCreateTipoEquipo = req.body;
    const { status, response } = await addTipoEquipo(bodyCreateTipoEquipo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas").post(async (req, res) => {
    const bodyCreateFichaTecnica = req.body;
    const { status, response } = await addFichaTecnica(bodyCreateFichaTecnica);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/departamentos/:codigo").put(async (req, res) => {
    const { codigo } = req.params;
    const body = req.body;
    const { status, response } = await updateDepartment(codigo, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales/:codigo").put(async (req, res) => {
    const { codigo } = req.params;
    const body = req.body;
    const { status, response } = await updateBranch(codigo, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos/:codigo").put(async (req, res) => {
    const { codigo } = req.params;
    const body = req.body;
    const { status, response } = await updateTypeEquipment(codigo, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas/:folio").put(async (req, res) => {
    const { folio } = req.params;
    const body = req.body;
    const { status, response } = await updateTokens(folio, body);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/departamentos/:codigo").delete(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await deleteDepartment(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/sucursales/:codigo").delete(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await deleteBranchs(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/tipos/:codigo").delete(async (req, res) => {
    const { codigo } = req.params;
    const { status, response } = await deleteTypeEquipment(codigo);
    res.status(status).json(response);
});

router.route("/api/v1/inventarioscea/fichas/:folio").delete(async (req, res) => {
    const { folio } = req.params;
    const { status, response } = await deleteTokens(folio);
    res.status(status).json(response);
});

module.exports = router;
