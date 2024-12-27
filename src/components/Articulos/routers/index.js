const router = require("express").Router();
const {
    getPriceArticle,
    getDataForStocks,
    getExistenciasByNombre,
    getDetallesExistenciasBySku,
    getExistenciasByProveedor,
    getDetallesArticulosByCodificador,
    getArticlesWithLowUtilities,
    updateStocksBySucursal,
    getExistenciasBySucursal,
    getArticulosVigentes,
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
    const { sucursal, company, daymin, daymax } = req.query;
    const { status, response } = await updateStocksBySucursal(sucursal, company, daymin, daymax);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/:nombre/existencias/:tiendas").get(async (req, res) => {
    const { nombre, tiendas } = req.params;
    const { status, response } = await getExistenciasByNombre(nombre, tiendas);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/:sku/existencias/detalles/:tiendas").get(async (req, res) => {
    const { sku, tiendas } = req.params;
    const { status, response } = await getDetallesExistenciasBySku(sku, tiendas);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/existencias/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { status, response } = await getExistenciasBySucursal(sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/existencias/:sucursal/proveedor/:proveedor").get(async (req, res) => {
    const { sucursal, proveedor } = req.params;
    const { status, response } = await getExistenciasByProveedor(proveedor, sucursal);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/:barcode/codificador").get(async (req, res) => {
    const { barcode } = req.params;
    const { sucursal } = req.query;
    const { status, response } = await getDetallesArticulosByCodificador(sucursal, barcode);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/vigentes/:sucursal").get(async (req, res) => {
    const { sucursal } = req.params;
    const { FechaDesde } = req.query;
    const { status, response } = await getArticulosVigentes(sucursal, FechaDesde);
    res.status(status).json(response);
});

module.exports = router;
