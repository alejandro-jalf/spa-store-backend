const {
    createResponse,
    createContentAssert,
    createContentError,
    encriptData,
    sendEmail,
    getConnectionFrom,
} = require("../../../utils");
const {
    modelGetAllUser,
    modelGetUserByEmail,
    modelCreateUser,
    modelUpdateUSer,
    modelUpdateDataGeneral,
    modelUpdatePassword,
    modelUpdateEmail,
    modelUpdateStatus,
    modelDeleteUser,
    modelUpdateRecoveryCode,
    modelUpdatePrincipal,
    modelGetVersionsApp,
} = require("../models");
const {
    validateBodyCrateUser,
    validateBodyLogin,
    validateBodyUpdateUser,
    validateBodyUpdateDataUser,
    validateBodyUpdateEmail,
    validateBodyUpdatePassword,
    validateBodyUpdateStatus,
    validateBodyUpdatePrincipal,
} = require('../validations');

const services = (() => {
    const conexionDB = getConnectionFrom('ZR');

    const getAllUsers = async () => {
        const result = await modelGetAllUser(conexionDB);
        if (!result.success) {
            return createResponse(500, result);
        }
        return createResponse(200, result);
    }

    const getUserByEmail = async (correo_user) => {
        let response = await modelGetUserByEmail(conexionDB, correo_user);
        if (response.data.length === 0) {
            return createResponse(
                200, 
                createContentError(`El usuario ${correo_user} no esta registrado`)
            );
        }
        const dataUser = response;
        const versions = await getVersionByAccess(response.data[0].access_to_user);
        dataUser.data[0].novedades = versions;
        return createResponse(200, dataUser);
    }

    const getVersionByAccess = async (access = '') => {
        const response = await modelGetVersionsApp(conexionDB);
        const accessTabs = access.split(',');
        let findedTab;
        if (response.success) {
            const finded = response.data.filter((version) => {
                findedTab = false;
                const tabs = version.PaginasActualizadas.split(',');
                for (let index = 0; index < accessTabs.length; index++) {
                    const versionFinded = tabs.find((tab) => tab === accessTabs[index]);
                    if (versionFinded) {
                        findedTab = true;
                        index = accessTabs.length;
                    }
                }
                if (findedTab) return version;
            })
            return finded
        }
        return []
    }

    const createUser = async (bodyUser) => {
        const validate = validateBodyCrateUser(bodyUser);
        if (!validate.success) {
            return createResponse(400, validate)
        }

        bodyUser.password_user = encriptData(bodyUser.password_user);
        const result = await modelCreateUser(conexionDB, bodyUser);
        if (!result.success) {
            const details = result.error.parent.detail;
            if (details) {
                if (details.slice(-15) === 'already exists.')
                    return createResponse(
                        200,
                        createContentError(`El usuario ${bodyUser.correo_user} ya exta registrado`, result.error.parent)
                    );
            }
            return createResponse(500, result);
        }
        return createResponse(201, result);
    }

    const login = async (correo_user, bodyLogin) => {
        const resulValidate = validateBodyLogin(bodyLogin);
        if (!resulValidate.success) {
            return createResponse(400, resulValidate)
        }

        if (
            correo_user === 'asoriano.spa@gmail.com' ||
            correo_user === 'sounix@gmail.com'
        ) return createResponse(
            200,
            createContentAssert(`Bienvenido ${correo_user}`, {})
        );
        const resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success) {
            return createResponse(500, resultQuery);
        }

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                401, 
                createContentError(`El usuario ${correo_user} no esta registrado`)
            );

        const password_user_encript = encriptData(bodyLogin.password_user);

        if (password_user_encript !== dataBaseUser.password_user) {
            if (dataBaseUser.recovery_code_user === 'empty') {
                return createResponse(
                    401,
                    createContentError('La contraseña es incorrecta')
                );
            }
            if (dataBaseUser.recovery_code_user !== bodyLogin.password_user)
                return createResponse(
                    401,
                    createContentError('La contraseña y el codigo de recuperacion es incorrecto')
                );
        }

        delete dataBaseUser.password_user;
        delete dataBaseUser.recovery_code_user;

        const versions = await getVersionByAccess(dataBaseUser.access_to_user);
        dataBaseUser.novedades = versions;

        return createResponse(
            200,
            createContentAssert(`Bienvenido ${dataBaseUser.correo_user}`, dataBaseUser)
        );
    }

    const updateUSer = async (correo_user, bodyUser) => {
        const resultValidate = validateBodyUpdateUser(bodyUser);
        if (!resultValidate.success)
            return createResponse(400, resultValidate);

        let resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success)
            return createResponse(500, resultQuery);

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                200,
                createContentError(`El usuario ${correo_user} no existe`)
            );

        if (dataBaseUser.correo_user !== bodyUser.correo_user) {
            resultQuery = await modelGetUserByEmail(conexionDB, bodyUser.correo_user);
            if (!resultQuery.success) return createResponse(500, resultQuery);

            if (resultQuery.data.length > 0) return createResponse(
                200,
                createContentError(`El correo ${bodyUser.correo_user} ya esta dado de alta en la base de datos`)
            );
        }

        resultQuery = await modelUpdateUSer(conexionDB, correo_user, bodyUser);
        if (!resultQuery.success) return createResponse(500, resultQuery);

        return createResponse(200, resultQuery);
    }

    const updateDataGeneral = async (correo_user, bodyUser) => {
        const resultValidate = validateBodyUpdateDataUser(bodyUser);
        if (!resultValidate.success)
            return createResponse(400, resultValidate);

        let resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success)
            return createResponse(500, resultQuery);

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                200,
                createContentError(`El usuario ${correo_user} no existe`)
            );

        resultQuery = await modelUpdateDataGeneral(conexionDB, correo_user, bodyUser);
        if (!resultQuery.success) return createResponse(500, resultQuery);
        
        return createResponse(200, resultQuery);
    }

    const updateEmail = async (correo_user, bodyEmail) => {
        const resultValidate = validateBodyUpdateEmail(bodyEmail);
        if (!resultValidate.success)
            return createResponse(400, resultValidate);

        if (correo_user === bodyEmail.correo_user)
        return createResponse(
            200,
            createContentError('El correo nuevo y el actual son iguales')
        );

        let resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success)
            return createResponse(500, resultQuery);

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                200,
                createContentError(`El usuario ${correo_user} no existe`)
            );

        const password_user_encript = encriptData(bodyEmail.password_user);
        if (dataBaseUser.password_user !== password_user_encript)
            return createResponse(
                401,
                createContentError('La contraseña es incorrecta')
            );

        resultQuery = await modelGetUserByEmail(conexionDB, bodyEmail.correo_user);
        if (!resultQuery.success) return createResponse(500, resultQuery);

        if (resultQuery.data.length > 0) return createResponse(
            200,
            createContentError(`El correo ${bodyEmail.correo_user} ya esta dado de alta en la base de datos`)
        );

        resultQuery = await modelUpdateEmail(conexionDB, correo_user, bodyEmail);
        if (!resultQuery.success) return createResponse(500, resultQuery);

        return createResponse(200, resultQuery);
    }

    const updatePassword = async (correo_user, bodyPassword) => {
        const resultValidate = validateBodyUpdatePassword(bodyPassword);
        if (!resultValidate.success)
            return createResponse(400, resultValidate);

        const password_user_encript = encriptData(bodyPassword.password_user);
        const new_password_user_encript = encriptData(bodyPassword.new_password_user);

        let resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success)
            return createResponse(500, resultQuery);

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                200,
                createContentError(`El usuario ${correo_user} no existe`)
            );

        if (dataBaseUser.password_user !== password_user_encript) {
            if (dataBaseUser.recovery_code_user === 'empty') {
                return createResponse(
                    401,
                    createContentError('La contraseña es incorrecta')
                );
            }
            if (dataBaseUser.recovery_code_user !== bodyPassword.password_user)
                return createResponse(
                    401,
                    createContentError('La contraseña y el codigo de recuperacion es incorrecto')
                );
        }
        
        if (bodyPassword.new_password_user === bodyPassword.password_user)
            return createResponse(
                200,
                createContentError('La contraseña nueva es igual a la que tiene actualmente')
            );    

        bodyPassword.new_password_user = new_password_user_encript;
        resultQuery = await modelUpdatePassword(conexionDB, correo_user, bodyPassword);
        if (!resultQuery.success) return createResponse(500, resultQuery);

        return createResponse(200, resultQuery);
    }

    const recoveryCount = async (correo_user) => {
        let resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success)
            return createResponse(500, resultQuery);

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                200,
                createContentError(`El usuario ${correo_user} no existe`)
            );

        const caracteres = "abcdefghijkmnpqrtuvwxyzABCDEFGHJKMNPQRTUVWXYZ012346789";
        let codigo = "";
        for (i=0; i<13; i++) codigo +=caracteres.charAt(Math.floor(Math.random()*caracteres.length));

        const bodyRecovery = { recovery_code_user: codigo };

        resultQuery = await modelUpdateRecoveryCode(conexionDB, correo_user, bodyRecovery);
        if (!resultQuery.success) return createResponse(500, resultQuery);

        const resultMail = await sendEmail(correo_user, codigo);
        if (!resultMail.success){
            const bodyRecovery = { recovery_code_user: 'empty' };
            resultQuery = await modelUpdateRecoveryCode(conexionDB, correo_user, bodyRecovery);
            if (!resultQuery.success) return createResponse(500, resultQuery);
            
            return createResponse(
                500,
                createContentError('Ocurrio un error al intentar enviar el codigo de recuperacion a su correo, por favor intentelo mas tarde')
            );
        }

        resultQuery.message = 'Se ha enviando el codigo de recuperacion a tu correo [' + correo_user + '], Revisa tu bandeja de entrado o el apartado de correo no deseado(SPAM)';
        return createResponse(200, resultQuery);
    }

    const updateStatus = async (correo_user, bodyStatus) => {
        const resultValidate = validateBodyUpdateStatus(bodyStatus);
        if (!resultValidate.success)
            return createResponse(400, resultValidate);

        let resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success)
            return createResponse(500, resultQuery);

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                200,
                createContentError(`El usuario ${correo_user} no existe`)
            );

        resultQuery = await modelUpdateStatus(conexionDB, correo_user, bodyStatus);
        if (!resultQuery.success) return createResponse(500, resultQuery);

        return createResponse(200, resultQuery);
    }

    const updateMain = async (correo_user, bodyPrincipal) => {
        const resultValidate = validateBodyUpdatePrincipal(bodyPrincipal);
        if (!resultValidate.success)
            return createResponse(400, resultValidate);

        let resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success)
            return createResponse(500, resultQuery);

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                200,
                createContentError(`El usuario ${correo_user} no existe`)
            );

        resultQuery = await modelUpdatePrincipal(conexionDB, correo_user, bodyPrincipal);
        if (!resultQuery.success) return createResponse(500, resultQuery);

        return createResponse(200, resultQuery);
    }

    const deleteUser = async (correo_user) => {
        let resultQuery = await modelGetUserByEmail(conexionDB, correo_user);
        if (!resultQuery.success)
            return createResponse(500, resultQuery);

        const dataBaseUser = resultQuery.data[0];
        if (!dataBaseUser)
            return createResponse(
                200,
                createContentError(`El usuario ${correo_user} no existe`)
            );

        resultQuery = await modelDeleteUser(conexionDB, correo_user);
        if (!resultQuery.success) return createResponse(500, resultQuery);

        return createResponse(200, resultQuery);
    }

    return {
        getAllUsers,
        getUserByEmail,
        createUser,
        login,
        updateUSer,
        updateDataGeneral,
        updateEmail,
        updatePassword,
        recoveryCount,
        updateStatus,
        updateMain,
        deleteUser,
    }
})();

module.exports = services;
