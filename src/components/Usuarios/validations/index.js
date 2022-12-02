const { createContentAssert, createContentError } = require('../../../utils');
const {
    schemaCreateUser,
    schemaLogin,
    schemaUpdateUser,
    schemaUpdateDataGeneral,
    schemaContentLetters,
    schemaContentNumbers,
    schemaUpdateEmail,
    schemaUpdatePassword,
    schemaUpdateRecovery,
    schemaUpdateStatus,
    schemaPrincipal,
} = require('../schema');

const validations = (() => {
    const validateBodyCrateUser = (bodyUser) => {
        if (!bodyUser) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyUser
            );
        }

        if (typeof bodyUser !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyUser
            );
        }

        let resultValidate = schemaCreateUser.validate(bodyUser);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        if (bodyUser.password_user.length < 7) {
            return createContentError('La contraseña debe ser mayor de 6 caracteres');
        }

        resultValidate = schemaContentLetters.validate(bodyUser.password_user);
        if (resultValidate.error) {
            return createContentError("La contraseña debe contener al menos una letra", resultValidate.error);
        }

        resultValidate = schemaContentNumbers.validate(bodyUser.password_user);
        if (resultValidate.error) {
            return createContentError("La contraseña debe contener al menos un numero", resultValidate.error);
        }
        
        if (
            bodyUser.tipo_user != "invited" &&
            bodyUser.tipo_user != "manager" &&
            bodyUser.tipo_user != "executive"
        ) {
            return createContentError("El tipo de usuario que mando no es valido");
        }

        return createContentAssert("Validacion correcta");
    }

    const validateBodyLogin = (bodyLogin) => {
        if (!bodyLogin) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyLogin
            );
        }

        if (typeof bodyLogin !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyLogin
            );
        }

        let resultValidate = schemaLogin.validate(bodyLogin);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        return createContentAssert("Validacion correcta");
    }

    const validateBodyUpdateUser = (bodyUser) => {
        if (!bodyUser) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyUser
            );
        }

        if (typeof bodyUser !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyUser
            );
        }

        let resultValidate = schemaUpdateUser.validate(bodyUser);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }
        
        if (
            bodyUser.tipo_user != "invited" &&
            bodyUser.tipo_user != "manager" &&
            bodyUser.tipo_user != "executive"
        ) {
            return createContentError("El tipo de usuario que mando no es valido");
        }

        return createContentAssert("Validacion correcta");
    }

    const validateBodyUpdateDataUser = (bodyData) => {
        if (!bodyData) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyData
            );
        }

        if (typeof bodyData !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyData
            );
        }
        
        let resultValidate = schemaUpdateDataGeneral.validate(bodyData);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        return createContentAssert("Validacion correcta");
    }

    const validateBodyUpdateEmail = (bodyEmail) => {
        if (!bodyEmail) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyEmail
            );
        }

        if (typeof bodyEmail !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyEmail
            );
        }

        let resultValidate = schemaUpdateEmail.validate(bodyEmail);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        return createContentAssert("Validacion correcta");
    }

    const validateBodyUpdatePassword = (bodyPassword) => {
        if (!bodyPassword) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyPassword
            );
        }

        if (typeof bodyPassword !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyPassword
            );
        }

        let resultValidate = schemaUpdatePassword.validate(bodyPassword);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        if (bodyPassword.new_password_user.length < 7) {
            return createContentError('La contraseña debe ser mayor de 6 caracteres');
        }

        resultValidate = schemaContentLetters.validate(bodyPassword.new_password_user);
        if (resultValidate.error) {
            return createContentError("La contraseña debe contener al menos una letra", resultValidate.error);
        }

        resultValidate = schemaContentNumbers.validate(bodyPassword.new_password_user);
        if (resultValidate.error) {
            return createContentError("La contraseña debe contener al menos un numero", resultValidate.error);
        }

        return createContentAssert("Validacion correcta");
    }

    const validateBodyUpdateRecovery = (bodyRecovery) => {
        if (!bodyRecovery) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyRecovery
            );
        }

        if (typeof bodyRecovery !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyRecovery
            );
        }

        let resultValidate = schemaUpdateRecovery.validate(bodyRecovery);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        return createContentAssert("Validacion correcta");
    }


    const validateBodyUpdateStatus = (bodyStatus) => {
        if (!bodyStatus) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyStatus
            );
        }

        if (typeof bodyStatus !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyStatus
            );
        }

        let resultValidate = schemaUpdateStatus.validate(bodyStatus);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        return createContentAssert("Validacion correcta");
    }

    const validateBodyUpdatePrincipal = (bodyPrincipal) => {
        if (!bodyPrincipal) {
            return createContentError(
                'Se esperaba recivir un objeto y se recivio un valor indefinido',
                bodyPrincipal
            );
        }

        if (typeof bodyPrincipal !== 'object') {
            return createContentError(
                'Se esperaba un objeto y se recivio un valor distinto de un objeto',
                bodyPrincipal
            );
        }

        let resultValidate = schemaPrincipal.validate(bodyPrincipal);
        if (resultValidate.error) {
            return createContentError("Algun dato fue enviado de manera incorrecta", resultValidate.error);
        }

        return createContentAssert("Validacion correcta");
    }


    return {
        validateBodyCrateUser,
        validateBodyLogin,
        validateBodyUpdateUser,
        validateBodyUpdateDataUser,
        validateBodyUpdateEmail,
        validateBodyUpdatePassword,
        validateBodyUpdateRecovery,
        validateBodyUpdateStatus,
        validateBodyUpdatePrincipal,
    }
})();

module.exports = validations;
