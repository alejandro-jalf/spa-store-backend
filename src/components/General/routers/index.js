const router = require("express").Router();
const {
    getStatusConections,
    getCalculateFolios,
    updateFoliosAvailable,
    generateBackup,
    zipBackup,
    uploadBackup,
    getInformationOfDataBases,
    reduceLogOf,
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

router.route("/api/v1/general/databases/:sucursal/information").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getInformationOfDataBases(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/general/folios/:sucursal/:serie").put(async (req, res) => {
    const { sucursal, serie } = req.params;
    const { newFolio } = req.query;
    const { status, response } = await updateFoliosAvailable(sucursal, serie, newFolio);
    res.status(status).json(response);
});

router.route("/api/v1/general/logs/:sucursal/reduce").put(async (req, res) => {
    const { sucursal } = req.params;
    const { dataBase, nameLog } = req.body;
    const { status, response } = await reduceLogOf(sucursal, dataBase, nameLog);
    res.status(status).json(response);
});

router.route("/api/v1/general/backup/:sucursal").post(async (req, res) => {
    const { sucursal } = req.params;
    const { source, name, dataBase } = req.body;
    const { status, response } = await generateBackup(sucursal, source, name, dataBase);
    res.status(status).json(response);
});

router.route("/api/v1/general/backup/:sucursal/zip").post(async (req, res) => {
    const { sucursal } = req.params;
    const { source } = req.body;
    const { status, response } = await zipBackup(sucursal, source);
    res.status(status).json(response);
});

router.route("/api/v1/general/backup/:sucursal/upload").post(async (req, res) => {
    const { sucursal } = req.params;
    const { source, nameFile } = req.body;
    const { status, response } = await uploadBackup(source, nameFile, sucursal);
    res.status(status).json(response);
});

module.exports = router;
