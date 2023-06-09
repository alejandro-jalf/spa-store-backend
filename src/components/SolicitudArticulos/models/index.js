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
                CodigoBarra, Articulo, Nombre, IVA, Ieps, TazaIeps, TipoModelo, Marca, Presentacion,
                UnidadMedida, UnidadCompra, FactorCompra, UnidadVenta, FactorVenta, ActualizadoPor
            } = body;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                UPDATE SolicitudArticulos SET
                    CodigoBarra = '${CodigoBarra}', Articulo = '${Articulo}', Nombre = '${Nombre}', IVA = ${IVA}, Ieps = ${Ieps},
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

    const getPedidosBySucursal = async (cadenaConexion = '', database = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaPedidosSucursal @Sucursal = '${sucursal}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los pedidos por sucursal',
                error
            );
        }
    }

    const getListaArticulosByArticulo = async (cadenaConexion = '', database = '', articulo = '', folio = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaExistenciasAyudaArticulos @Busqueda = '${articulo}',
                    @Sucursal = '${sucursal}',
                    @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los articulos por articulo',
                error
            );
        }
    }

    const getListaArticulosByNombre = async (cadenaConexion = '', database = '', nombre = '', folio = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaExistenciasAyuda @Busqueda = '${nombre}',
                    @Sucursal = '${sucursal}',
                    @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los articulos por nombre',
                error
            );
        }
    }

    const getListaArticulosByDias = async (cadenaConexion = '', database = '', sucursal = '', folio = '', dias = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaExistenciasAyudaTop @Dias = ${dias},
                    @Sucursal = '${sucursal}',
                    @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los articulos por dia',
                error
            );
        }
    }

    const getReporteListaArticulos = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ReporteListaArticulos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener el reporte de lista de articulos',
                error
            );
        }
    }

    const getListaArticulos = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE VerListaArticulos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la lista de articulos',
                error
            );
        }
    }

    const addPedido = async (cadenaConexion = '', database = '', sucursal = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE AddPedidos @Sucursal = '${sucursal}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido creado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar agregar un nuevo pedido',
                error
            );
        }
    }

    const addArticle = async (cadenaConexion = '', database = 'SPASUC2021', articulo = '', body = {}) => {
        try {
            const { pedido, sucursal, PeCaja, PePieza } = body;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE RegistroPedidos @Articulo = '${articulo}',
                    @Sucursal = '${sucursal}', @Pedido = '${pedido}',
                    @PeCaja = ${PeCaja}, @PePieza = ${PePieza}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Articulo agregado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar agregar un articulo al pedido',
                error
            );
        }
    }

    const sendPedido = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE SendPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido enviado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar enviar el pedido',
                error
            );
        }
    }

    const enProcesoPedido = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE EnProcesoPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido en proceso', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar poner en proceso el pedido',
                error
            );
        }
    }

    const cancelPedido = async (cadenaConexion = '', database = '', sucursal = '', folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE CancelPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido Cancelado', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar cancelar el pedido',
                error
            );
        }
    }

    const atendidoPedido = async (cadenaConexion = '', database = '', sucursal = '', folio = '', entrada = '', salida = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE AtendidoPedidos @Sucursal = '${sucursal}', @Folio = ${folio},
                    @Entrada = '${entrada}', @Salida = '${salida}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Pedido atendido', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar atender el pedido',
                error
            );
        }
    }

    return {
        getSolicitudes,
        getArticuloSolicitado,
        createSolicitud,
        updateSolicitud,
    }
})();

module.exports = modelsPedidos;
