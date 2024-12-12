const {
    createResponse,
    getConnectionFrom,
    createContentError,
    createContentAssert,
} = require('../../../utils');
const {
    validateBodyUpdateRequest,
    validateStatusRequest,
    validateCreatedBy,
} = require('../validations');
const { validateSucursal } = require('../../../validations');
const {
    getAllDepartamentos,
    getDepartamento,
    getAllSucursales,
    getSucursal,
    getAllTiposEquipos,
    getTipoDeEquipo,
    getAllFichasTecnicas,
    getFichaTecnica,
    createSucursal,
    createDepartamentos,
    createTipoEquipo,
    createFichaTecnica,
    getConsecutivoByTipoEquipo,
    deleteSucursal,
    deleteDepartamentos,
    deleteTiposEquipos,
    deleteFichasTecnicas,
    updateSucursal,
    updateDepartamento,
    updateTipoDeEquipo,
    updateFichasTecnicas,
} = require('../models');

const ServicesPedidos = (() => {
    const conexionZaragoza = getConnectionFrom('ZR');

    const getDepartamentos = async () => {
        const response = await getAllDepartamentos(conexionZaragoza);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const getDepartamentoByCodigo = async (codigo = '') => {
        const response = await getDepartamento(conexionZaragoza, codigo);

        if (!response.success) return createResponse(400, response);
        if (response.data.length === 0) return createResponse(200, createContentError('No existe este departamento'))
        return createResponse(200, response)
    }

    const getSucursales = async () => {
        const response = await getAllSucursales(conexionZaragoza);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const getSucursalByCodigo = async (codigo = '') => {
        const response = await getSucursal(conexionZaragoza, codigo);

        if (!response.success) return createResponse(400, response);
        if (response.data.length === 0) return createResponse(200, createContentError('No existe esta sucursal'))
        return createResponse(200, response)
    }

    const getTiposEquipos = async () => {
        const response = await getAllTiposEquipos(conexionZaragoza);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const getTipoEquipoByCodigo = async (codigo = '') => {
        const response = await getTipoDeEquipo(conexionZaragoza, codigo);

        if (!response.success) return createResponse(400, response);
        if (response.data.length === 0) return createResponse(200, createContentError('No existe este tipo de equipo'))
        return createResponse(200, response)
    }

    const getFichasTecnicas = async () => {
        const response = await getAllFichasTecnicas(conexionZaragoza);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const getFichaTecnicaByCodigo = async (codigo = '') => {
        const response = await getFichaTecnica(conexionZaragoza, codigo);

        if (!response.success) return createResponse(400, response);
        if (response.data.length === 0) return createResponse(200, createContentError('No existe esta ficha tecnica'))
        return createResponse(200, response)
    }

    const getConsecutivoFicha = async (TipoEquipo) => {
        const response = await getConsecutivoByTipoEquipo(conexionZaragoza, TipoEquipo);

        if (!response.success) return createResponse(400, response);
        if (response.data.length === 0) return createResponse(200, createContentAssert('Consecutivo', [{ Consecutivo: 0 }]))
        return createResponse(200, response)
    }

    const addSucursal = async (bodyCreateSucursal) => {
        const { Codigo, Descripcion, Estado, Ciudad, Calle, Numero, CP } = bodyCreateSucursal;
        const response = await createSucursal(conexionZaragoza, Codigo, Descripcion, Estado, Ciudad, Calle, Numero, CP);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const addDepartamento = async (bodyCreateDepartamento) => {
        const { Codigo, Descripcion } = bodyCreateDepartamento;
        const response = await createDepartamentos(conexionZaragoza, Codigo, Descripcion);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const addTipoEquipo = async (bodyCreateTipoEquipo) => {
        const { Codigo, Descripcion, Campos } = bodyCreateTipoEquipo;
        const response = await createTipoEquipo(conexionZaragoza, Codigo, Descripcion, Campos);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const addFichaTecnica = async (bodyCreateFichaTecnica) => {
        const {
            Folio, Ciudad, FechaCaptura, Responsable, Sucursal, Departamento, Modelo, TipoEquipo, Consecutivo, Marca, 
            PantallaPulgadas, TamañoPulgadas, Fabricante, PuertoHDMI, PuertoVGA, Color, Serie, 
            Codigo, Clave, Digitos, Largo, Ancho, Grosor, Alambrico, SO, MotherBoard, Procesador, 
            DiscoDuro, RAM, Conectividad, TipoPila, DuracionBateria, Voltaje, Accesorios, 
            Garantia, Toner, Tambor, Tipo, NumeroSerial, Material, Velocidades, Capacidad, 
            ContieneBateria, NumeroPuertas, TemperaturaOperacion, ConsumoEnergetico, Iluminacion, 
            SistemaRefrigeracion, Combustible, Contactos, Cargador, Observaciones, CreatedBy, UpdatedBy
        } = bodyCreateFichaTecnica;

        const response = await createFichaTecnica(
            conexionZaragoza,
            Folio, Ciudad, FechaCaptura, Responsable, Sucursal, Departamento, Modelo, TipoEquipo, Consecutivo, Marca, 
            PantallaPulgadas, TamañoPulgadas, Fabricante, PuertoHDMI, PuertoVGA, Color, Serie, 
            Codigo, Clave, Digitos, Largo, Ancho, Grosor, Alambrico, SO, MotherBoard, Procesador, 
            DiscoDuro, RAM, Conectividad, TipoPila, DuracionBateria, Voltaje, Accesorios, 
            Garantia, Toner, Tambor, Tipo, NumeroSerial, Material, Velocidades, Capacidad, 
            ContieneBateria, NumeroPuertas, TemperaturaOperacion, ConsumoEnergetico, Iluminacion, 
            SistemaRefrigeracion, Combustible, Contactos, Cargador, Observaciones, CreatedBy, UpdatedBy
        );

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateBranch = async (Codigo, body) => {
        const { Descripcion, Estado, Ciudad, Calle, Numero, CP } = body;
        const response = await updateSucursal(conexionZaragoza, Codigo, Descripcion, Estado, Ciudad, Calle, Numero, CP);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateDepartment = async (Codigo, body) => {
        const { Descripcion } = body;
        const response = await updateDepartamento(conexionZaragoza, Codigo, Descripcion);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateTypeEquipment = async (Codigo, body) => {
        const { Descripcion, Campos } = body;
        const response = await updateTipoDeEquipo(conexionZaragoza, Codigo, Descripcion, Campos);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateTokens = async (Folio, body) => {
        const {
            Ciudad, Responsable, Modelo, Marca, 
            PantallaPulgadas, TamañoPulgadas, Fabricante, PuertoHDMI, PuertoVGA, Color, Serie, 
            Codigo, Clave, Digitos, Largo, Ancho, Grosor, Alambrico, SO, MotherBoard, Procesador, 
            DiscoDuro, RAM, Conectividad, TipoPila, DuracionBateria, Voltaje, Accesorios, 
            Garantia, Toner, Tambor, Tipo, NumeroSerial, Material, Velocidades, Capacidad, 
            ContieneBateria, NumeroPuertas, TemperaturaOperacion, ConsumoEnergetico, Iluminacion, 
            SistemaRefrigeracion, Combustible, Contactos, Cargador, Observaciones, UpdatedBy
        } = body;
        const response = await updateFichasTecnicas(
            conexionZaragoza, Folio, Ciudad, Responsable, Modelo, Marca, 
            PantallaPulgadas, TamañoPulgadas, Fabricante, PuertoHDMI, PuertoVGA, Color, Serie, 
            Codigo, Clave, Digitos, Largo, Ancho, Grosor, Alambrico, SO, MotherBoard, Procesador, 
            DiscoDuro, RAM, Conectividad, TipoPila, DuracionBateria, Voltaje, Accesorios, 
            Garantia, Toner, Tambor, Tipo, NumeroSerial, Material, Velocidades, Capacidad, 
            ContieneBateria, NumeroPuertas, TemperaturaOperacion, ConsumoEnergetico, Iluminacion, 
            SistemaRefrigeracion, Combustible, Contactos, Cargador, Observaciones, UpdatedBy
        );
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const deleteBranchs = async (Codigo = '') => {
        const response = await deleteSucursal(conexionZaragoza, Codigo);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const deleteDepartment = async (Codigo = '') => {
        const response = await deleteDepartamentos(conexionZaragoza, Codigo);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const deleteTypeEquipment = async (Codigo = '') => {
        const response = await deleteTiposEquipos(conexionZaragoza, Codigo);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const deleteTokens = async (Folio = '') => {
        const response = await deleteFichasTecnicas(conexionZaragoza, Folio);
        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    return {
        getDepartamentos,
        getDepartamentoByCodigo,
        getSucursales,
        getSucursalByCodigo,
        getTiposEquipos,
        getTipoEquipoByCodigo,
        getFichasTecnicas,
        getFichaTecnicaByCodigo,
        getConsecutivoFicha,
        addSucursal,
        addDepartamento,
        addTipoEquipo,
        addFichaTecnica,
        updateBranch,
        updateDepartment,
        updateTypeEquipment,
        updateTokens,
        deleteBranchs,
        deleteDepartment,
        deleteTypeEquipment,
        deleteTokens,
    }
})();

module.exports = ServicesPedidos;
