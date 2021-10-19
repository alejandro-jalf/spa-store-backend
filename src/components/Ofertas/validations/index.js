const { 
    schemaCreateArticle,
    schemaCreateMasterOffer,
    schemaDate,
    schemaUpdateArticle,
    schemaUpdateMasterOffer,
    schemaUpdateStatusMasterOffer,
} = require('../schemas');
const { createContentAssert, createContentError } = require('../../../utils');

const validationOfertas = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'BO'
        ) return createContentError('La sucursal no es valida');
        return createContentAssert('Sucursal valida');
    }

    const validateBodyCreateMasterOffer = (bodyCreateMaster) => {
        let resultValidate = schemaCreateMasterOffer.validate(bodyCreateMaster);
        if (resultValidate.error)
            return createContentError('Algun dato fue enviado de manera incorrecta', resultValidate.error)
        
        resultValidate = schemaDate.validate(bodyCreateMaster.fechaInicio);
        if (resultValidate.error)
            return createContentError(
                'La fecha de inicio no tiene el formato correcto 0000-00-00T00:00:00.000z',
                resultValidate.error
            )
        
        resultValidate = schemaDate.validate(bodyCreateMaster.fechaFin);
        if (resultValidate.error)
            return createContentError(
                'La fecha de termino no tiene el formato correcto 0000-00-00T00:00:00.000z',
                resultValidate.error
            )
        
        return createContentAssert('Datos validos');
    }

    const validateBodyUpdateMasterOffer = (bodyUpdateMaster) => {
        let resultValidate = schemaUpdateMasterOffer.validate(bodyUpdateMaster);
        if (resultValidate.error)
            return createContentError('Algun dato fue enviado de manera incorrecta', resultValidate.error)
        
        resultValidate = schemaDate.validate(bodyUpdateMaster.fechaInicio);
        if (resultValidate.error)
            return createContentError(
                'La fecha de inicio no tiene el formato correcto 0000-00-00T00:00:00.000z',
                resultValidate.error
            )
        
        resultValidate = schemaDate.validate(bodyUpdateMaster.fechaFin);
        if (resultValidate.error)
            return createContentError(
                'La fecha de termino no tiene el formato correcto 0000-00-00T00:00:00.000z',
                resultValidate.error
            )
        
        return createContentAssert('Datos validos');
    }
    
    const validateBodyUpdateStatusMasterOffer = (bodyMaster) => {
        let resultValidate = schemaUpdateStatusMasterOffer.validate(bodyMaster);
        if (resultValidate.error)
            return createContentError('Algun dato fue enviado de manera incorrecta', resultValidate.error)

        return createContentAssert('Datos validos');
    }
    
    const validateBodyCreateArticle = (bodyArticle) => {
        let resultValidate = schemaCreateArticle.validate(bodyArticle);
        if (resultValidate.error)
            return createContentError('Algun dato fue enviado de manera incorrecta', resultValidate.error)

        return createContentAssert('Datos validos');
    }
    
    const validateBodyUpdateArticle = (bodyArticle) => {
        let resultValidate = schemaUpdateArticle.validate(bodyArticle);
        if (resultValidate.error)
            return createContentError('Algun dato fue enviado de manera incorrecta', resultValidate.error)

        return createContentAssert('Datos validos');
    }

    return {
        validateSucursal,
        validateBodyCreateMasterOffer,
        validateBodyUpdateMasterOffer,
        validateBodyUpdateStatusMasterOffer,
        validateBodyCreateArticle,
        validateBodyUpdateArticle,
    }
})();

module.exports = validationOfertas;
