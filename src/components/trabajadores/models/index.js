const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsTrabajadores = (() => {
    const getAsistenciasBySucursal = async (cadenaConexion = '', sucursal, fechaini, fechafin) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015
                DECLARE @FechaInicial DATETIME = CAST('${fechaini} 00:00:00:000 AM' AS DATETIME)
                DECLARE @FechaFinal DATETIME = CAST('${fechafin} 11:59:59:999 PM' AS DATETIME)
                DECLARE @Sucursal NVARCHAR(50) = '${sucursal}'

                SELECT
                    T.Nombre, FechaServer = CONVERT(NVARCHAR, A.FechaServidor, 25), A.Estatus
                FROM Trabajadores AS T
                LEFT JOIN Asistencias AS A ON A.IdTrabajador = T.IdTrabajador
                WHERE T.Categoria = @Sucursal
                    AND (A.FechaServidor BETWEEN @FechaInicial AND @FechaFinal)
                ORDER BY T.Nombre, A.FechaServidor
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la lista de asistencias',
                error
            );
        }
    }
    
    const getTrabajadores = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                SELECT * FROM Trabajadores;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de trabajadores', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la lista de trabajadores',
                error
            );
        }
    }
    
    const getClave = async (cadenaConexion = '', Cajero) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                SELECT
                    C.*, T.Nombre, T.Categoria
                FROM ClaveTrabajador AS C
                LEFT JOIN Trabajadores AS T ON C.IdTrabajador = T.IdTrabajador
                WHERE C.Cajero = '${Cajero}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos del trabajador', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la clave del trabajador',
                error
            );
        }
    }
    
    const getClaves = async (cadenaConexion = '', sucursal) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                SELECT
                    Sucursal = '${sucursal}',
                    C.*, T.Nombre, T.Categoria
                FROM ClaveTrabajador AS C
                LEFT JOIN Trabajadores AS T ON C.IdTrabajador = T.IdTrabajador;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos del trabajador', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la clave del trabajador',
                error
            );
        }
    }
    
    const createClave = async (cadenaConexion = '', IdTrabajador, Cajero, Clave, Privilegios) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015
                INSERT INTO ClaveTrabajador(IdTrabajador, Cajero, Clave, Privilegios) VALUES ('${IdTrabajador}', '${Cajero}', '${Clave}', '${Privilegios}');
                `,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Clave registrada', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar registrar la clave del trabajador',
                error
            );
        }
    }
    
    const updateClave = async (cadenaConexion = '', Cajero, Clave) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE ClaveTrabajador SET Clave = '${Clave}' WHERE Cajero = '${Cajero}';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Clave actualizada', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar la clave del trabajador',
                error
            );
        }
    }
    
    const updatePrivilegios = async (cadenaConexion = '', Cajero, Privilegios) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE ClaveTrabajador SET Privilegios = '${Privilegios}' WHERE Cajero = '${Cajero}';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Clave actualizada', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los privilegios del trabajador',
                error
            );
        }
    }

    const updateIdTrabajador = async (cadenaConexion = '', Cajero, IdTrabajador) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE ClaveTrabajador SET IdTrabajador = '${IdTrabajador}' WHERE Cajero = '${Cajero}';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Id del trabajador actualizada', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar el Id del trabajador',
                error
            );
        }
    }
    
    const registerAsistencia = async (cadenaConexion = '', IdTrabajador, Estatus) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                INSERT INTO Asistencias (IdTrabajador, FechaServidor, Estatus) VALUES ('${IdTrabajador}', GETDATE(), '${Estatus}');
                `,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Asistencia registrada', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar registrar la asistencia del trabajador',
                error
            );
        }
    }

    const registerVinculacion = async (cadenaConexion = '', IdTrabajador, IdDispositivo) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                INSERT INTO DispositivosVinculados(IdTrabajador, IdDispositivo) VALUES ('${IdTrabajador}', '${IdDispositivo}');
                `,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Dispositivo vinculado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar vincular dispositivo',
                error
            );
        }
    }

    const getDeviceVinculado = async (cadenaConexion = '', IdTrabajador, IdDispositivo) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                SELECT * FROM DispositivosVinculados WHERE IdTrabajador = '${IdTrabajador}' AND IdDispositivo = '${IdDispositivo}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener el dispositivo vinculado',
                error
            );
        }
    }

    const updateVinculacion = async (cadenaConexion = '', IdTrabajador, IdDispositivo) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE DispositivosVinculados SET IdDispositivo ='${IdDispositivo}' WHERE IdTrabajador = '${IdTrabajador}';
                `,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Dispositivo Actualizado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar dispositivo',
                error
            );
        }
    }

    return {
        getAsistenciasBySucursal,
        getTrabajadores,
        getClave,
        getClaves,
        createClave,
        updateClave,
        updatePrivilegios,
        updateIdTrabajador,
        registerAsistencia,
        registerVinculacion,
        getDeviceVinculado,
        updateVinculacion,
    }
})();

module.exports = modelsTrabajadores;
