const joi = require('joi');

const schemasPedidos = (() => {

    const schemaFolio = joi.string().regex(/^\w{2,2}D\d{2,2}T\d{2,2}-\d{5,5}-\d{8,8}$/);

    return {
        schemaUpdateRequest,
        schemaFolio,
    }
})() ;

module.exports = schemasPedidos;
