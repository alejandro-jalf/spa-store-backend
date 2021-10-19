const joi = require('joi');

const schemasOfertas = (() => {
    // 2021-08-24T05:00:00.000z
    const schemaDate = joi.string().regex(/^\d{4,4}-\d{2,2}-\d{2,2}T\d{2,2}:\d{2,2}:\d{2,2}.000z$/);

    const schemaCreateMasterOffer = joi.object({
        sucursal: joi.string().max(10).min(2).required(),
        status: joi.number().min(0).max(7).required(),
        editable: joi.boolean().required(),
        tipoOferta: joi.string().min(2).required(),
        fechaInicio: joi.string().min(2).required(),
        fechaFin: joi.string().min(2).required(),
        descripcion: joi.string().empty().required(),
        creadoPor: joi.string().required(),
    })

    const schemaUpdateMasterOffer = joi.object({
        status: joi.number().min(0).max(7),
        editable: joi.boolean(),
        tipoOferta: joi.string().min(2),
        fechaInicio: joi.string().min(2),
        fechaFin: joi.string().min(2),
        descripcion: joi.string().empty(),
        modificadoPor: joi.string().required(),
    })

    const schemaUpdateStatusMasterOffer = joi.object({
        status: joi.number().min(0).max(7).required(),
        modificadoPor: joi.string().required(),
    })

    const schemaCreateArticle = joi.object({
        uuid_maestro: joi.string().min(2).required(),
        articulo: joi.string().min(1).required(),
        nombre: joi.string().min(2).required(),
        costo: joi.number().required(),
        descripcion: joi.string().min(2).required(),
        precio: joi.number().required(),
        oferta: joi.number().required(),
        creadoPor: joi.string().min(2).required(),
    })

    const schemaUpdateArticle = joi.object({
        nombre: joi.string().min(2),
        costo: joi.number(),
        descripcion: joi.string().min(2),
        precio: joi.number(),
        oferta: joi.number(),
        modificadoPor: joi.string().min(2).required(),
    })

    return {
        schemaUpdateStatusMasterOffer,
        schemaCreateMasterOffer,
        schemaUpdateMasterOffer,
        schemaDate,
        schemaCreateArticle,
        schemaUpdateArticle,
    }
})() ;

module.exports = schemasOfertas;
