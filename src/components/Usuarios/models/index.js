const { QueryTypes } = require("sequelize");
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError,
    toBit,
} = require("../../../utils");

const models = (() => {
    const modelGetAllUser = async (stringConection) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM users',
                QueryTypes.SELECT
                );
            await dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar buscar los usuarios',
                error
            );
        }
    }

    const modelGetUserByEmail = async (stringConection, correo_user) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                SELECT
                    *
                FROM users WHERE correo_user = '${correo_user}'`,
                QueryTypes.SELECT
            );
            await dbmssql.closeConexion();
            return createContentAssert(`Datos encontrados del usuario ${correo_user}`, result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar buscar al usuario ' + correo_user,
                error
            );
        }
    }

    const modelGetVersionsApp = async (stringConection) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM versiones ORDER BY fechadelanzamiento DESC',
                QueryTypes.SELECT
            );
            await dbmssql.closeConexion();
            return createContentAssert('Versiones de la aplicacion', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las versiones de la aplicacion',
                error
            );
        }
    }

    const modelCreateUser = async (stringConection, bodyUser) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                INSERT INTO users(
                    nombre_user, apellido_p_user, apellido_m_user, direccion_user, sucursal_user,
                    correo_user, password_user, tipo_user, access_to_user, principal
                ) VALUES(
                    '${bodyUser.nombre_user}', '${bodyUser.apellido_p_user}', '${bodyUser.apellido_m_user}',
                    '${bodyUser.direccion_user}', '${bodyUser.sucursal_user}', '${bodyUser.correo_user}',
                    '${bodyUser.password_user}', '${bodyUser.tipo_user}','${bodyUser.access_to_user}', 'Inicio'
                )`,
                QueryTypes.INSERT
            );
            await dbmssql.closeConexion();
            return createContentAssert(`Se ha dado de alta al usuario ${bodyUser.correo_user}`, result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar dar de alta al usuario ' + bodyUser.correo_user,
                error
            );
        }
    }

    const modelUpdateUSer = async (stringConection, correo_user, bodyUser) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE users SET
                    nombre_user = '${bodyUser.nombre_user}', apellido_p_user = '${bodyUser.apellido_p_user}',
                    apellido_m_user = '${bodyUser.apellido_m_user}', direccion_user = '${bodyUser.direccion_user}',
                    sucursal_user = '${bodyUser.sucursal_user}', correo_user = '${bodyUser.correo_user}',
                    tipo_user = '${bodyUser.tipo_user}', access_to_user = '${bodyUser.access_to_user}',
                    activo_user = ${toBit(bodyUser.activo_user)}
                WHERE correo_user = '${correo_user}'`,
                QueryTypes.UPDATE
            );
            await dbmssql.closeConexion();
            return createContentAssert(`Los datos del usuario ${correo_user} han sido modificados`, result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar al usuario ' + correo_user,
                error
            );
        }
    }

    const modelUpdateDataGeneral = async (stringConection, correo_user, bodyUser) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE users SET
                    nombre_user = '${bodyUser.nombre_user}', apellido_p_user = '${bodyUser.apellido_p_user}',
                    apellido_m_user = '${bodyUser.apellido_m_user}', direccion_user = '${bodyUser.direccion_user}'
                WHERE correo_user = '${correo_user}'`,
                QueryTypes.UPDATE
            );
            await dbmssql.closeConexion();
            return createContentAssert(`Los datos del usuario ${correo_user} han sido modificados`, result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar al usuario generales ' + correo_user,
                error
            );
        }
    }

    const modelUpdateEmail = async (stringConection, correo_user, bodyEmail) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE users SET
                    correo_user = '${bodyEmail.correo_user}'
                WHERE correo_user = '${correo_user}'`,
                QueryTypes.UPDATE
            );
            await dbmssql.closeConexion();
            return createContentAssert('La direccion de correo electronico ha sido actualizada', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar la direccion de correo electronico',
                error
            );
        }
    }

    const modelUpdatePassword = async (stringConection, correo_user, bodyPassword) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE users SET
                    password_user = '${bodyPassword.new_password_user}',
                    recovery_code_user = 'empty'
                WHERE correo_user = '${correo_user}'`,
                QueryTypes.UPDATE
            );
            await dbmssql.closeConexion();
            return createContentAssert('La contraseña ha sido actualizada', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar la contraseña',
                error
            );
        }
    }

    const modelUpdateRecoveryCode = async (stringConection, correo_user, bodyRecovery) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE users SET
                    recovery_code_user = '${bodyRecovery.recovery_code_user}'
                WHERE correo_user = '${correo_user}'`,
                QueryTypes.UPDATE
            );
            await dbmssql.closeConexion();
            return createContentAssert('Se ha generado un codigo de recuperacion', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar recuperar la cuenta',
                error
            );
        }
    }

    const modelUpdateStatus = async (stringConection, correo_user, bodyStatus) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE users SET
                    activo_user = ${toBit(bodyStatus.activo_user)}
                WHERE correo_user = '${correo_user}'`,
                QueryTypes.UPDATE
            );
            await dbmssql.closeConexion();
            const status = bodyStatus.activo_user ? 'Activo' : 'Inactivo';
            return createContentAssert(`Se ha actualizado el status del usuario ${correo_user} a ${status}`, result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar el status del usuario ' + correo_user,
                error
            );
        }
    }

    const modelUpdatePrincipal = async (stringConection, correo_user, bodyPrincipal) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE users SET
                    principal = '${bodyPrincipal.principal}'
                WHERE correo_user = '${correo_user}'`,
                QueryTypes.UPDATE
            );
            await dbmssql.closeConexion();
            return createContentAssert(`Se ha registrado a ${bodyPrincipal.principal} como pestaña principal`, result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar la pestaña principal ',
                error
            );
        }
    }

    const modelDeleteUser = async (stringConection, correo_user) => {
        try {
            const accessToDataBase = dbmssql.getConexion(stringConection);
            const result = await accessToDataBase.query(
                `USE CA2015; DELETE FROM users WHERE correo_user = '${correo_user}'`,
                QueryTypes.DELETE
            );
            await dbmssql.closeConexion();
            return createContentAssert('Se ha eliminado al usuario ' + correo_user, result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar al usuario ' + correo_user,
                error
            );
        }
    }

    return {
        modelGetAllUser,
        modelGetVersionsApp,
        modelGetUserByEmail,
        modelCreateUser,
        modelUpdateUSer,
        modelUpdateDataGeneral,
        modelUpdateEmail,
        modelUpdatePassword,
        modelUpdateRecoveryCode,
        modelUpdateStatus,
        modelUpdatePrincipal,
        modelDeleteUser,
    }
})();

module.exports = models;
