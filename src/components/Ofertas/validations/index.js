const { 
    schemaCreateArticle,
    schemaCreateMasterOffer,
    schemaDate,
    schemaUpdateArticle,
    schemaUpdateMasterOffer,
    schemaUpdateStatusMasterOffer,
} = require('../schemas');
const {
    createContentAssert,
    createContentError,
    toMoment,
    getDateActual,
} = require('../../../utils');

const validationOfertas = (() => {
    const validateSucursal = (sucursal = '') => {
        if (
            sucursal.toUpperCase() !== 'ZR' &&
            sucursal.toUpperCase() !== 'VC' &&
            sucursal.toUpperCase() !== 'OU' &&
            sucursal.toUpperCase() !== 'JL' &&
            sucursal.toUpperCase() !== 'ER' &&
            sucursal.toUpperCase() !== 'BO' &&
            sucursal.toUpperCase() !== 'ALL'
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
            
        const dateinit = toMoment(bodyCreateMaster.fechaInicio.replace('z', ''));
        if (dateinit.isBefore(getDateActual()))
            return createContentError('La fecha de inicio no puede ser menor que la fecha actual')

        if (dateinit.isAfter(bodyCreateMaster.fechaFin.replace('z', '')))
            return createContentError('La fecha de inicio no puede ser mayor que la fecha de termino')

        resultValidate = validateSucursal(bodyCreateMaster.sucursal);
        if (!resultValidate.success) return resultValidate;

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

        const dateinit = toMoment(bodyUpdateMaster.fechaInicio.replace('z', ''));
        if (dateinit.isBefore(getDateActual()))
            return createContentError('La fecha de inicio no puede ser menor que la fecha actual')

        if (dateinit.isAfter(bodyUpdateMaster.fechaFin.replace('z', '')))
            return createContentError('La fecha de inicio no puede ser mayor que la fecha de termino')
        
        return createContentAssert('Datos validos');
    }

    const validateStatus = (statusNew, statusActual, utilsOfertas) => {
        if (statusActual === 4 || statusActual === 0) {
            if (statusActual === 4 && statusNew !== 0)
                return createContentError(
                    `No puede cambiar el estatus a "${utilsOfertas.parseStatusOferta(statusNew)}" debido a que se encuentra actualmente como "${utilsOfertas.parseStatusOferta(statusActual)}"`
                );
            else if (statusActual === 0 && (statusNew !== 4 && statusNew !== 1))
                return createContentError(
                    `No puede cambiar el estatus a "${utilsOfertas.parseStatusOferta(statusNew)}" debido a que se encuentra actualmente como "${utilsOfertas.parseStatusOferta(statusActual)}"`
                );
        } else if (statusNew >= 0 && statusNew <= 4) {
            if ((statusNew) !== (statusActual + 1) || (statusNew === 4 && statusActual === 3))
                return createContentError(
                    `No puede cambiar el estatus a "${utilsOfertas.parseStatusOferta(statusNew)}" debido a que se encuentra actualmente como "${utilsOfertas.parseStatusOferta(statusActual)}"`
                );
        } else {
            return createContentError(
                `No puede cambiar el estatus a "${utilsOfertas.parseStatusOferta(statusNew)}", envio un estatus invalido`
            );
        }
        return createContentAssert('Estatus validos')
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
        validateStatus,
    }
})();

module.exports = validationOfertas;
