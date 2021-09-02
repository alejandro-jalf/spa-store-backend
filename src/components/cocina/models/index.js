const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsCocina = (() => {
    const getVentasByFecha = async (cadenaConexion = '', sucursal = 'ZR', fechaIni = '', FechaFin = '', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB}
                DECLARE @FechaInicio DATETIME = CAST('${fechaIni}' AS DATETIME)
                DECLARE @FechaFinal DATETIME = CAST('${FechaFin}' AS DATETIME)

                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}'
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'OU' THEN 19 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'OU' THEN 5 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END

                SET LANGUAGE Español;

                WITH articulosCTE (Articulo)
                AS
                (
                    SELECT Articulo FROM Articulos WHERE Subfamilia = '65' AND LEN(CodigoBarras) <> 13 AND NOT Articulo IN ('1265036','1265015','1265026')
                )

                SELECT
                    Suc = @Sucursal,
                    Mes,
                    Year = YEAR(Fecha),
                    MesMovimientoLetra,
                    Dia = DAY(Fecha),
                    Venta = SUM(VentaValorNeta)
                FROM QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E' 
                    AND Articulo IN (SELECT Articulo FROM articulosCTE)
                    AND ( Fecha BETWEEN @FechaInicio AND @FechaFinal )
                GROUP BY Mes, MesMovimientoLetra, DAY(Fecha), YEAR(Fecha)
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener ventas de cocina',
                error
            );
        }
    }
    
    const getAllVentasByFecha = async (cadenaConexion = '', sucursal = 'ZR', fechaIni = '', FechaFin = '', DB = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE ${DB}
                DECLARE @FechaInicio DATETIME = CAST('${fechaIni}' AS DATETIME)
                DECLARE @FechaFinal DATETIME = CAST('${FechaFin}' AS DATETIME)

                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}'
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'OU' THEN 19 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'OU' THEN 5 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END

                SET LANGUAGE Español;

                WITH articulosCTE (Articulo)
                AS
                (
                    SELECT Articulo FROM Articulos WHERE Subfamilia = '65' AND LEN(CodigoBarras) <> 13 AND NOT Articulo IN ('1265036','1265015','1265026')
                )

                SELECT
                    Suc = @Sucursal,
                    Articulo, Nombre
                    ,CantidadRegular
                    , Relacion = CAST(CAST(FactorCompra AS int) AS varchar) + CAST(UnidadCompra AS varchar) + '/' + CAST(CAST(FactorVenta AS int) AS varchar) + CAST(UnidadVenta as varchar)
                    ,VentaValorNeta
                    ,Hora,
                    Fecha,
                    Mes,MesMovimientoLetra,Dia = DAY(Fecha)
                FROM QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E' 
                    AND Articulo IN (SELECT Articulo FROM articulosCTE)
                    AND ( FEcha BETWEEN @FechaInicio AND @FechaFinal )
                ORDER BY Fecha DESC, Hora DESC
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener ventas de cocina',
                error
            );
        }
    }

    return {
        getVentasByFecha,
        getAllVentasByFecha,
    }
})();

module.exports = modelsCocina;
