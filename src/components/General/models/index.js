const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const ModelsGeneral = (() => {
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
            const consulta = `BACKUP DATABASE [${dataBase}]
                TO DISK = N'${source}\\${name}' 
                WITH NOFORMAT, NOINIT,
                NAME = N'SQLTestDB-Full Database Backup', SKIP, NOREWIND, NOUNLOAD, STATS = 10;`;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                consulta,
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
            const newName = source.replace('.BAK', '');
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 600000);
            const result = await accessToDataBase.query(
                `EXEC sp_configure 'show advanced options', 1
                RECONFIGURE
                EXEC sp_configure 'xp_cmdshell', 1
                RECONFIGURE
                
                EXEC xp_cmdshell 'rar a "${newName}.ZIP" "${source}"'

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
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 1800000);
            const result = await accessToDataBase.query(
                `EXEC sp_configure 'show advanced options', 1
                RECONFIGURE
                EXEC sp_configure 'xp_cmdshell', 1
                RECONFIGURE
                
                EXEC xp_cmdshell 'cd C:/APP/loadbackups/ & node src/uploadBackup/index.js ${source}%${nameFile}%${sucursal}'
                
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

    const getDataBasesOnServer = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 30000);
            const result = await accessToDataBase.query(
                `
                USE master
                SELECT DISTINCT
                    SUBSTRING(volume_mount_point, 1, 1) AS Disco,
                    total_bytes/1024/1024/1024 AS total_GB,
                    available_bytes/1024/1024/1024 AS Disponible_GB,
                    ISNULL(ROUND(available_bytes / CAST(NULLIF(total_bytes, 0) AS FLOAT) * 100, 2), 0) as Porcentaje_Disponible
                FROM
                    sys.master_files AS f
                CROSS APPLY
                    sys.dm_os_volume_stats(f.database_id, f.file_id);
                WITH fs
                AS
                (
                    SELECT database_id, type, size * 8.0 / 1024 size, state_desc
                    FROM sys.master_files
                ), lastBackup (
                    database_name, Fecha
                ) AS (
                    SELECT database_name, MAX(backup_finish_date) AS Fecha
                    FROM msdb..backupset
                    WHERE Type = 'D'
                    GROUP BY database_name 
                )
                SELECT
                    name AS DataBaseName,
                    (SELECT sum(size) FROM fs WHERE type = 0 AND fs.database_id = db.database_id) DataFileSizeMB,
                    (SELECT sum(size) FROM fs WHERE type = 1 AND fs.database_id = db.database_id) LogFileSizeMB,
                    state_desc AS Estatus,
                    L.Fecha AS LastBackup,
                    IsSupporting = 1,
                    create_date
                FROM sys.databases db
                LEFT JOIN lastBackup AS L ON L.database_name = db.name
                WHERE database_id > 4
                ORDER BY DataFileSizeMB DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Informacion de las bases de datos', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener la informacion de las bases de datos', error);
        }
    }

    const getDataFilesBD = async (cadenaConexion = '', dataBase) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 30000);
            const result = await accessToDataBase.query(
                `
                USE ${dataBase};
                SELECT
                    file_id, name, type_desc, physical_name, size/128.0 sizeInMB, max_size  
                FROM sys.database_files;  
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Informacion de los archivos de la base de datos: ' + dataBase, result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener informacion de los archivos fisicos de las base de datos', error);
        }
    }

    const reduceLog = async (cadenaConexion = '', dataBase, nameLog) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 30000);
            const result = await accessToDataBase.query(
                `
                USE ${dataBase};
                CHECKPOINT;
                CHECKPOINT;

                ALTER DATABASE ${dataBase}
                SET RECOVERY SIMPLE;

                DBCC SHRINKFILE (N'${nameLog}', 10);

                ALTER DATABASE ${dataBase}
                SET RECOVERY FULL;
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultados de reduccion de log en: ' + dataBase, result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar reducir el log de la base de datos: ' + dataBase, error);
        }
    }

    const getFacturas = async (cadenaConexion = '', dateStart = '', dateEnd = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 30000);
            const result = await accessToDataBase.query(
                `
                DECLARE @fechaInicial DATETIME = CAST('${dateStart} 00:00:00.000' AS DATETIME);
                DECLARE @fechaFinal DATETIME = CAST('${dateEnd} 23:59:59.999' AS DATETIME);

                SELECT
                    R_RFC, Tercero, C.Nombre, MDocumento, TipoC, Tienda, Serie, Folio,
                    Fecha, Subtotal, IVA, F.Descuento, Total, Estado, EdoTimbre
                FROM MaestroFacturas AS F
                INNER JOIN Clientes AS C ON C.Cliente = F.Tercero
                WHERE Fecha >= @fechaInicial AND Fecha <= @fechaFinal
                ORDER BY Fecha;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            console.log(result[0].length);
            return createContentAssert('Facturas de la sucursal ', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener las facturas de: ', error);
        }
    }

    const getExistenciasAntiguedad = async (cadenaConexion = '', dias = 45) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 30000);
            const result = await accessToDataBase.query(
                `
                SELECT 
                    *,
                    Estatus = CASE WHEN ExistUV >= StockMinimo AND ExistUV <= StockMaximo THEN 'OK' WHEN ExistUV < StockMinimo THEN 'BAJO' WHEN ExistUV > StockMaximo THEN 'SOBRE' ELSE '' END
                FROM VistaBIExistencias 
                WHERE Dias >= ${dias}
                ORDER BY Dias DESC;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            console.log(result[0].length);
            return createContentAssert('Existencias por antiguedad', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener las existencias por antiguedad: ', error);
        }
    }

    const getListDatabases = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion, 30000);
            const result = await accessToDataBase.query(
                'SELECT name AS DataBaseName FROM sys.databases WHERE database_id > 4',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            console.log(result[0].length);
            return createContentAssert('Lista de bases de datos', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener la lista de base de datos: ', error);
        }
    }

    return {
        testConnection,
        calculaFoliosSucursal,
        updateFoliosSucursal,
        createBackup,
        createZipBackup,
        uploadBackupToDrive,
        getDataBasesOnServer,
        getDataFilesBD,
        reduceLog,
        getFacturas,
        getExistenciasAntiguedad,
        getListDatabases,
    }
})();

module.exports = ModelsGeneral;
