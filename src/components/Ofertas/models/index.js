const { QueryTypes } = require('sequelize');
const { dbmssql, dbpostgres } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsOfertas = (() => {
    const getValidOffers = async (cadenaConexion = '', sucursal = 'ZR', now = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @FechaActual DATETIME = CAST('${now}' AS datetime)
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}'
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'OU' THEN 19 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'OU' THEN 5 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END

                SELECT
                    Suc = @Sucursal,
                    O.Articulo, O.CodigoBarras, O.Nombre, 
                    UtilidadOferta = 1 - (C.UltimoCostoNeto/(Precio1IVAUV - Descuento)),
                    OfertaValida = CASE WHEN (1 - (C.UltimoCostoNeto/(Precio1IVAUV - Descuento))) < 0.1 THEN 'NO' ELSE 'SI' END,
                    Descuento, C.UltimoCostoNeto, Precio1IVAUV,
                    UtilidadVenta = 1 - (UltimoCostoNeto/Precio1IVAUV),
                    Precio1Valido = CASE WHEN (1 - (C.UltimoCostoNeto/Precio1IVAUV)) < 0.1 THEN 'NO' ELSE 'SI' END,
                    PrecioOferta = Precio1IVAUV - Descuento,
                    FechaInicial, FechaFinal,OfertaCaduca
                FROM QvOfertas AS O
                LEFT JOIN QVListaprecioConCosto AS C ON O.Articulo = C.Articulo
                WHERE FechaFinal >= @FechaActual
                    AND C.Tienda = @Tienda AND C.Almacen = @Almacen
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar verificar las ofertas',
                error
            );
        }
    }

    const getAllMasterOffers = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'SELECT * FROM maestroofertas',
                QueryTypes.SELECT
            );
            dbpostgres.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las ofertas maestro',
                error
            );
        }
    }

    const getMasterOffers = async (cadenaConexion = '', uuid) => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `SELECT * FROM maestroofertas WHERE uuid = '${uuid}'`,
                QueryTypes.SELECT
            );
            dbpostgres.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la oferta por uuid',
                error
            );
        }
    }

    const createMasterOffers = async (cadenaConexion = '', bodyMaster) => {
        try {
            const {
                uuid, sucursal, status, editable, tipoOferta, fechaInicio, fechaFin,
                descripcion, fechaAlta, creadoPor, fechaModificado, modificadoPor
            } = bodyMaster
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
            `INSERT INTO maestroofertas VALUES(
                '${uuid}', '${sucursal}', ${status}, ${editable}, '${tipoOferta}', '${fechaInicio}',
                '${fechaFin}', '${descripcion}', '${fechaAlta}', '${creadoPor}', '${fechaModificado}',
                '${modificadoPor}'
            )`,
                QueryTypes.INSERT
            );
            dbpostgres.closeConexion();
            return createContentAssert('Nueva oferta maestro creado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al crear una nueva oferta maestro',
                error
            );
        }
    }

    const updateStatusMasterOffer = async (cadenaConexion = '', uuid, status) => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `UPDATE maestroofertas SET status = ${status} WHERE uuid = '${uuid}'`,
                QueryTypes.UPDATE
            );
            dbpostgres.closeConexion();
            return createContentAssert('Estatus de maestro oferta fue actualizado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la oferta por uuid',
                error
            );
        }
    }

    const updateDataMasterOffer = async (cadenaConexion = '', uuid, bodyMaster) => {
        try {
            const {
                status, editable, tipoOferta, fechaInicio, fechaFin,
                descripcion, fechaModificado, modificadoPor
            } = bodyMaster
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                UPDATE maestroofertas
                SET
                    status = ${status}, Editable = ${editable}, TipoOferta = '${tipoOferta}',
                    FechaInicio = '${fechaInicio}', FechaFin = '${fechaFin}', Descripcion = '${descripcion}',
                    fechaModificado = '${fechaModificado}', modificadoPor= '${modificadoPor}'
                WHERE uuid = '${uuid}'
                `,
                QueryTypes.UPDATE
            );
            dbpostgres.closeConexion();
            return createContentAssert('Datos de la maestro oferta ha sido actualizado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar los datos de la oferta maestro',
                error
            );
        }
    }

    const deleteMasterOffer = async (cadenaConexion = '', uuid, bodyMaster) => {
        try {
            const {
                status, editable, tipoOferta, fechaInicio, fechaFin,
                descripcion, fechaModificado, modificadoPor
            } = bodyMaster
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                UPDATE maestroofertas
                SET
                    status = ${status}, Editable = ${editable}, TipoOferta = '${tipoOferta}',
                    FechaInicio = '${fechaInicio}', FechaFin = '${fechaFin}', Descripcion = '${descripcion}',
                    fechaModificado = '${fechaModificado}', modificadoPor= '${modificadoPor}'
                WHERE uuid = '${uuid}'
                `,
                QueryTypes.UPDATE
            );
            dbpostgres.closeConexion();
            return createContentAssert('Datos de la maestro oferta ha sido actualizado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar los datos de la oferta maestro',
                error
            );
        }
    }

    return {
        getValidOffers,
        getAllMasterOffers,
        getMasterOffers,
        createMasterOffers,
        updateStatusMasterOffer,
        updateDataMasterOffer,
    }
})();

module.exports = modelsOfertas;
