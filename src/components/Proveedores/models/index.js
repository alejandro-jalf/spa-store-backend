const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsProveedores = (() => {
    const getAllProviders = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'SELECT Proveedor, Nombre FROM Proveedores',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Proveedores encontrados', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener los proveedores',
                error
            );
        }
    }

    return {
        getAllProviders,
    }
})();

module.exports = modelsProveedores;
