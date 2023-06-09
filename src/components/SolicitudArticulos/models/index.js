const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsPedidos = (() => {
    const getSolicitudes = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'SELECT TOP 200 * FROM SolicitudArticulos;',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de solicitudes', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de solicitudes',
                error
            );
        }
    }

    const getArticuloSolicitado = async (cadenaConexion = '', uuid) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                SELECT * FROM SolicitudArticulos WHERE UUID = '${uuid}}';
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

    const createSolicitud = async (cadenaConexion = '', sucursal= '', CreadoPor = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Consecutivo int = (SELECT TOP 1 Consecutivo FROM SolicitudArticulos WHERE Sucursal = '${sucursal}' ORDER BY Consecutivo DESC)
                DECLARE @NewConsecutivo int = ISNULL(@Consecutivo, 0);

                INSERT INTO SolicitudArticulos(
                    Consecutivo, Sucursal, FechaCreado, CodigoBarra, Articulo, Nombre, IVA, Ieps, TazaIeps, TipoModelo, Marca, Presentacion,
                    UnidadMedida, UnidadCompra, FactorCompra, UnidadVenta, FactorVenta, CreadoPor, FechaActualizado, ActualizadoPor
                ) VALUES (
                    @NewConsecutivo + 1, '${sucursal}', GETDATE(), '', '', '', 0, 0, 0, '', '', 0, '', '', 0, '', 0, '${CreadoPor}', GETDATE(), '${CreadoPor}'
                );
                SELECT *  FROM SolicitudArticulos WHERE Sucursal = '${sucursal}' AND Consecutivo = @NewConsecutivo + 1;
                `,
                QueryTypes.UPSERT
            );
            dbmssql.closeConexion();
            console.log(result);
            return createContentAssert('Datos de solicitud nueva', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener el Crear solicitud',
                error
            );
        }
    }

    const updateSolicitud = async (cadenaConexion = '', uuid = '', body = {}) => {
        try {
            const {
                CodigoBarra, Nombre, IVA, Ieps, TazaIeps, TipoModelo, Marca, Presentacion,
                UnidadMedida, UnidadCompra, FactorCompra, UnidadVenta, FactorVenta, ActualizadoPor
            } = body;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                UPDATE SolicitudArticulos SET
                    CodigoBarra = '${CodigoBarra}', Nombre = '${Nombre}', IVA = ${IVA}, Ieps = ${Ieps},
                    TazaIeps = ${TazaIeps}, TipoModelo = '${TipoModelo}', Marca = '${Marca}', Presentacion = ${Presentacion},
                    UnidadMedida = '${UnidadMedida}', UnidadCompra = '${UnidadCompra}', FactorCompra = ${FactorCompra},
                    UnidadVenta = '${UnidadVenta}', FactorVenta = ${FactorVenta}, FechaActualizado = GETDATE(),
                    ActualizadoPor  = '${ActualizadoPor}'
                WHERE UUID = '${uuid}';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los datos de la solicitud',
                error
            );
        }
    }

    const updateStatus = async (cadenaConexion = '', uuid = '', estatus = '', Articulo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                UPDATE SolicitudArticulos SET
                    Estatus = '${estatus}', Articulo = '${Articulo}'
                WHERE UUID = '${uuid}';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizar estatus', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar el estatus de la solicitud',
                error
            );
        }
    }

    const deleteSolicitud = async (cadenaConexion = '', uuid = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `DELTE FROM SolicitudArticulos WHERE UUID = '${uuid}' AND Estatus = 'CANCELADO';`,
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
        getSolicitudes,
        getArticuloSolicitado,
        createSolicitud,
        updateSolicitud,
        updateStatus,
        deleteSolicitud,
    }
})();

module.exports = modelsPedidos;
