const { QueryTypes } = require('sequelize');
const { dbmssql } = require('../../../services')
const {
    createContentAssert,
    createContentError
} = require('../../../utils');

const modelsPedidos = (() => {
    const getAllDepartamentos = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM Departamentos',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de departamentos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de departamentos',
                error
            );
        }
    }

    const getDepartamento = async (cadenaConexion = '', codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT * FROM Departamentos WHERE Codigo = '${codigo}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de Departamentos por codigo', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de Departamentos por codigo',
                error
            );
        }
    }

    const getAllSucursales = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM Sucursales',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de Sucursales', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de Sucursales',
                error
            );
        }
    }

    const getSucursal = async (cadenaConexion = '', codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT * FROM Sucursales WHERE Codigo = '${codigo}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de Sucursales por codigo', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de Sucursales por codigo',
                error
            );
        }
    }

    const getAllTiposEquipos = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM TiposEquipos',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de TiposEquipos', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de TiposEquipos',
                error
            );
        }
    }

    const getTipoDeEquipo = async (cadenaConexion = '', codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT * FROM TiposEquipos WHERE Codigo = '${codigo}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de TiposEquipos por codigo', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de TiposEquipos por codigo',
                error
            );
        }
    }

    const getAllFichasTecnicas = async (cadenaConexion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                'USE CA2015; SELECT * FROM FichasTecnicas',
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de FichasTecnicas', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de FichasTecnicas',
                error
            );
        }
    }

    const getFichaTecnica = async (cadenaConexion = '', Folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT * FROM FichasTecnicas WHERE Folio = '${Folio}';
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Lista de FichasTecnicas por Folio', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener la Lista de FichasTecnicas por Folio',
                error
            );
        }
    }

    const getConsecutivoByTipoEquipo = async (cadenaConexion = '', TipoEquipo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015;
                SELECT TOP 1 Consecutivo FROM FichasTecnicas WHERE TipoEquipo = '${TipoEquipo}' ORDER BY Consecutivo DESC;
                `,
                QueryTypes.SELECT
            );
            dbmssql.closeConexion();
            return createContentAssert('Ultimo consecutivo por tipo', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar obtener Ultimo consecutivo por tipo',
                error
            );
        }
    }

    const createSucursal = async (
        cadenaConexion = '', Codigo = '', Descripcion = '', Estado = '', Ciudad = '', Calle = '', Numero = '', CP = ''
    ) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                INSERT INTO Sucursales (
                    Codigo, Descripcion, Estado, Ciudad, Calle, Numero, CP
                ) VALUES (
                    '${Codigo}', '${Descripcion}', '${Estado}', '${Ciudad}', '${Calle}', '${Numero}', '${CP}'
                );
                `,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de la creacion', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar Crear la sucursal',
                error
            );
        }
    }

    const createDepartamentos = async (cadenaConexion = '', Codigo= '', Descripcion = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                INSERT INTO Departamentos (
                    Codigo, Descripcion
                ) VALUES (
                    '${Codigo}', '${Descripcion}'
                );
                `,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de la creacion', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar Crear el Departamentos',
                error
            );
        }
    }

    const createTipoEquipo = async (cadenaConexion = '', Codigo = '', Descripcion = '', Campos = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                INSERT INTO TiposEquipos (
                    Codigo, Descripcion, Campos
                ) VALUES (
                    '${Codigo}', '${Descripcion}', '${Campos}'
                );
                `,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de la creacion', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar Crear el Tipos de Equipo',
                error
            );
        }
    }

    const createFichaTecnica = async (
            cadenaConexion = '',
            Folio = '', Ciudad = '', FechaCaptura = '', Responsable = '', Sucursal = '', Departamento = '', Modelo = '', TipoEquipo = '', Consecutivo = 1, Marca = '', 
            PantallaPulgadas = 0, TamañoPulgadas = 0, Fabricante = '', PuertoHDMI = 0, PuertoVGA = 0, Color = '', Serie = '', 
            Codigo = '', Clave = '', Digitos = 0, Largo = 0, Ancho = 0, Grosor = 0, Alambrico = 0, SO = '', MotherBoard = '', Procesador = '', 
            DiscoDuro = '', RAM = '', Conectividad = '', TipoPila = '', DuracionBateria = '', Voltaje = '', Accesorios = '', 
            Garantia = '', Toner = '', Tambor = '', Tipo = '', NumeroSerial = '', Material = '', Velocidades = '', Capacidad = '', 
            ContieneBateria = 0, NumeroPuertas = 0, TemperaturaOperacion = 0, ConsumoEnergetico = '', Iluminacion = '', 
            SistemaRefrigeracion = '', Combustible = '', Contactos = 0, Cargador = '', Observaciones = '', CreatedBy = '', UpdatedBy = ''
    ) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                INSERT INTO FichasTecnicas (
                    Folio, Ciudad, FechaCaptura, Responsable, Sucursal, Departamento, Modelo, TipoEquipo, Consecutivo, Marca, 
                    PantallaPulgadas, TamañoPulgadas, Fabricante, PuertoHDMI, PuertoVGA, Color, Serie, 
                    Codigo, Clave, Digitos, Largo, Ancho, Grosor, Alambrico, SO, MotherBoard, Procesador, 
                    DiscoDuro, RAM, Conectividad, TipoPila, DuracionBateria, Voltaje, Accesorios, 
                    Garantia, Toner, Tambor, Tipo, NumeroSerial, Material, Velocidades, Capacidad, 
                    ContieneBateria, NumeroPuertas, TemperaturaOperacion, ConsumoEnergetico, Iluminacion, 
                    SistemaRefrigeracion, Combustible, Contactos, Cargador, Observaciones, Created, 
                    CreatedBy, Updated, UpdatedBy
                ) VALUES (
                    '${Folio}', '${Ciudad}', CAST('${FechaCaptura}' AS DATETIME), '${Responsable}', '${Sucursal}', '${Departamento}', '${Modelo}', '${TipoEquipo}', ${Consecutivo}, '${Marca}', 
                    ${PantallaPulgadas}, ${TamañoPulgadas}, '${Fabricante}', ${PuertoHDMI}, ${PuertoVGA}, '${Color}', '${Serie}',
                    '${Codigo}', '${Clave}', ${Digitos}, ${Largo}, ${Ancho}, ${Grosor}, ${Alambrico}, '${SO}', '${MotherBoard}', '${Procesador}',
                    '${DiscoDuro}', '${RAM}', '${Conectividad}', '${TipoPila}', '${DuracionBateria}', '${Voltaje}', '${Accesorios}',
                    '${Garantia}', '${Toner}', '${Tambor}', '${Tipo}', '${NumeroSerial}', '${Material}', '${Velocidades}', '${Capacidad}',
                    ${ContieneBateria}, ${NumeroPuertas}, ${TemperaturaOperacion}, '${ConsumoEnergetico}', '${Iluminacion}', 
                    '${SistemaRefrigeracion}', '${Combustible}', ${Contactos}, '${Cargador}', '${Observaciones}', GETDATE(), '${CreatedBy}', GETDATE(), '${UpdatedBy}'
                );
                `,
                QueryTypes.INSERT
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de la creacion', result[0]);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar Crear el Tipos de Equipo',
                error
            );
        }
    }

    const updateSucursal = async (cadenaConexion = '', Codigo = '', Descripcion = '', Estado = '', Ciudad = '', Calle = '', Numero = '', CP = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE Sucursales SET
                    Descripcion = '${Descripcion}', Estado = '${Estado}', Ciudad = '${Ciudad}',
                    Calle = '${Calle}', Numero = '${Numero}', CP = '${CP}'
                WHERE Codigo = '${Codigo}'';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los datos de la sucursal',
                error
            );
        }
    }

    const updateDepartamento = async (cadenaConexion = '', Codigo = '', Descripcion = '') => {
        try {
            // const { Codigo, Descripcion } = body;
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE Departamentos SET Descripcion = '${Descripcion}' WHERE Codigo = '${Codigo}'';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los datos del departamento',
                error
            );
        }
    }

    const updateTipoDeEquipo = async (cadenaConexion = '', Codigo = '', Descripcion = '', Campos = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE TiposEquipos SET
                    Descripcion = '${Descripcion}', Campos = '${Campos}'
                WHERE Codigo = '${Codigo}'';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los datos del tipo de equipo',
                error
            );
        }
    }

    const updateFichasTecnicas = async (
        cadenaConexion = '',
        Folio = '', Ciudad = '', Responsable = '', Modelo = '', Marca = '', 
        PantallaPulgadas = 0, TamañoPulgadas = 0, Fabricante = '', PuertoHDMI = 0, PuertoVGA = 0, Color = '', Serie = '', 
        Codigo = '', Clave = '', Digitos = 0, Largo = 0, Ancho = 0, Grosor = 0, Alambrico = 0, SO = '', MotherBoard = '', Procesador = '', 
        DiscoDuro = '', RAM = '', Conectividad = '', TipoPila = '', DuracionBateria = '', Voltaje = '', Accesorios = '', 
        Garantia = '', Toner = '', Tambor = '', Tipo = '', NumeroSerial = '', Material = '', Velocidades = '', Capacidad = '', 
        ContieneBateria = 0, NumeroPuertas = 0, TemperaturaOperacion = 0, ConsumoEnergetico = '', Iluminacion = '', 
        SistemaRefrigeracion = '', Combustible = '', Contactos = 0, Cargador = '', Observaciones = '', UpdatedBy = ''
    ) => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `
                USE CA2015;
                UPDATE FichasTecnicas SET
                    Ciudad = '${Ciudad}', Responsable = '${Responsable}',
                    Modelo = '${Modelo}', Marca = '${Marca}', PantallaPulgadas = ${PantallaPulgadas}, TamañoPulgadas = ${TamañoPulgadas},
                    Fabricante = '${Fabricante}', PuertoHDMI = ${PuertoHDMI}, PuertoVGA = ${PuertoVGA}, Color = '${Color}', Serie = '${Serie}',
                    Codigo = '${Codigo}', Clave = '${Clave}', Digitos = ${Digitos}, Largo = ${Largo}, Ancho = ${Ancho}, Grosor = ${Grosor},
                    Alambrico = ${Alambrico}, SO = '${SO}', MotherBoard = '${MotherBoard}', Procesador = '${Procesador}', DiscoDuro = '${DiscoDuro}',
                    RAM = '${RAM}', Conectividad = '${Conectividad}', TipoPila = '${TipoPila}', DuracionBateria = '${DuracionBateria}',
                    Voltaje = '${Voltaje}', Accesorios = '${Accesorios}', Garantia = '${Garantia}', Toner = '${Toner}', Tambor = '${Tambor}',
                    Tipo = '${Tipo}', NumeroSerial = '${NumeroSerial}', Material = '${Material}', Velocidades = '${Velocidades}',
                    Capacidad = '${Capacidad}', ContieneBateria = ${ContieneBateria}, NumeroPuertas = ${NumeroPuertas},
                    TemperaturaOperacion = ${TemperaturaOperacion}, ConsumoEnergetico = '${ConsumoEnergetico}', Iluminacion = '${Iluminacion}', 
                    SistemaRefrigeracion = '${SistemaRefrigeracion}', Combustible = '${Combustible}', Contactos = ${Contactos}, Cargador = '${Cargador}',
                    Observaciones = '${Observaciones}', Updated = GETDATE(), UpdatedBy = '${UpdatedBy}'
                WHERE Folio = '${Folio}'';
                `,
                QueryTypes.UPDATE
            );
            dbmssql.closeConexion();
            return createContentAssert('Resultado de actualizacion', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar actualizar los datos del tipo de equipo',
                error
            );
        }
    }

    const deleteSucursal = async (cadenaConexion = '', Codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015; DELETE FROM Sucursales WHERE Codigo = '${Codigo}';`,
                QueryTypes.DELETE
            );
            dbmssql.closeConexion();
            if (result[1] === 0)
                return createContentError('No se pudo eliminar la sucursal', result);
            return createContentAssert('Resultado de eliminar', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar la Sucursal',
                error
            );
        }
    }

    const deleteDepartamentos = async (cadenaConexion = '', Codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015; DELETE FROM Departamentos WHERE Codigo = '${Codigo}';`,
                QueryTypes.DELETE
            );
            dbmssql.closeConexion();
            if (result[1] === 0)
                return createContentError('No se pudo eliminar el departamento', result);
            return createContentAssert('Resultado de eliminar', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar el departamento',
                error
            );
        }
    }

    const deleteTiposEquipos = async (cadenaConexion = '', Codigo = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015; DELETE FROM TiposEquipos WHERE Codigo = '${Codigo}';`,
                QueryTypes.DELETE
            );
            dbmssql.closeConexion();
            if (result[1] === 0)
                return createContentError('No se pudo eliminar el Tipo de Equipo', result);
            return createContentAssert('Resultado de eliminar', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar el Tipo de Equipo',
                error
            );
        }
    }

    const deleteFichasTecnicas = async (cadenaConexion = '', Folio = '') => {
        try {
            const accessToDataBase = dbmssql.getConexion(cadenaConexion);
            const result = await accessToDataBase.query(
                `USE CA2015; DELETE FROM FichasTecnicas WHERE Folio = '${Folio}';`,
                QueryTypes.DELETE
            );
            dbmssql.closeConexion();
            if (result[1] === 0)
                return createContentError('No se pudo eliminar la Ficha Tecnica', result);
            return createContentAssert('Resultado de eliminar', result);
        } catch (error) {
            return createContentError(
                'Fallo la conexion con base de datos al intentar eliminar la Ficha Tecnica',
                error
            );
        }
    }

    return {
        getAllDepartamentos,
        getDepartamento,
        getAllSucursales,
        getSucursal,
        getAllTiposEquipos,
        getTipoDeEquipo,
        getAllFichasTecnicas,
        getFichaTecnica,
        getConsecutivoByTipoEquipo,
        createSucursal,
        createDepartamentos,
        createTipoEquipo,
        createFichaTecnica,
        updateSucursal,
        updateDepartamento,
        updateTipoDeEquipo,
        updateFichasTecnicas,
        deleteSucursal,
        deleteDepartamentos,
        deleteTiposEquipos,
        deleteFichasTecnicas,
    }
})();

module.exports = modelsPedidos;
