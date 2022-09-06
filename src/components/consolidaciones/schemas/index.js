const joi = require('joi');

// Esquemas para consolidaciones

const schemasConsolidaciones = (() => {
    const schemaFecha = joi.string().regex(/^\d{8,8}$/);
    
    return {
        schemaFecha,
    }
})() ;

module.exports = schemasConsolidaciones;
