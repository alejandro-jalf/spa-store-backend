const router = require("express").Router();
const { mainRoute } = require("../services");

router.route("/api/v1/cocina").get((req, res) => {
    const { status, ...response } = mainRoute();
    res.status(status).json(response);
});

module.exports = router;
