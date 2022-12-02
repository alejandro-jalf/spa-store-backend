const router = require("express").Router();

router.use(require("./components/cocina/routers"));
router.use(require("./components/consolidaciones/routers"));
router.use(require("./components/Articulos/routers"));
router.use(require("./components/Ofertas/routers"));
router.use(require("./components/trabajadores/routers"));
router.use(require("./components/Reportes/routers"));
router.use(require("./components/General/routers"));
router.use(require("./components/Pedidos/routers"));
router.use(require("./components/Proveedores/routers"));
router.use(require("./components/Mayoristas/routers"));
router.use(require("./components/Usuarios/routers"));

module.exports = router;
