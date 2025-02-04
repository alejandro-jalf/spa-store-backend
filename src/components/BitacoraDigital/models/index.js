const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const ModelsGeneral = (() => {

    const getLastFolios = async (cadenaConexion = '', sucursal = 'ZR', limit = 500) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015REPOSICIONES;
                SELECT TOP ${limit}
                    *
                FROM BitacoraDigital.Compras
                WHERE Sucursal = '${sucursal}'
                ORDER BY Fecha DESC`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Folios encontrados', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener los folios de bitacora', error);
        }
    }

    const getFoliosByDate = async (cadenaConexion = '', sucursal = 'ZR', fecha = '20220101') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015REPOSICIONES;
                SELECT
                    *
                FROM BitacoraDigital.Compras
                WHERE Sucursal = '${sucursal}'
                    AND Fecha BETWEEN CAST('${fecha} 00:00:00.000' AS DATETIME) AND CAST('${fecha} 23:59:59.999' AS DATETIME)
                ORDER BY Folio DESC`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Folios encontrados', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener los folios de bitacora', error);
        }
    }

    const getFolio = async (cadenaConexion = '', folio = 'ZR2024010101') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015REPOSICIONES;
                SELECT
                    *
                FROM BitacoraDigital.Compras
                WHERE Folio = '${folio}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Folio encontrado', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener el folio de bitacora', error);
        }
    }

    const getFolioById = async (cadenaConexion = '', id = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015REPOSICIONES;
                SELECT
                    *
                FROM BitacoraDigital.Compras
                WHERE id = '${id}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Folio encontrado', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener el folio de bitacora', error);
        }
    }

    const getLastFolio = async (cadenaConexion = '', sucursal = 'ZR', fecha = '20220101') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015REPOSICIONES;
                SELECT TOP 1
                    *
                FROM BitacoraDigital.Compras
                WHERE Sucursal = '${sucursal}'
                    AND Fecha BETWEEN CAST('${fecha} 00:00:00.000' AS DATETIME) AND CAST('${fecha} 23:59:59.999' AS DATETIME)
                ORDER BY Folio DESC`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Ultimo Folio encontrado', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener los folios de bitacora', error);
        }
    }

    const getProviders = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015REPOSICIONES; SELECT *  FROM BitacoraDigital.Proveedores',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Ultimo Folio encontrado', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener los folios de bitacora', error);
        }
    }

    const createFolio = async (cadenaConexion = '', Sucursal, Fecha, Folio, Proveedor, Subtotal, Descuento, Ieps, Iva,Total, Documento) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
            `USE CA2015REPOSICIONES;
            DECLARE @Fecha datetime = CAST('${Fecha} ' + CONVERT(NVARCHAR, getdate(), 108) + '.000' AS datetime);
            INSERT INTO BitacoraDigital.Compras(
                id, Sucursal, Fecha, Folio, Proveedor, Subtotal, Descuento, Ieps, Iva,Total, Documento, Estatus
            ) VALUES (
                NEWID(), ${Sucursal}, @Fecha, ${Folio}, '${Proveedor}', ${Subtotal}, ${Descuento}, ${Ieps}, ${Iva}, ${Total}, '${Documento}', 'A TIEMPO'
            );`,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Folio Agregado', result);
        } catch (error) {
            return createContentError('Fallo al intentar crear un nuevo folio a bitacora', error);
        }
    }

    const updateFolio = async (cadenaConexion = '', id, Proveedor, Subtotal, Descuento, Ieps, Iva,Total, Documento) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
            `USE CA2015REPOSICIONES;
            UPDATE BitacoraDigital.Compras SET 
                Proveedor = '${Proveedor}',
                Subtotal = ${Subtotal},
                Descuento = ${Descuento},
                Ieps = ${Ieps},
                Iva = ${Iva},
                Total = ${Total},
                Documento = '${Documento}'
            WHERE id = ${id};`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Folio Actualizado', result);
        } catch (error) {
            return createContentError('Fallo al intentar actualizar el folio de bitacora', error);
        }
    }

    const updateStatusFolio = async (cadenaConexion = '', id, Estatus) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
            `USE CA2015REPOSICIONES; UPDATE BitacoraDigital.Compras SET Estatus = '${Estatus}' WHERE id = ${id};`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Folio Actualizado', result);
        } catch (error) {
            return createContentError('Fallo al intentar actualizar el folio de bitacora', error);
        }
    }

    return {
        getLastFolios,
        getFoliosByDate,
        getFolio,
        getFolioById,
        getLastFolio,
        getProviders,
        createFolio,
        updateFolio,
        updateStatusFolio
    }
})();

module.exports = ModelsGeneral;
