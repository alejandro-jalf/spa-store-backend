const joi = require('joi');

const schemasPedidos = (() => {

    const schemaUpdateRequest = joi.object({
        CodigoBarra: joi.string().min(0).max(30).required(),
        Nombre: joi.string().min(0).max(50).required(),
        IVA: joi.number().min(0).max(1).required(),
        Ieps: joi.number().min(0).max(1).required(),
        TazaIeps: joi.number().required(),
        TipoModelo: joi.string().min(0).max(30).required(),
        Marca: joi.string().min(0).max(30).required(),
        Presentacion: joi.number().required(),
        UnidadMedida: joi.string().min(0).max(3).required(),
        UnidadCompra: joi.string().min(0).max(3).required(),
        FactorCompra: joi.number().required(),
        UnidadVenta: joi.string().min(0).max(3).required(),
        FactorVenta: joi.number().required(),
        ActualizadoPor: joi.string().max(40).required(),
    });

    return {
        schemaUpdateRequest,
    }
})() ;

module.exports = schemasPedidos;
