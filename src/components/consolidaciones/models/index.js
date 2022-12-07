const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsConsolidaciones = (() => {

    const getArticlesByTranfer = async (cadenaConexion = '', documento = '', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                SELECT
                    Fecha, Documento, Articulo, Nombre, Descripcion,
                    CantidadRegular, CantidadRegularUC,
                    Relacion = CAST(CAST(FactorCompra AS int) AS nvarchar) + UnidadCompra + '/' + CAST(CAST(FactorVenta AS int) AS nvarchar) + UnidadVenta,
                    CostoUnitarioNeto,
                    CostoUnitarioNetoIva = CASE WHEN Categoria = '02' THEN CostoUnitarioNeto * 1.16 ELSE CostoUnitarioNeto END,
                    CostoValorNeto,
                    CostoUnitarioNetoUC,
                    CostoUnitarioNetoUCIva = CASE WHEN Categoria = '02' THEN CostoUnitarioNetoUC * 1.16 ELSE CostoUnitarioNetoUC END,
                    CostoConIva = CASE WHEN Categoria = '02' THEN CostoValorNeto * 1.16 ELSE CostoValorNeto END,
                    Iva = CASE WHEN Categoria = '02' THEN CostoValorNeto * 0.16 ELSE 0 END,
                    Tasa = CASE WHEN Categoria = '02' THEN '16.00' ELSE '0.00' END,
                    UnidadCompra, Rel = CAST(CAST(FactorCompra AS int) AS nvarchar) + '/' + CAST(CAST(FactorVenta AS int) AS nvarchar)
                FROM QVDEMovAlmacen
                WHERE Documento = '${documento}'
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Articulos para la transferencia', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los artculos de la transferencia',
                error
            );
        }
    }

    const getTransferenciasToday = async (cadenaConexion = '', fechaIni = '', FechaFin = '', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB};
                DECLARE @FechaInicio DATETIME = CAST('${fechaIni}' AS DATETIME);
                DECLARE @FechaFinal DATETIME = CAST('${FechaFin}' AS DATETIME);

                SET LANGUAGE Español;

                WITH tranferencias (
                    Fecha, Documento, Referencia, DescripcionAlmacen, Hora, Observaciones, NombreCajero
                ) AS (
                    SELECT 
                        Fecha, Documento, Referencia, DescripcionAlmacen, Hora, Observaciones, NombreCajero
                    FROM QVDEMovAlmacen
                    WHERE TipoDocumento = 'T'
                        AND Estatus = 'E'
                        AND Fecha BETWEEN @FechaInicio AND @FechaFinal
                    GROUP BY Fecha, Documento, Referencia, DescripcionAlmacen, Hora, Observaciones, NombreCajero
                )

                SELECT
                    T.Fecha, T.Documento, T.Referencia, T.DescripcionAlmacen, T.Hora,
                    E.Documento AS Entrada, T.Observaciones,E.DescripcionAlmacen AS AlmacenDestinoEntrada,
                    T.NombreCajero, Articulos = COUNT(*)
                FROM QVDEMovAlmacen AS E
                INNER JOIN tranferencias AS T
                ON E.Referencia = T.Documento
                WHERE TipoDocumento = 'A' AND Estatus = 'E' 
                    AND ( T.Fecha BETWEEN @FechaInicio AND @FechaFinal )
                GROUP BY T.Fecha, T.Documento, T.Referencia, T.DescripcionAlmacen,
                    T.Hora, E.Documento, T.Observaciones, E.DescripcionAlmacen, T.NombreCajero
                ORDER BY T.Fecha DESC, T.Hora DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las transferencias',
                error
            );
        }
    }
    
    const getEntradasToday = async (cadenaConexion = '', listDocuments = '', fechaIni = '', FechaFin = '', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB}
                DECLARE @FechaInicio DATETIME = CAST('${fechaIni}' AS DATETIME)
                DECLARE @FechaFinal DATETIME = CAST('${FechaFin}' AS DATETIME)
                SET LANGUAGE Español;

                SELECT
                    Documento
                FROM QVDEMovAlmacen
                WHERE TipoDocumento = 'A' AND Estatus = 'E'
                    AND ( Fecha BETWEEN @FechaInicio AND @FechaFinal )
                    AND Documento IN (${listDocuments})
                GROUP BY Documento
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener las ventas',
                error
            );
        }
    }

    const getArticleByCreateAt = async (cadenaConexion = '', sucursal = '', dateInit = '20221206', dateEnd = '20221206') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                SELECT
                    Suc = '${sucursal}',
                    Articulo, CodigoBarras, Nombre,
                    Relacion = CAST(CAST(FactorCompra AS int) AS nvarchar) + UnidadCompra + ' / ' + CAST(CAST(FactorVenta AS int) AS nvarchar) + UnidadVenta,
                    IVACompra, IVAVenta, IEPSCompra, IEPSVenta, c_ClaveProdServ, CONVERT(NVARCHAR(100), FechaAlta, 103) AS FechaAlta, CONVERT(NVARCHAR(100), FechaAlta, 114) AS HoraAlta
                FROM Articulos
                WHERE FechaAlta BETWEEN CAST('${dateInit} 00:00:00.000' AS datetime) AND CAST('${dateEnd} 23:59:59.999' AS datetime)
                `,
                QueryTypes.SELECT
            );
            return createContentAssert('Datos por sucursal', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la existencia del articulo de ' + sucursal,
                error
            );
        }
    }

    return {
        getArticlesByTranfer,
        getTransferenciasToday,
        getEntradasToday,
        getArticleByCreateAt,
    }
})();

module.exports = modelsConsolidaciones;
