const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsTrabajadores = (() => {
    const getAsistenciasBySucursal = async (cadenaConexion = '', sucursal, fechaini, fechafin) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015
                DECLARE @FechaInicial DATETIME = CAST('${fechaini}' AS DATETIME)
                DECLARE @FechaFinal DATETIME = CAST('${fechafin}' AS DATETIME)
                DECLARE @Sucursal NVARCHAR(50) = '${sucursal}'

                SELECT
                    T.Nombre, FechaServer = CONVERT(NVARCHAR, A.FechaServidor, 25), A.Estatus
                FROM Trabajadores AS T
                LEFT JOIN Asistencias AS A ON A.IdTrabajador = T.IdTrabajador
                WHERE T.Categoria = @Sucursal
                    AND (A.FechaServidor BETWEEN @FechaInicial AND @FechaFinal)
                ORDER BY T.Nombre, A.FechaServidor
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos encontrados en la base de datos', result[0]);
        } catch (error) {
            console.log(error);
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener precios',
                error
            );
        }
    }

    return {
        getAsistenciasBySucursal,
    }
})();

module.exports = modelsTrabajadores;
