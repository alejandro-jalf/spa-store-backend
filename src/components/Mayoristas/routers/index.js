const router = require("express").Router();
const {
    getDocumentCompra,
    getDocumentOrden,
} = require("../services");

router.route("/api/v1/mayoristas/:sucursal/compra/:documento").get(async (req, res) => {
    const { sucursal, documento } = req.params;
    const { status, response } = await getDocumentCompra(sucursal, documento);
    res.status(status).json(response);
});

router.route("/api/v1/mayoristas/:sucursal/orden/:consecutivo").get(async (req, res) => {
    const { sucursal, consecutivo } = req.params;
    const { status, response } = await getDocumentOrden(sucursal, consecutivo);
    res.status(status).json(response);
});

module.exports = router;
