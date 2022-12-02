const joi = require('joi');

const schemas = (() => {
    
    const schemaContentLetters = joi.string().regex(/[a-zA-Z]+/);

    const schemaContentNumbers = joi.string().regex(/\d+/);

    const schemaCreateUser = joi.object({
        nombre_user: joi.string().min(1).max(35).required(),
        apellido_p_user: joi.string().min(1).max(35).required(),
        apellido_m_user: joi.string().min(1).max(35).required(),
        direccion_user: joi.string().min(1).max(150).required(),
        sucursal_user: joi.string().min(1).max(25).required(),
        correo_user: joi.string().min(1).max(70).email().required(),
        password_user: joi.string().min(1).max(150).required(),
        tipo_user: joi.string().min(1).max(10).allow('invited', 'manager', 'executive').required(),
        access_to_user: joi.string().min(1).required()
    });

    const schemaLogin = joi.object({
        password_user: joi.string().min(1).max(150).required()
    });

    const schemaUpdateUser = joi.object({
        nombre_user: joi.string().min(1).max(35).required(),
        apellido_p_user: joi.string().min(1).max(35).required(),
        apellido_m_user: joi.string().min(1).max(35).required(),
        direccion_user: joi.string().min(1).max(150).required(),
        sucursal_user: joi.string().min(1).max(25).required(),
        correo_user: joi.string().min(1).max(70).email().required(),
        tipo_user: joi.string().min(1).max(10).allow('invited', 'manager', 'executive').required(),
        access_to_user: joi.string().min(1).required(),
        activo_user: joi.boolean().required()
    });

    const schemaUpdateDataGeneral = joi.object({
        nombre_user: joi.string().min(1).max(35).required(),
        apellido_p_user: joi.string().min(1).max(35).required(),
        apellido_m_user: joi.string().min(1).max(35).required(),
        direccion_user: joi.string().min(1).max(150).required()
    });

    const schemaUpdateEmail = joi.object({
        correo_user: joi.string().min(1).max(70).email().required(),
        password_user: joi.string().min(1).max(150).required()
    });

    const schemaUpdatePassword = joi.object({
        password_user: joi.string().min(1).max(150).required(),
        new_password_user: joi.string().min(1).max(150).required()
    });

    const schemaUpdateRecovery = joi.object({
        recovery_code_user: joi.string().min(1).max(50).required()
    });

    const schemaUpdateStatus = joi.object({
        activo_user: joi.boolean().required()
    });

    const schemaPrincipal = joi.object({
        principal: joi.string().min(1).max(100).required()
    });

    return {
        schemaContentLetters,
        schemaContentNumbers,
        schemaCreateUser,
        schemaLogin,
        schemaUpdateUser,
        schemaUpdateDataGeneral,
        schemaUpdateEmail,
        schemaUpdatePassword,
        schemaUpdateRecovery,
        schemaUpdateStatus,
        schemaPrincipal,
    }
})();

module.exports = schemas;
