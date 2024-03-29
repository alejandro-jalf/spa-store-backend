const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError,
    getDeclareAlmacen,
    getDeclareTienda,
} = require('../../../utils');

const modelsOfertas = (() => {
    const getValidOffers = async (cadenaConexion = '', sucursal = 'ZR', now = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @FechaActual DATETIME = CAST('${now}' AS datetime);
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                SELECT
                    Suc = @Sucursal,
                    O.Articulo, O.CodigoBarras, O.Nombre, 
                    UtilidadOferta = 1 - (C.UltimoCostoNeto/(Precio1IVAUV - Descuento)),
                    OfertaValida = CASE WHEN (1 - (C.UltimoCostoNeto/(Precio1IVAUV - Descuento))) < 0.1 THEN 'NO' ELSE 'SI' END,
                    Descuento, UltimoCosto = C.UltimoCostoNeto, Precio1IVAUV,
                    UtilidadVenta = 1 - (UltimoCostoNeto/Precio1IVAUV),
                    Precio1Valido = CASE WHEN (1 - (C.UltimoCostoNeto/Precio1IVAUV)) < 0.1 THEN 'NO' ELSE 'SI' END,
                    PrecioOferta = Precio1IVAUV - Descuento,
                    FechaInicial, FechaFinal,OfertaCaduca,
                    O.Disponible, O.Limite, O.Tienda, O.NivelPrecio, O.LimiteXVenta
                FROM QvOfertas AS O
                LEFT JOIN QVListaprecioConCosto AS C ON O.Articulo = C.Articulo
                WHERE (
                        ( O.OfertaCaduca = 'NO' AND O.Disponible > 0)
                        OR FechaFinal >= @FechaActual
                    )
                    AND OfertaBaja = 'NO'
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

    const getTimedOffersByDate = async (cadenaConexion = '', sucursal = 'ZR', dateInit = '', dateEnd = '', articles = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @FechaInicial DATETIME = CAST('${dateInit}' AS DATETIME);
                DECLARE @FechaFinal DATETIME = CAST('${dateEnd}' AS DATETIME);
                ${getDeclareTienda()}

                SELECT
                    Suc = @Sucursal,
                    Articulo, CodigoBarras, Nombre, Descuento,
                    FechaInicial, FechaFinal, OfertaCaduca,
                    Disponible, Limite, Tienda, NivelPrecio
                FROM QvOfertas
                WHERE CONVERT(nvarchar, FechaFinal, 103) = CONVERT(nvarchar, @FechaFinal, 103)
                    AND CONVERT(nvarchar, FechaInicial, 103) = CONVERT(nvarchar, @FechaInicial, 103)
                    AND Tienda = @Tienda
                    AND Articulo IN (
                        ${articles}
                    )
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de la verificacion de articulos ofertados', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar verificar los articulos ofertados por fecha',
                error
            );
        }
    }

    const getDataArticlesWithOffers = async (cadenaConexion = '', sucursal = 'ZR', date = '', articles = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}
                DECLARE @FechaActual DATETIME = CAST('${date}' AS datetime);

                WITH DataArticles(
                    Articulo, Precio1IVAUV, UltimoCostoNeto
                )
                AS (
                    SELECT
                        Articulo, Precio1IVAUV, UltimoCostoNeto
                    FROM QVListaPrecioConCosto
                    WHERE Tienda = @Tienda AND Almacen = @Almacen
                        AND Articulo IN (
                            ${articles}
                        )
                ),
                ArticulosConOfertas(
                    Articulo, OfertaCaduca, FechaInicial, FechaFinal
                ) AS (
                    SELECT
                        Articulo, OfertaCaduca, FechaInicial, FechaFinal
                    FROM QVOfertas
                    WHERE (OfertaCaduca = 'NO' OR FechaFinal >= @FechaActual) AND Tienda = @Tienda AND OfertaBaja = 'NO'
                )

                SELECT
                    D.Articulo, D.Precio1IVAUV, D.UltimoCostoNeto, O.FechaInicial, O.FechaFinal, O.OfertaCaduca
                FROM DataArticles AS D
                LEFT JOIN ArticulosConOfertas AS O ON D.Articulo = O.Articulo
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de articulos encontrados', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                `Fallo la conexion con base de datos en "${sucursal}" al obtener datos de articulos`,
                error
            );
        }
    }

    // @Deprecated
    const getValidationArticlesByUuuiMaster = async (
        cadenaConexion = '', sucursal = 'ZR', now = '', fechaInicio = '',
        fechaFin = '', uuid_master = '', hostOrigin = '', hostDatabase = ''
    ) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @FechaActual DATETIME = CAST('${now}' AS datetime);
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @FechaInicial DATETIME = CAST('${fechaInicio} 12:00:00.000' AS datetime);
                DECLARE @FechaFinal DATETIME = CAST('${fechaFin} 12:00:00.000' AS datetime);
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                WITH ArticulosEnOfertas(
                    Articulo, Nombre, Precio1IVAUV, Oferta, UltimoCosto, UtilidadOferta, OfertaValida, OfertaMayor
                )
                AS (
                    SELECT
                        A.Articulo, A.Nombre, L.Precio1IVAUV, A.oferta,
                        UltimoCosto = L.UltimoCostoNeto, UtilidadOferta = 1 - (L.UltimoCostoNeto / A.oferta),
                        OfertaValida = CASE WHEN (1 - (L.UltimoCostoNeto / A.oferta)) < 0.1 THEN 'NO' ELSE 'SI' END,
                        OfertaMayor = CASE WHEN (L.Precio1IVAUV - A.oferta) <= 0.0000001 THEN 'NO' ELSE 'SI' END
                    FROM ${hostOrigin}[CA2015].dbo.ArticulosOfertas AS A
                    LEFT JOIN ${hostDatabase}.dbo.QVListaPrecioConCosto AS L ON A.Articulo = L.Articulo COLLATE Modern_Spanish_CI_AS
                    WHERE A.uuid_maestro = '${uuid_master}'
                        AND L.Tienda = @Tienda AND L.Almacen = @Almacen
                ),
                ArticulosConOfertas(
                    Articulo, OfertaCaduca, FechaInicial, FechaFinal, OfertaFechaVigente
                ) AS (
                    SELECT
                        Articulo, OfertaCaduca, FechaInicial, FechaFinal,
                        OfertaFechaVigente = CASE WHEN FechaFinal >= @FechaActual THEN 'SI' ELSE 'NO' END
                    FROM ${hostDatabase}.dbo.QVOfertas
                    WHERE OfertaCaduca = 'NO'
                        OR FechaFinal >= @FechaActual
                        AND Tienda = @Tienda
                )

                SELECT
                    A.*, O.OfertaCaduca, O.OfertaFechaVigente, O.FechaInicial, O.FechaFinal
                FROM ArticulosEnOfertas AS A
                LEFT JOIN ArticulosConOfertas AS O ON O.Articulo COLLATE Modern_Spanish_CI_AS = A.Articulo
                AND @FechaInicial >= O.FechaInicial AND @FechaFinal <= O.FechaFinal
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
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                SELECT 
                    Articulo,
                    CodigoBarras,
                    Nombre,
                    Descripcion,
                    Precio1IVAUV,
                    UltimoCosto = UltimoCostoNeto,
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
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                SELECT 
                    Articulo,
                    CodigoBarras,
                    Nombre,
                    Descripcion,
                    Precio1IVAUV,
                    UltimoCosto = UltimoCostoNeto,
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

    const getAllMasterOffers = async (cadenaConexion = '', limit) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                SELECT TOP ${limit}
                    M.uuid, M.sucursal, M.estatus, M.editable, M.tipoOferta, M.fechaInicio, M.fechaFin, M.descripcion, M.fechaAlta,
                    M.creadoPor, M.fechaModificado, M.modificadoPor,
                    Articulos = COUNT(*)
                FROM maestroofertas AS M
                LEFT JOIN ArticulosOfertas AS A ON M.uuid = A.uuid_maestro
                GROUP BY M.uuid, M.sucursal, M.estatus, M.editable, M.tipoOferta, M.fechaInicio, M.fechaFin, M.descripcion, M.fechaAlta,
                    M.creadoPor, M.fechaModificado, M.modificadoPor
                ORDER BY M.fechaAlta DESC;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos en Zaragoza al intentar obtener las ofertas maestro',
                error
            );
        }
    }

    const getAllMasterOffersOf = async (cadenaConexion = '', sucursal = 'ZR', limit) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                SELECT TOP ${limit}
                    M.uuid, M.sucursal, M.estatus, M.editable, M.tipoOferta, M.fechaInicio, M.fechaFin, M.descripcion, M.fechaAlta,
                    M.creadoPor, M.fechaModificado, M.modificadoPor,
                    Articulos = COUNT(*)
                FROM maestroofertas AS M
                LEFT JOIN ArticulosOfertas AS A ON M.uuid = A.uuid_maestro
                WHERE M.sucursal = '${sucursal.toUpperCase()}'
                GROUP BY M.uuid, M.sucursal, M.estatus, M.editable, M.tipoOferta, M.fechaInicio, M.fechaFin, M.descripcion, M.fechaAlta,
                    M.creadoPor, M.fechaModificado, M.modificadoPor
                ORDER BY M.fechaAlta DESC;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos en Zaragoza al intentar obtener las ofertas maestro de una sucursal determinada',
                error
            );
        }
    }

    const getMasterOffers = async (cadenaConexion = '', uuid) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015; SELECT * FROM maestroofertas WHERE uuid = '${uuid}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la oferta por uuid',
                error
            );
        }
    }

    const createOffersInWincaja = async (cadenaConexion = '', bodyOffers) => {
        try {
            const { sucursal, fechaInicio, fechaFin, articulos } = bodyOffers;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @FechaInicial DATETIME = CAST('${fechaInicio}' AS smalldatetime);
                DECLARE @FechaFinal DATETIME = CAST('${fechaFin}' AS smalldatetime);
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Consecutivo INT = (SELECT TOP 1 Consecutivo  FROM Ofertas ORDER BY Consecutivo DESC);
                INSERT INTO Ofertas(
                    Consecutivo, ID_Oferta,
                    Articulo, Descuento, Porcentaje, NivelPrecio, FechaInicial, FechaFinal, Limite, Remanente,
                    FechaUltimaModificacion, FechaAlta, NoCaduca, Tienda, AntesDeIVA, LimiteXVenta, TipoVenta
                ) VALUES ${articulos};`,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Se ha creado una nueva oferta en wincaja', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al crear una nueva oferta en wincaja',
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
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
            `USE CA2015; INSERT INTO maestroofertas (
                uuid, sucursal, estatus, editable, tipoOferta, fechaInicio, fechaFin, descripcion, fechaAlta,
                creadoPor, fechaModificado, modificadoPor
            ) VALUES (
                '${uuid}', '${sucursal}', ${status}, 1, '${tipoOferta}', CAST('${fechaInicio}' AS DATETIME),
                CAST('${fechaFin}' AS DATETIME), '${descripcion}', getdate(), '${creadoPor}', getdate(),
                '${creadoPor}'
            )`,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Nueva oferta maestro creado', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al crear una nueva oferta maestro',
                error
            );
        }
    }

    const changePreciosByOffer = async (cadenaConexion = '', sucursal, articles = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareTienda()}
                
                UPDATE PreciosT SET CantidadAutomatico = 0
                WHERE TipoTienda = @Tienda
                    AND CantidadAutomatico > 0
                    AND Articulo IN (${articles})`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Precios Actualizados', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar modificar los precios por oferta',
                error
            );
        }
    }

    const updateStatusMasterOffer = async (cadenaConexion = '', uuid, bodyMaster, complementUpdated = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                UPDATE maestroofertas 
                SET
                    estatus = ${bodyMaster.status},
                    ${complementUpdated}
                    fechamodificado = getdate(),
                    modificadopor = '${bodyMaster.modificadoPor}'
                WHERE uuid = '${uuid}'`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
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
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE maestroofertas
                SET
                    estatus = ${status}, Editable = ${editable}, TipoOferta = '${tipoOferta}',
                    FechaInicio = CAST('${fechaInicio}' AS DATETIME), FechaFin = CAST('${fechaFin}' AS DATETIME), Descripcion = '${descripcion}',
                    fechaModificado = getdate()
                WHERE uuid = '${uuid}'
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
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
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                DELETE FROM articulosofertas
                WHERE uuid_maestro = '${uuid}';
                DELETE FROM maestroofertas WHERE uuid = '${uuid}' AND sucursal = '${sucursal.toUpperCase()}';
                `,
                QueryTypes.DELETE
            );
            dbmssql.closeConexion();
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

    // @Deprecated
    const getOffersByMasterOffer = async (cadenaConexion = '', sucursal, uuid = '', hostOrigin = '', hostDatabase = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                SELECT
                    O.*, PrecioActual = L.Precio1IVAUV, Descuento = L.Precio1IVAUV - O.oferta
                FROM ${hostOrigin}[CA2015].dbo.articulosofertas AS O
                LEFT JOIN ${hostDatabase}.dbo.QVListaprecioConCosto AS L ON  L.Articulo COLLATE Modern_Spanish_CI_AS = O.articulo 
                WHERE O.uuid_maestro = '${uuid}'
                    AND L.Tienda = @Tienda
                    AND L.Almacen = @Almacen
                ORDER BY fechaAlta DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
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

    const getOnlyOffersByMasterOffer = async (cadenaConexion = '', sucursal, uuid = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                ${getDeclareAlmacen()}
                ${getDeclareTienda()}

                SELECT
                    *
                FROM [CA2015].dbo.articulosofertas
                WHERE uuid_maestro = '${uuid}'
                ORDER BY fechaAlta DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            if (result[0].length === 0)
                return createContentAssert('Lista de articulos vacios', result[0])
            return createContentAssert('Articulos cargados', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos en "ZR" al intentar obtener los articulos de una oferta',
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
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
            `USE CA2015; INSERT INTO articulosofertas VALUES(
                '${uuid_maestro}', '${articulo}', '${nombre}', ${costo}, '${descripcion}', ${precio},
                ${oferta}, getdate(), '${creadoPor}', getdate(), '${modificadoPor}'
            )`,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Articulo agregado a la oferta', result);
        } catch (error) {
            console.log(error.parent.message);
            if (error.parent.message !== undefined) {
                const expresion = /.*Violation of PRIMARY KEY constraint.*/g
                const validation = expresion.test(error.parent.message);
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
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE articulosofertas
                SET
                    nombre = '${nombre}', costo = ${costo}, descripcion = '${descripcion}',
                    precio = ${precio}, oferta = ${oferta},
                    fechaModificado = getdate(), modificadoPor= '${modificadoPor}'
                WHERE articulo = '${articulo}'
                    AND uuid_maestro = '${uuidmaster}'
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
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
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                DELETE FROM articulosofertas
                WHERE uuid_maestro = '${uuid_maestro}' AND articulo = '${articulo}'
                `,
                QueryTypes.DELETE
            );
            dbmssql.closeConexion();
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

    const deleteOffersOld = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                DECLARE @Now datetime = GETDATE();

                WITH MasterOLd(uuid)
                AS (
                    SELECT uuid FROM MaestroOfertas
                    WHERE estatus = 4 OR estatus = 0
                        AND DATEDIFF(DAY, fechaAlta, @Now) > 15
                )

                DELETE FROM ArticulosOfertas WHERE uuid_maestro IN (SELECT * FROM MasterOLd);
                DELETE FROM MaestroOfertas WHERE estatus = 4 OR estatus = 0 AND DATEDIFF(DAY, fechaAlta, @Now) > 15;
                `,
                QueryTypes.DELETE
            );
            dbmssql.closeConexion();
            return createContentAssert('Ofertas antiguas eliminadas', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar las ofertas antiguas',
                error
            );
        }
    }

    return {
        getValidationArticlesByUuuiMaster,
        getDetailsArticleByArticle,
        getDetailsArticleByName,
        getTimedOffersByDate,
        getDataArticlesWithOffers,
        getValidOffers,
        getAllMasterOffers,
        getAllMasterOffersOf,
        getMasterOffers,
        createMasterOffers,
        changePreciosByOffer,
        updateStatusMasterOffer,
        updateDataMasterOffer,
        deleteMasterOffer,
        getOffersByMasterOffer,
        getOnlyOffersByMasterOffer,
        createOffersInWincaja,
        createOffers,
        updateOffer,
        deleteOffer,
        deleteOffersOld,
    }
})();

module.exports = modelsOfertas;
