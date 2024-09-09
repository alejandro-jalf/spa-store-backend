const {
    createResponse,
    getConnectionFrom,
} = require('../../../utils');
const { validateUpdateCostoOrden, validateUpdateMasivo } = require('../validations');
const { validateSucursal, validateFechas } = require('../../../validations');
const {
    getDetailsCompra, getDetailsOrdenCompra, updateCostoOrdenCompra, updateMassiveCostosOrdenCompra, getSolicitudes,
} = require('../models');

const ServicesMayoristas = (() => {
    
    const getDocumentCompra = async (sucursal = '', documento = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getDetailsCompra(conexion, documento);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getDocumentOrden = async (sucursal = '', consecutivo = '') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom(sucursal);
        const response  = await getDetailsOrdenCompra(conexion, consecutivo);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const updateCostoOrden = async (sucursal = '', consecutivo = '', bodyUpdateCostoOrden = {}) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateUpdateCostoOrden(bodyUpdateCostoOrden);
        if (!validate.success) return createResponse(400, validate);

        const newCosto = bodyUpdateCostoOrden.TotalPactado / bodyUpdateCostoOrden.CantidadRegular;

        const conexion = getConnectionFrom(sucursal);
        const response  = await updateCostoOrdenCompra(conexion, newCosto, bodyUpdateCostoOrden.Position,  consecutivo);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const updateCostoOrdenMassive = async (sucursal = '', consecutivo = '', bodyMasivo = {}) => {
        let validate = validateSucursal(sucursal);
        if (!validate.success) return createResponse(400, validate);

        validate = validateUpdateMasivo(bodyMasivo);
        if (!validate.success) return createResponse(400, validate);

        const query = bodyMasivo.data.reduce((queryS, article) => {
            const newCosto = article.TotalPactado / article.CantidadRegular;
            queryS +=
                ` UPDATE OrdenesCompra SET CostoPedido = ${newCosto} WHERE ConsecutivoOC = ${article.Position} AND Consecutivo = '${consecutivo}'; `;
            return queryS;
        }, '');

        console.log(query);
        const conexion = getConnectionFrom(sucursal);
        const response  = await updateMassiveCostosOrdenCompra(conexion, query);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    const getRequestsStores = async (dateAt, dateTo) => {
        console.log(dateAt, dateTo);
        let validate = validateFechas(dateAt, dateTo);
        if (!validate.success) return createResponse(400, validate);

        const conexion = getConnectionFrom('BO');
        const response  = await getSolicitudes(conexion, dateAt, dateTo);

        if (!response.success) return createResponse(400, response)
        return createResponse(200, response)
    }

    return {
        getDocumentCompra,
        getDocumentOrden,
        updateCostoOrden,
        updateCostoOrdenMassive,
        getRequestsStores,
    }
})();

module.exports = ServicesMayoristas;