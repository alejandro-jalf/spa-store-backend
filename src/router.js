const router = require("express").Router();

router.use(require("./components/cocina/routers"));
router.use(require("./components/consolidaciones/routers"));
router.use(require("./components/Articulos/routers"));

module.exports = router;
