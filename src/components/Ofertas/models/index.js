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
                DECLARE @FechaActual DATETIME = CAST('${now}' AS datetime);
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;

                SELECT
                    Suc = @Sucursal,
                    O.Articulo, O.CodigoBarras, O.Nombre, 
                    UtilidadOferta = 1 - (C.UltimoCosto/(Precio1IVAUV - Descuento)),
                    OfertaValida = CASE WHEN (1 - (C.UltimoCosto/(Precio1IVAUV - Descuento))) < 0.1 THEN 'NO' ELSE 'SI' END,
                    Descuento, C.UltimoCosto, Precio1IVAUV,
                    UtilidadVenta = 1 - (UltimoCosto/Precio1IVAUV),
                    Precio1Valido = CASE WHEN (1 - (C.UltimoCosto/Precio1IVAUV)) < 0.1 THEN 'NO' ELSE 'SI' END,
                    PrecioOferta = Precio1IVAUV - Descuento,
                    FechaInicial, FechaFinal,OfertaCaduca,
                    O.Disponible, O.Limite, O.Tienda, O.NivelPrecio
                FROM QvOfertas AS O
                LEFT JOIN QVListaprecioConCosto AS C ON O.Articulo = C.Articulo
                WHERE (
                        ( O.OfertaCaduca = 'NO' AND O.Disponible > 0)
                        OR FechaFinal >= @FechaActual
                    )
                    AND C.Tienda = @Tienda AND C.Almacen = @Almacen
                    AND O.Tienda = @Tienda
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

    const getDetailsArticleByArticle = async (cadenaConexion = '', sucursal = 'ZR', Articulo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;

                SELECT 
                    Articulo,
                    CodigoBarras,
                    Nombre,
                    Descripcion,
                    Precio1IVAUV,
                    UltimoCosto,
                    ExistenciaActualRegular,
                    ExistenciaActualUC,
                    Relacion = CAST(CAST(FactorCompra AS int) AS nvarchar) + UnidadCompra + ' / ' + CAST(CAST(FactorVenta AS int) AS nvarchar) + UnidadVenta
                FROM
                    QVListaprecioConCosto
                WHERE Tienda = @Tienda AND Almacen = @Almacen AND (Articulo = '${Articulo}' OR CodigoBarras = '${Articulo}');
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener datos del articulo',
                error
            );
        }
    }

    const getDetailsArticleByName = async (cadenaConexion = '', sucursal = 'ZR', name = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;

                SELECT 
                    Articulo,
                    CodigoBarras,
                    Nombre,
                    Descripcion,
                    Precio1IVAUV,
                    UltimoCosto,
                    ExistenciaActualRegular,
                    ExistenciaActualUC,
                    Relacion = CAST(CAST(FactorCompra AS int) AS nvarchar) + UnidadCompra + ' / ' + CAST(CAST(FactorVenta AS int) AS nvarchar) + UnidadVenta
                FROM
                    QVListaprecioConCosto
                WHERE Tienda = @Tienda AND Almacen = @Almacen AND Nombre LIKE '${name}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener datos del articulo',
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
                'Fallo la conexion con base de datos al intentar obtener las ofertas maestro de una sucursal determinada',
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

    const updateStatusMasterOffer = async (cadenaConexion = '', uuid, bodyMaster) => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `UPDATE maestroofertas 
                SET
                    status = ${bodyMaster.status},
                    fechamodificado = '${bodyMaster.fechamodificado}',
                    modificadopor = '${bodyMaster.modificadoPor}'
                WHERE uuid = '${uuid}'`,
                QueryTypes.UPDATE
            );
            dbpostgres.closeConexion();
            return createContentAssert('Estatus de maestro oferta fue actualizado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar el estatus de la oferta',
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

    const deleteMasterOffer = async (cadenaConexion = '', uuid, sucursal = '') => {
        try {
            const accessToDataBase = dbpostgres.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `DELETE FROM maestroofertas WHERE uuid = '${uuid}' AND sucursal = '${sucursal.toUpperCase()}'`,
                QueryTypes.DELETE
            );
            dbpostgres.closeConexion();
            if (result.rowCount) {
                if (result.rowCount === 0) 
                    return createContentError('No se pudo eliminar la oferta maestro', result);
                else if (result.rowCount === 1)
                    return createContentAssert('El maestro ofertas ha sido eliminado con exito', result);
                else if (result.rowCount > 1)
                    return createContentError('Error fatal, se eliminaron ' + result.rowCount + ' ofertas maestro', result);
            } else
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

    const createOffers = async (cadenaConexion = '', bodyArticle) => {
        try {
            const {
                uuid_maestro, articulo, nombre, costo, descripcion, precio, oferta,
                fechaAlta, creadoPor, fechaModificado, modificadoPor
            } = bodyArticle
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
            if (error.parent.detail !== undefined) {
                const expresion = /.*already exists.*/g
                const validation = expresion.test(error.parent.detail);
                if (validation)
                    return createContentError('El articulo ya existe en esta lista de ofertas');
                else
                    return createContentError(
                        'Fallo la conexion con base de datos al intentar agregar un articulo a la oferta',
                        error
                    );
            } else
                return createContentError(
                    'Fallo la conexion con base de datos al intentar agregar un articulo a la oferta',
                    error
                );
        }
    }

    const updateOffer = async (cadenaConexion = '', articulo, uuidmaster, bodyArticulo) => {
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
                    AND uuid_maestro = '${uuidmaster}'
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

    const deleteOffer = async (cadenaConexion = '', articulo = '', uuid_maestro = '') => {
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
            if (typeof result[1] !== 'undefined' && typeof result[1].rowCount !== 'undefined') {
                if (result[1].rowCount === 0) 
                    return createContentError('No se pudo eliminar el articulo de la oferta', result);
                else if (result[1].rowCount === 1)
                    return createContentAssert('El articulo ha sido eliminado con exito', result);
                else if (result[1].rowCount > 1)
                    return createContentError('Error fatal, se eliminaron ' + result[1].rowCount + ' articulos', result);
            } else
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
        getDetailsArticleByArticle,
        getDetailsArticleByName,
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
