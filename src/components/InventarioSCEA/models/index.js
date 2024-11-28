const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsPedidos = (() => {
    const getAllDepartamentos = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM Departamentos',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de departamentos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de departamentos',
                error
            );
        }
    }

    const getDepartamento = async (cadenaConexion = '', codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT * FROM Departamentos WHERE Codigo = '${codigo}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de Departamentos por codigo', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de Departamentos por codigo',
                error
            );
        }
    }

    const getAllSucursales = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM Sucursales',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de Sucursales', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de Sucursales',
                error
            );
        }
    }

    const getSucursal = async (cadenaConexion = '', codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT * FROM Sucursales WHERE Codigo = '${codigo}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de Sucursales por codigo', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de Sucursales por codigo',
                error
            );
        }
    }

    const getAllTiposEquipos = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM TiposEquipos',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de TiposEquipos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de TiposEquipos',
                error
            );
        }
    }

    const getTiposEquipos = async (cadenaConexion = '', codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT * FROM TiposEquipos WHERE Codigo = '${codigo}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de TiposEquipos por codigo', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de TiposEquipos por codigo',
                error
            );
        }
    }

    const getAllFichasTecnicas = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM FichasTecnicas',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de FichasTecnicas', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de FichasTecnicas',
                error
            );
        }
    }

    const getFichasTecnicas = async (cadenaConexion = '', Folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT * FROM FichasTecnicas WHERE Folio = '${Folio}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de FichasTecnicas por Folio', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de FichasTecnicas por Folio',
                error
            );
        }
    }

    const createSolicitud = async (cadenaConexion = '', sucursal= '', CreadoPor = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                DECLARE @Consecutivo int = (SELECT TOP 1 Consecutivo FROM SolicitudArticulos WHERE Sucursal = '${sucursal}' ORDER BY Consecutivo DESC)
                DECLARE @NewConsecutivo int = ISNULL(@Consecutivo, 0);

                INSERT INTO SolicitudArticulos(
                    Consecutivo, Sucursal, FechaCreado, CodigoBarra, Articulo, Nombre, IVA, Ieps, TazaIeps, TipoModelo, Marca, Presentacion,
                    UnidadCompra, FactorCompra, UnidadVenta, FactorVenta, CreadoPor, FechaActualizado, Estatus, ActualizadoPor
                ) VALUES (
                    @NewConsecutivo + 1, '${sucursal}', GETDATE(), '', '', '', 0, 0, 0, '', '', '', '', 0, '', 0, '${CreadoPor}', GETDATE(), 'EN SUCURSAL', '${CreadoPor}'
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
                USE CA2015;
                UPDATE SolicitudArticulos SET
                    CodigoBarra = '${CodigoBarra}', Nombre = '${Nombre}', IVA = ${IVA}, Ieps = ${Ieps},
                    TazaIeps = ${TazaIeps}, TipoModelo = '${TipoModelo}', Marca = '${Marca}',
                    Presentacion = '${Presentacion}', UnidadCompra = '${UnidadCompra}', FactorCompra = ${FactorCompra},
                    UnidadVenta = '${UnidadVenta}', FactorVenta = ${FactorVenta}, FechaActualizado = GETDATE(),
                    ActualizadoPor  = '${ActualizadoPor}'
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

    const deleteSolicitud = async (cadenaConexion = '', uuid = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015; DELETE FROM SolicitudArticulos WHERE UUID = '${uuid}' AND Estatus = 'CANCELADO';`,
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
        getAllDepartamentos,
        getDepartamento,
        getAllSucursales,
        getSucursal,
        getAllTiposEquipos,
        getTiposEquipos,
        getAllFichasTecnicas,
        getFichasTecnicas,
    }
})();

module.exports = modelsPedidos;
