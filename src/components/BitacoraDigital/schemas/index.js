const joi = require('joi');

// Esquemas para rutas
const schemaFolio = joi.string().regex(/^\w{2,2}\d{10,10}$/);

const schemasGeneral = (() => {    
    return {
        schemaFolio,
    }
})() ;

module.exports = schemasGeneral;
