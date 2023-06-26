const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsProveedores = (() => {
    const getAllProviders = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'SELECT Proveedor, Nombre FROM Proveedores',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Proveedores encontrados', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los proveedores',
                error
            );
        }
    }

    const getAllRequestProviders = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT TOP 100 * FROM SolicitudProveedores ORDER BY FechaCreado DESC;',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Solicitudes encontrados', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los proveedores',
                error
            );
        }
    }

    const getRequestBySuc = async (cadenaConexion = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT TOP 100 * FROM SolicitudProveedores WHERE Sucursal = '${sucursal}' ORDER BY FechaCreado DESC;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de solicitudes por sucursal', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de solicitudes por sucursal',
                error
            );
        }
    }

    const getRequestProvider = async (cadenaConexion = '', uuid) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                SELECT * FROM SolicitudProveedores WHERE UUID = '${uuid}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('articulo solicitado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la articulo solicitado',
                error
            );
        }
    }

    const createRequestProvider = async (cadenaConexion = '', sucursal= '', CreadoPor = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                DECLARE @Consecutivo int = (SELECT TOP 1 Consecutivo FROM SolicitudProveedores WHERE Sucursal = '${sucursal}' ORDER BY Consecutivo DESC);
                DECLARE @NewConsecutivo int = ISNULL(@Consecutivo, 0);

                INSERT INTO SolicitudProveedores(
                    Sucursal, Consecutivo, CuentaContabilidad, CuentaWinCaja, Nombre, RFC, Direccion, Telefono, Correo, Estatus, CreadoPor
                ) VALUES (
                    '${sucursal}', @NewConsecutivo + 1, '', '', '', '', '', '', '', 'EN SUCURSAL', '${CreadoPor}'
                );
                SELECT *  FROM SolicitudProveedores WHERE Sucursal = '${sucursal}' AND Consecutivo = @NewConsecutivo + 1;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Proveedores encontrados', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los proveedores',
                error
            );
        }
    }

    const updateRequestProvider = async (cadenaConexion = '', uuid = '', body = {}) => {
        try {
            const { Nombre, RFC, Direccion, Telefono, Correo } = body;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE SolicitudProveedores SET
                    Nombre = '${Nombre}', RFC = '${RFC}', Direccion = '${Direccion}', Telefono = '${Telefono}', Correo = '${Correo}'
                WHERE UUID = '${uuid}';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los datos de la solicitud',
                error
            );
        }
    }

    const updateRequestCount = async (cadenaConexion = '', uuid = '', CuentaContabilidad = '', CuentaWinCaja = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE SolicitudProveedores SET
                    CuentaContabilidad = '${CuentaContabilidad}', CuentaWinCaja = '${CuentaWinCaja}', Estatus = '${Estatus}'
                WHERE UUID = '${uuid}';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los datos de la solicitud',
                error
            );
        }
    }

    const updateRequestStatus = async (cadenaConexion = '', uuid = '', estatus = '', Articulo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE SolicitudProveedores SET
                    Estatus = '${estatus}'
                WHERE UUID = '${uuid}';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizar estatus', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar el estatus de la solicitud',
                error
            );
        }
    }

    const deleteRequest = async (cadenaConexion = '', uuid = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015; DELETE FROM SolicitudProveedores WHERE UUID = '${uuid}' AND Estatus = 'CANCELADO';`,
                QueryTypes.DELETE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de eliminar', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar la solicitud',
                error
            );
        }
    }

    return {
        getAllProviders,
        getAllRequestProviders,
        getRequestBySuc,
        getRequestProvider,
        createRequestProvider,
        updateRequestProvider,
        updateRequestCount,
        updateRequestStatus,
        deleteRequest,
    }
})();

module.exports = modelsProveedores;
