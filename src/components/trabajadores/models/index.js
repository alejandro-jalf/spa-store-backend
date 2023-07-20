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
                SELECT * FROM ClaveTrabajador WHERE Cajero = '${Cajero}';
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
    
    const createClave = async (cadenaConexion = '', IdTrabajador, Cajero, Clave) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015
                INSERT INTO ClaveTrabajador(IdTrabajador, Cajero, Clave) VALUES ('${IdTrabajador}', '${Cajero}', '${Clave}');
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
    
    const updateClave = async (cadenaConexion = '', IdTrabajador, Clave) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE ClaveTrabajador SET Clave = '${Clave}' WHERE IdTrabajador = '${IdTrabajador}';
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

    return {
        getAsistenciasBySucursal,
        getTrabajadores,
        getClave,
        createClave,
        updateClave,
        registerAsistencia,
    }
})();

module.exports = modelsTrabajadores;
