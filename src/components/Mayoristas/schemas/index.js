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

    const schemaUpdateMasivo = joi.object({
        data: joi.array().required(),
    });

    return {
        schemaFecha,
        schemaUpdateCosto,
        schemaUpdateMasivo,
    }
})() ;

module.exports = schemasReportes;
