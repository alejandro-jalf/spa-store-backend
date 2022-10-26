const joi = require('joi');

// Esquemas para reportes

const schemasReportes = (() => {
    const schemaFecha = joi.string().regex(/^\d{8,8}$/);
    
    return {
        schemaFecha,
    }
})() ;

module.exports = schemasReportes;
