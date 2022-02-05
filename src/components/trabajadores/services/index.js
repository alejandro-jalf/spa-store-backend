const {
    createResponse,
    getConnectionFrom,
    createContentError,
    getSucursalByCategory,
} = require('../../../utils');
const { validateSucursal, validateDate } = require('../validations');
const { getAsistenciasBySucursal } = require('../models');
const moment = require('moment')

const ServicesTrabajadores = (() => {
    
    const getAllAssists = async (sucursal, fechaini, fechafin, empresa = 'SPA') => {
        let validate = validateSucursal(sucursal);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(fechaini);
        if (!validate.success)
            return createResponse(400, validate);

        validate = validateDate(fechafin);
        if (!validate.success)
            return createResponse(400, validate);

        empresa = empresa.trim().toUpperCase()
        const sucursalUtils = empresa === 'CAASA' ? empresa + sucursal : sucursal
        const conexion = getConnectionFrom(getSucursalByCategory(sucursalUtils));
        if (conexion === null) return createResponse(400, createContentError('Verifique que la sucursal pertenesca a la empresa'))
        const response  = await getAsistenciasBySucursal(conexion, sucursal, fechaini, fechafin);

        if (!response.success) return createResponse(400, response)

        const dataRefactor = response.data.reduce((acumData, dato) => {
          const existName = acumData.find((dataByName) => dataByName.nombre === dato.Nombre)
          let dateFinded = null;
          if (existName) {
            dateFinded = existName.asistencias.findIndex((asis) => asis.fecha === moment(dato.FechaServer).format('DD/MM/yyyy'))
          }
          if (!existName) {acumData.push({
            nombre: dato.Nombre,
            asistencias: [
              {
                fecha: moment(dato.FechaServer).format('DD/MM/yyyy'),
                entrada: dato.Estatus === 'ENTRADA DIA' ? dato.FechaServer : '',
                scomida: dato.Estatus === 'SALIDA COMIDA' ? dato.FechaServer : '',
                ecomida: dato.Estatus === 'ENTRADA COMIDA' ? dato.FechaServer : '',
                salida: dato.Estatus === 'SALIDA DIA' ? dato.FechaServer : '',
              }
            ]
            })
          }
          else if (
            dateFinded !== null && dateFinded !== -1
          ) {
            if (dato.Estatus === 'ENTRADA DIA' && existName.asistencias[dateFinded].entrada === '')
              existName.asistencias[dateFinded].entrada = dato.FechaServer
            if (dato.Estatus === 'SALIDA COMIDA')
              existName.asistencias[dateFinded].scomida = dato.FechaServer
            if (dato.Estatus === 'ENTRADA COMIDA' && existName.asistencias[dateFinded].ecomida === '')
              existName.asistencias[dateFinded].ecomida = dato.FechaServer
            if (dato.Estatus === 'SALIDA DIA')
              existName.asistencias[dateFinded].salida = dato.FechaServer
          } else {
            existName.asistencias.push({
              fecha: moment(dato.FechaServer).format('DD/MM/yyyy'),
              entrada: dato.Estatus === 'ENTRADA DIA' ? dato.FechaServer : '',
              scomida: dato.Estatus === 'SALIDA COMIDA' ? dato.FechaServer : '',
              ecomida: dato.Estatus === 'ENTRADA COMIDA' ? dato.FechaServer : '',
              salida: dato.Estatus === 'SALIDA DIA' ? dato.FechaServer : '',
            })
          }
          return acumData
        }, [])
        response.data = dataRefactor

        return createResponse(200, response)
    }

    return {
        getAllAssists,
    }
})();

module.exports = ServicesTrabajadores;