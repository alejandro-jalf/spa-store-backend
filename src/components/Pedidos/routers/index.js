const router = require("express").Router();

const response = {
    success: true,
    message: 'No habilitado por el momento',
    data: []
}

router.route("/api/v1/pedidos/maestros").get(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio/articulo/:articulo").get(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio/nombre/:nombre").get(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio/dias/:dias").get(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio").get(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/detalles/:sucursal/:folio/reporte").get(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/maestros/:sucursal").get(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/maestros/:sucursal").post(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/detalles/:articulo").post(async (req, res) => {
    res.status(200).json(response);
});

router.route("/api/v1/pedidos/maestros/:sucursal/:folio/:estatus").put(async (req, res) => {
    res.status(200).json(response);
});

module.exports = router;
