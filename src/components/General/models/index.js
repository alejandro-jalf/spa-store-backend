const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsGeneral = (() => {
    const testConnection = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'SELECT 1 + 1',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Conexion exitosa', result[0]);
        } catch (error) {
            return createContentError('Conexion fallida', error);
        }
    }

    const calculaFoliosSucursal = async (cadenaConexion = '', sucursal = 'ZR', promMensual = 200) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `SELECT
                    Tienda,
                    Serie,
                    FolioInicial,
                    FolioFinal,
                    FolioActual,
                    FolioDisponible = FolioFinal - FolioActual,
                    INCREMENTODEFOLIO = ${promMensual} - (FolioFinal - FolioActual),
                    FOLIOFINC = (${promMensual} - (FolioFinal - FolioActual)) + FOLIOFINAL
                FROM SeriesFolios
                WHERE Serie IN('${sucursal}', '${sucursal}E')`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de folios encontrados', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener el calculo de folios mensuales', error);
        }
    }

    const updateFoliosSucursal = async (cadenaConexion = '', serie = '', newFolio) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `UPDATE SeriesFolios
                SET
                    FolioFinal = ${newFolio}
                WHERE Serie = '${serie}'
                    AND FolioFinal < ${newFolio}`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion de folios', result);
        } catch (error) {
            return createContentError('Fallo al intentar actualizar los folios', error);
        }
    }

    const createBackup = async (cadenaConexion = '', source, name, dataBase) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `BACKUP DATABASE [${dataBase}]
                TO DISK = N'${source}\\${name}' 
                WITH NOFORMAT, NOINIT,
                NAME = N'SQLTestDB-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10;`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de respaldo', result);
        } catch (error) {
            return createContentError('Fallo al intentar realizar respaldo', error);
        }
    }

    const createZipBackup = async (cadenaConexion = '', source) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 300000);
            const result = await accessToDataBase.query(
                `EXEC sp_configure 'show advanced options', 1
                RECONFIGURE
                EXEC sp_configure 'xp_cmdshell', 1
                RECONFIGURE
                
                EXEC xp_cmdshell 'rar a "${source}.zip" "${source}"'

                EXEC xp_cmdshell 'DEL /F /A ${source}'
                
                EXEC sp_configure 'xp_cmdshell', 0
                RECONFIGURE
                EXEC sp_configure 'show advanced options', 0
                RECONFIGURE`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de compresion', result);
        } catch (error) {
            return createContentError('Fallo al intentar comprimir', error);
        }
    }

    const uploadBackupToDrive = async (cadenaConexion = '', source, nameFile, sucursal) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 300000);
            const result = await accessToDataBase.query(
                `EXEC sp_configure 'show advanced options', 1
                RECONFIGURE
                EXEC sp_configure 'xp_cmdshell', 1
                RECONFIGURE
                
                EXEC xp_cmdshell 'cd C:/APP/loadbackups/src/uploadBackup & node index.js ${source}%${nameFile}%${sucursal}'
                
                EXEC sp_configure 'xp_cmdshell', 0
                RECONFIGURE
                EXEC sp_configure 'show advanced options', 0
                RECONFIGURE`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de subir respaldo', result);
        } catch (error) {
            return createContentError('Fallo al intentar subir el respaldo a google drive', error);
        }
    }

    return {
        testConnection,
        calculaFoliosSucursal,
        updateFoliosSucursal,
        createBackup,
        createZipBackup,
        uploadBackupToDrive,
    }
})();

module.exports = modelsGeneral;
