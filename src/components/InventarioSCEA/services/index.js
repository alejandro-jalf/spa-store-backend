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

    const updateRequestArticle = async (uuid = '', body = {}) => {
        let validate = validateBodyUpdateRequest(body);
        if (!validate.success) return createResponse(400, validate);

        const response = await updateSolicitud(conexionZaragoza, uuid, body);

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const updateStatusRequest = async (uuid = '', estatus = '', Articulo = '') => {
        let validate = validateStatusRequest(estatus);
        if (!validate.success) return createResponse(400, validate);
        let response;

        const updateOnlyStatus = async () => {
            return await updateStatus(conexionZaragoza, uuid, estatus.toUpperCase(), '');
        }

        const updateStatusAndArticle = async () => {
            if (Articulo.trim() === '') return createContentError('El articulo no puede ser vacio')
            return await updateStatus(conexionZaragoza, uuid, estatus.toUpperCase(), Articulo);
        }

        if (estatus.toUpperCase() === 'ATENDIDO')
            response = await updateStatusAndArticle();
        else response = await updateOnlyStatus();

        if (!response.success) return createResponse(400, response);
        return createResponse(200, response)
    }

    const deleteRequest = async (uuid = '') => {
        const response = await deleteSolicitud(conexionZaragoza, uuid);

        if (!response.success) return createResponse(400, response);
        if (response.data[1] === 0)
            return createResponse(
                400,
                createContentError('No se pudo eliminar la solicitud. Recuerde que para poder eliminar una solicitud tiene que estar cancelada')
            )
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
    }
})();

module.exports = ServicesPedidos;
