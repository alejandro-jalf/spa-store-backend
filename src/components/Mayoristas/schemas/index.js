const joi = require('joi');

// Esquemas para reportes

const schemasReportes = (() => {
    const schemaFecha = joi.string().regex(/^\d{8,8}$/);

    const schemaUpdateCosto = joi.object({
        Articulo: joi.string().required(),
        Nombre: joi.string().required(),
        CantidadRegularUC: joi.number().required(),
        CantidadRegular: joi.number().required(),
        CostoValor: joi.number().required(),
        TotalPactado: joi.number().required(),
        Position: joi.number().required(),
    });

    return {
        schemaFecha,
        schemaUpdateCosto,
    }
})() ;

module.exports = schemasReportes;
