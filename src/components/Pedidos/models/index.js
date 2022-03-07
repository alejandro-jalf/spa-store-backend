const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsPedidos = (() => {
    const getPedidosEnBodega = async (cadenaConexion = '', database = 'SPASUC2021') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaPedidosBodega`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los pedidos en bodega',
                error
            );
        }
    }

    const getPedidosBySucursal = async (cadenaConexion = '', sucursal = '', database = 'SPASUC2021') => {
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

    const getListaArticulosByArticulo = async (cadenaConexion = '', articulo = '', folio = '', sucursal = '', database = 'SPASUC2021') => {
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

    const getListaArticulosByNombre = async (cadenaConexion = '', nombre = '', folio = '', sucursal = '', database = 'SPASUC2021') => {
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

    const getListaArticulosByDias = async (cadenaConexion = '', dias = '', folio = '', sucursal = '', database = 'SPASUC2021') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE ListaExistenciasAyuda @Dias = ${dias},
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

    const getReporteListaArticulos = async (cadenaConexion = '', folio = '', sucursal = '', database = 'SPASUC2021') => {
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

    const getListaArticulos = async (cadenaConexion = '', folio = '', sucursal = '', database = 'SPASUC2021') => {
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

    const addPedido = async (cadenaConexion = '', sucursal = '', database = 'SPASUC2021') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE AddPedidos @Sucursal = '${sucursal}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar agregar un nuevo pedido',
                error
            );
        }
    }

    const addArticle = async (cadenaConexion = '', articulo = '', body = {}, database = 'SPASUC2021') => {
        try {
            const { Pedido, Sucursal, PeCaja, PePieza } = body;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE RegistroPedidos @Articulo = '${articulo}',
                    @Sucursal = '${Sucursal}', @Pedido = '${Pedido}',
                    @PeCaja = ${PeCaja}, @PePieza = ${PePieza}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar agregar un articulo al pedido',
                error
            );
        }
    }

    const sendPedido = async (cadenaConexion = '', sucursal = '', folio = '', database = 'SPASUC2021') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE SendPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar enviar el pedido',
                error
            );
        }
    }

    const enProcesoPedido = async (cadenaConexion = '', sucursal = '', folio = '', database = 'SPASUC2021') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE EnProcesoPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar poner en proceso el pedido',
                error
            );
        }
    }

    const cancelPedido = async (cadenaConexion = '', sucursal = '', folio = '', database = 'SPASUC2021') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE CancelPedidos @Sucursal = '${sucursal}', @Folio = ${folio}`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar cancelar el pedido',
                error
            );
        }
    }

    const atendidoPedido = async (cadenaConexion = '', sucursal = '', folio = '', entrada = '', salida = '', database = 'SPASUC2021') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE ${database}
                EXECUTE AtendidoPedidos @Sucursal = '${sucursal}', @Folio = ${folio},
                    @Entrada = '${entrada}', @Salida = '${salida}'`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar atender el pedido',
                error
            );
        }
    }

    return {
        getPedidosEnBodega,
        getPedidosBySucursal,
        getListaArticulosByArticulo,
        getListaArticulosByNombre,
        getListaArticulosByDias,
        getReporteListaArticulos,
        getListaArticulos,
        addPedido,
        addArticle,
        sendPedido,
        enProcesoPedido,
        cancelPedido,
        atendidoPedido,
    }
})();

module.exports = modelsPedidos;