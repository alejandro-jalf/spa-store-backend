const router = require("express").Router();
const { getPriceArticle, getDataForStocks } = require("../services");

router.route("/api/v1/articulos/:articulo/precio").get(async (req, res) => {
    const { articulo } = req.params;
    const { sucursal } = req.query;
    const { status, response } = await getPriceArticle(sucursal, articulo);
    res.status(status).json(response);
});

router.route("/api/v1/articulos/stocks").get(async (req, res) => {
    const { sucursal, company, daymin, daymax } = req.query;
    const { status, response } = await getDataForStocks(sucursal, company, daymin, daymax);
    res.status(status).json(response);
});

module.exports = router;
