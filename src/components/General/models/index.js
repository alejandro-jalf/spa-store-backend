const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsGeneral = (() => {
    const testConnection = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'SELECT 1 + 1',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Conexion exitosa', result[0]);
        } catch (error) {
            return createContentError('Conexion fallida', error);
        }
    }

    const calculaFoliosSucursal = async (cadenaConexion = '', sucursal = 'ZR', promMensual = 200) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `SELECT
                    Tienda,
                    Serie,
                    FolioInicial,
                    FolioFinal,
                    FolioActual,
                    FolioDisponible = FolioFinal - FolioActual,
                    INCREMENTODEFOLIO = ${promMensual} - (FolioFinal - FolioActual),
                    FOLIOFINC = (${promMensual} - (FolioFinal - FolioActual)) + FOLIOFINAL
                FROM SeriesFolios
                WHERE Serie IN('${sucursal}', '${sucursal}E')`,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Datos de folios encontrados', result[0]);
        } catch (error) {
            return createContentError('Fallo al intentar obtener el calculo de folios mensuales', error);
        }
    }

    const updateFoliosSucursal = async (cadenaConexion = '', serie = '', newFolio) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `UPDATE SeriesFolios
                SET
                    FolioFinal = ${newFolio}
                WHERE Serie = '${serie}'
                    AND FolioFinal < ${newFolio}`,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion de folios', result);
        } catch (error) {
            return createContentError('Fallo al intentar actualizar los folios', error);
        }
    }

    return {
        testConnection,
        calculaFoliosSucursal,
        updateFoliosSucursal,
    }
})();

module.exports = modelsGeneral;
