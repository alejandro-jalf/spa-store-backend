const joi = require('joi');

const schemasCocina = (() => {

    const schemaFecha = joi.string().regex(/^\d{8,8}$/);
    
    return {
        schemaFecha,
    }
})() ;

module.exports = schemasCocina;
