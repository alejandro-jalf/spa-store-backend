const router = require("express").Router();
const { getPriceArticle } = require("../services");

router.route("/api/v1/articulos/:articulo/precio").get(async (req, res) => {
    const { articulo } = req.params;
    const { sucursal } = req.query;
    const { status, response } = await getPriceArticle(sucursal, articulo);
    res.status(status).json(response);
});

module.exports = router;
