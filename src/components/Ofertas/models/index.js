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

    const getAllMasterOffersOf = async (cadenaConexion = '', sucursal = 'ZR') => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `SELECT * FROM maestroofertas WHERE sucursal = '${sucursal.toUpperCase()}'`,
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
                descripcion, fechaAlta, creadoPor
            } = bodyMaster
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
            `INSERT INTO maestroofertas VALUES(
                '${uuid}', '${sucursal}', ${status}, ${editable}, '${tipoOferta}', '${fechaInicio}',
                '${fechaFin}', '${descripcion}', '${fechaAlta}', '${creadoPor}', '${fechaAlta}',
                '${creadoPor}'
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

    const deleteMasterOffer = async (cadenaConexion = '', uuid) => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `DELETE FROM maestroofertas WHERE uuid = '${uuid}'`,
                QueryTypes.DELETE
            );
            dbpostgres.closeConexion();
            return createContentAssert('El maestro ofertas ha sido eliminado con exito', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar la oferta maestro',
                error
            );
        }
    }

    const getOffersByMasterOffer = async (cadenaConexion = '', uuid) => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `SELECT * FROM articulosofertas WHERE uuid_maestro = '${uuid}'`,
                QueryTypes.SELECT
            );
            dbpostgres.closeConexion();
            if (result[0].length === 0)
                return createContentAssert('Lista de articulos vacios', result[0])
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los articulos de una oferta',
                error
            );
        }
    }

    const createOffers = async (cadenaConexion = '', bodyMaster) => {
        try {
            const {
                uuid_maestro, articulo, nombre, costo, descripcion, precio, oferta,
                fechaAlta, creadoPor, fechaModificado, modificadoPor
            } = bodyMaster
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
            `INSERT INTO articulosofertas VALUES(
                '${uuid_maestro}', '${articulo}', '${nombre}', ${costo}, '${descripcion}', ${precio},
                ${oferta}, '${fechaAlta}', '${creadoPor}', '${fechaModificado}', '${modificadoPor}'
            )`,
                QueryTypes.INSERT
            );
            dbpostgres.closeConexion();
            return createContentAssert('Articulo agregado a la oferta', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar agregar un articulo a la oferta',
                error
            );
        }
    }

    const updateOffer = async (cadenaConexion = '', articulo, bodyArticulo) => {
        try {
            const {
                nombre, costo, descripcion, precio, oferta,
                fechaModificado, modificadoPor
            } = bodyArticulo
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                UPDATE articulosofertas
                SET
                    nombre = '${nombre}', costo = ${costo}, descripcion = '${descripcion}',
                    precio = ${precio}, oferta = ${oferta},
                    fechaModificado = '${fechaModificado}', modificadoPor= '${modificadoPor}'
                WHERE articulo = '${articulo}'
                `,
                QueryTypes.UPDATE
            );
            dbpostgres.closeConexion();
            return createContentAssert('Datos del articulo han sido actualizados', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar los datos del articulo',
                error
            );
        }
    }

    const deleteOffer = async (cadenaConexion = '', articulo) => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DELETE FROM articulosofertas
                WHERE uuid_maestro = '${uuid_maestro}' AND articulo = '${articulo}'
                `,
                QueryTypes.DELETE
            );
            dbpostgres.closeConexion();
            return createContentAssert('El articulo de la oferta ha sido eliminado con exito', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar el articulo de la oferta',
                error
            );
        }
    }

    return {
        getValidOffers,
        getAllMasterOffers,
        getAllMasterOffersOf,
        getMasterOffers,
        createMasterOffers,
        updateStatusMasterOffer,
        updateDataMasterOffer,
        deleteMasterOffer,
        getOffersByMasterOffer,
        createOffers,
        updateOffer,
        deleteOffer,
    }
})();

module.exports = modelsOfertas;
