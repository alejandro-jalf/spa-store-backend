const joi = require('joi');

const schemasCocina = (() => {
    const schemaFechas = joi.object({
        fechaInicial: joi.string().regex(/^\d{8,8}$/).required(),
        fechaFinal: joi.string().regex(/^\d{8,8}$/).required()
    });
    
    return {
        schemaFechas,
    }
})() ;

module.exports = schemasCocina;
