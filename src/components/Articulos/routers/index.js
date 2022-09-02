const router = require("express").Router();
const {
    getPriceArticle,
    getDataForStocks,
    getExistenciasByNombre,
    getDetallesExistenciasBySku,
    getDetallesArticulosByCodificador,
    getArticlesWithLowUtilities,
    updateStocksBySucursal,
} = require("../services");

router.route("/api/v1/articulos/:articulo/precio").get(async (req, res) => {
    const { articulo } = req.params;
    const { sucursal } = req.query;
    const { status, response } = await getPriceArticle(sucursal, articulo);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/utilidades/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { porcentajeUtilidad } = req.query;
    const { status, response } = await getArticlesWithLowUtilities(sucursal, porcentajeUtilidad);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/stocks").get(async (req, res) => {
    const { sucursal, company, daymin, daymax } = req.query;
    const { status, response } = await getDataForStocks(sucursal, company, daymin, daymax);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/stocks").put(async (req, res) => {
    const { sucursal, company } = req.query;
    const { updates } = req.body;
    const { status, response } = await updateStocksBySucursal(sucursal, company, updates);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/:nombre/existencias").get(async (req, res) => {
    const { nombre } = req.params;
    const { status, response } = await getExistenciasByNombre(nombre);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/:sku/existencias/detalles").get(async (req, res) => {
    const { sku } = req.params;
    const { status, response } = await getDetallesExistenciasBySku(sku);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/:barcode/codificador").get(async (req, res) => {
    const { barcode } = req.params;
    const { sucursal } = req.query;
    const { status, response } = await getDetallesArticulosByCodificador(sucursal, barcode);
    res.status(status).json(response);
});

module.exports = router;
