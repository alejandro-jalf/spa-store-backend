const joi = require('joi');

const schemasPedidos = (() => {

    const schemaCreateDetallesPedidos = joi.object({
        pedido: joi.string().min(3).max(10).required(),
        sucursal: joi.string().min(3).max(20).required(),
        PeCaja: joi.number().min(0).required(),
        PePieza: joi.number().min(0).required(),
    });
    
    
    return {
        schemaCreateDetallesPedidos,
    }
})() ;

module.exports = schemasPedidos;
