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

    const getListRevisionCosto = async (cadenaConexion = '', sucursal = '', fecha = '20221206') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Fecha datetime = CAST('${fecha}' AS datetime);
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'ER' THEN 3 WHEN @Sucursal = 'OU' THEN 5  WHEN @Sucursal = 'SY' THEN 9 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END;
                
                SELECT
                    Fecha, Documento, D.Articulo, D.Nombre, CostoUnitario, UltimoCosto,
                    Diferencia = ABS(D.CostoUnitario-L.UltimoCosto)
                FROM QVDEMovAlmacen D
                LEFT JOIN QVExistencias L ON D.Articulo = L.Articulo AND @Tienda = L.Tienda AND @Almacen = L.Almacen
                WHERE D.Fecha = @Fecha AND D.TipoDocumento = 'A' AND D.Almacen = @Almacen
                ORDER BY Fecha,Documento DESC,D.Articulo
                `,
                QueryTypes.SELECT
            );
            return createContentAssert('Lista de costos por transferencias', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de costos por transferencias de ' + sucursal,
                error
            );
        }
    }

    const updateListCosto = async (cadenaConexion = '', sucursal = '', whenLastCost = '', listArticles = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}';
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'ER' THEN 5 WHEN @Sucursal = 'OU' THEN 19  WHEN @Sucursal = 'SY' THEN 16 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END;

                UPDATE Existencias 
                SET UltimoCosto = CASE Articulo
                        ${whenLastCost}
                        ELSE UltimoCosto END,
                    CostoPromedio = CASE Articulo
                        ${whenLastCost}
                        ELSE CostoPromedio END
                WHERE Almacen = @Almacen AND Articulo IN (${listArticles});
                `,
                QueryTypes.UPDATE
            );
            return createContentAssert('Costos actualizados', result);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los costos de ' + sucursal,
                error
            );
        }
    }

    return {
        getArticlesByTranfer,
        getTransferenciasToday,
        getEntradasToday,
        getArticleByCreateAt,
        getListRevisionCosto,
        updateListCosto,
    }
})();

module.exports = modelsConsolidaciones;
