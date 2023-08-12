const router = require("express").Router();
const { 
    login,
    createUser,
    updateUSer,
    deleteUser,
    getAllUsers,
    updateEmail,
    updateStatus,
    recoveryCount,
    getUserByEmail,
    updatePassword,
    updateDataGeneral,
    updateMain,
    getVersionById,
} = require("../services");

router.route('/api/v1').get(async (req, res) => {
    res.status(200).json({
        success: true,
        message: 'Bienvenidos a la ruta principal de userSPA'
    });
});

router.route('/api/v1/usuarios').get(async (req, res) => {
    const { status, response } = await getAllUsers();
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user').get(async (req, res) => {
    const { correo_user } = req.params;
    const { status, response } = await getUserByEmail(correo_user);
    res.status(status).json(response);
});

router.route('/api/v1/versiones/:idVersion').get(async (req, res) => {
    const { idVersion } = req.params;
    const { status, response } = await getVersionById(idVersion);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios').post(async (req, res) => {
    const bodyUser = req.body;
    const { status, response } = await createUser(bodyUser);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user/login').post(async (req, res) => {
    const { correo_user } = req.params;
    const bodyLogin = req.body;
    const { status, response } = await login(correo_user, bodyLogin);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user').put(async (req, res) => {
    const { correo_user } = req.params;
    const bodyUser = req.body;
    const { status, response } = await updateUSer(correo_user, bodyUser);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user/general').put(async (req, res) => {
    const { correo_user } = req.params;
    const bodyUser = req.body;
    const { status, response } = await updateDataGeneral(correo_user, bodyUser);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user/email').put(async (req, res) => {
    const { correo_user } = req.params;
    const bodyEmail = req.body;
    const { status, response } = await updateEmail(correo_user, bodyEmail);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user/password').put(async (req, res) => {
    const { correo_user } = req.params;
    const bodyPassword = req.body;
    const { status, response } = await updatePassword(correo_user, bodyPassword);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user/recovery').put(async (req, res) => {
    const { correo_user } = req.params;
    const { status, response } = await recoveryCount(correo_user);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user/status').put(async (req, res) => {
    const { correo_user } = req.params;
    const bodyStatus = req.body;
    const { status, response } = await updateStatus(correo_user, bodyStatus);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user/main').put(async (req, res) => {
    const { correo_user } = req.params;
    const bodyStatus = req.body;
    const { status, response } = await updateMain(correo_user, bodyStatus);
    res.status(status).json(response);
});

router.route('/api/v1/usuarios/:correo_user').delete(async (req, res) => {
    const { correo_user } = req.params;
    const { status, response } = await deleteUser(correo_user);
    res.status(status).json(response);
});

module.exports = router;
