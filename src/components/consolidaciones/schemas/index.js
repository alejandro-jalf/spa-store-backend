const joi = require('joi');

// Esquemas para consolidaciones

const schemasConsolidaciones = (() => {
    const schemaFecha = joi.string().regex(/^\d{8,8}$/);

    const schemaBodyListCost = joi.array().items(
        joi.object({
            Article: joi.string().min(1).required(),
            CostoUnitario: joi.number().min(0).required()
        })
    )
    
    return {
        schemaFecha,
        schemaBodyListCost,
    }
})() ;

module.exports = schemasConsolidaciones;
