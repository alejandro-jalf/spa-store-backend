const joi = require('joi');

const schemasCocina = (() => {

    const schemaFecha = joi.string().regex(/^\d{8,8}$/);
    const schemaCodigoBarras = joi.string().regex(/^\d{1,14}$/);
    
    
    return {
        schemaFecha,
        schemaCodigoBarras,
    }
})() ;

module.exports = schemasCocina;
