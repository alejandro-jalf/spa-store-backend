const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsCocina = (() => {
    const getVentasByFecha = async (cadenaConexion = '', sucursal = 'ZR', fechaIni = '', FechaFin = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                DECLARE @FechaInicio DATETIME = CAST('${fechaIni}' AS DATETIME)
                DECLARE @FechaFinal DATETIME = CAST('${FechaFin}' AS DATETIME)

                DECLARE @Sucursal NVARCHAR(2) = '${sucursal}'
                DECLARE @Almacen INT = CASE WHEN @Sucursal = 'ZR' THEN 2 WHEN @Sucursal = 'VC' THEN 3 WHEN @Sucursal = 'OU' THEN 19 WHEN @Sucursal = 'JL' THEN 7 WHEN @Sucursal = 'BO' THEN 21 ELSE 0 END
                DECLARE @Tienda INT = CASE WHEN @Sucursal = 'ZR' THEN 1 WHEN @Sucursal = 'VC' THEN 2 WHEN @Sucursal = 'OU' THEN 5 WHEN @Sucursal = 'JL' THEN 4 WHEN @Sucursal = 'BO' THEN 6 ELSE 0 END

                --SELECT @toDay,@DiasSemana,@DiaActual

                SET LANGUAGE Español;

                WITH articulosCTE (Articulo)
                AS
                (
                    SELECT Articulo FROM Articulos WHERE Subfamilia = '65' AND LEN(CodigoBarras) <> 13 AND NOT Articulo IN ('1265036','1265015','1265026')
                )

                SELECT
                    Suc = @Sucursal,
                    Mes
                    ,MesMovimientoLetra
                    ,Dia = DAY(Fecha)
                    ,Venta = SUM(VentaValorNeta),
                    PrimeraVenta = MIN(Hora),
                    UltimaVenta = MAX(Hora)
                FROM QVDEMovAlmacen
                WHERE TipoDocumento = 'V' AND Estatus = 'E' 
                    AND Articulo IN (SELECT Articulo FROM articulosCTE)
                    AND ( Fecha BETWEEN @FechaInicio AND @FechaFinal )
                GROUP BY Mes,MesMovimientoLetra,DAY(Fecha)
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
    }
})();

module.exports = modelsCocina;
