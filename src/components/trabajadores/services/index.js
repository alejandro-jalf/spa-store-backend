const {
    createResponse,
    getConnectionFrom,
    createContentError,
    getSucursalByCategory,
    cifraData,
    descifraData,
} = require('../../../utils');
const { validateSucursal, validateDate, validateEstatus } = require('../validations');
const {
  getAsistenciasBySucursal,
  getTrabajadores,
  getClave,
  registerAsistencia,
  createClave,
  updateClave,
  updateIdTrabajador
} = require('../models');
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
        if (!conexion) return createResponse(400, createContentError('No se encontro la conexion para la base de datos'))
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

    const getAllTrabajadores = async (sucursal) => {
      const conexion = getConnectionFrom(sucursal);
      const response = await getTrabajadores(conexion);

      if (!response.success) return createResponse(400, response);
      return createResponse(200, response);
    }

    const getClaveTrabajador = async (sucursal, cajero) => {
      const conexion = getConnectionFrom(sucursal);
      const response = await getClave(conexion, cajero);

      if (!response.success) return createResponse(400, response);
      if (response.data.length === 0)
        return createResponse(200, createContentError('No existe clave para el cajero ' + cajero));
      response.data[0].Clave = descifraData(response.data[0].Clave);
      return createResponse(200, response);
    }

    const registerAsistenciaTrabajador = async (sucursal, cajero, clave, estatus) => {
      let validate = validateEstatus(estatus);
      if (!validate.success) return createResponse(400, validate);
      if (!clave) return createResponse(200, createContentError('Falta la clave del cajero'));

      const conexion = getConnectionFrom(sucursal);
      
      let response = await getClave(conexion, cajero.trim());
      if (!response.success) return createResponse(400, response);
      if (response.data.length === 0)
        return createResponse(200, createContentError('No se encontro clave para el cajero ' + cajero));
        
      const cifrado = cifraData(clave.trim());
      if (cifrado !== response.data[0].Clave)
        return createResponse(200, createContentError('Contraseña incorrecta'));
      
      response = await registerAsistencia(conexion, response.data[0].IdTrabajador, estatus.toUpperCase());
      if (!response.success) return createResponse(400, response);

      return createResponse(200, response);
    }

    const addClaveTrabajador = async (sucursal, Clave, Cajero, IdTrabajador) => {
      const conexion = getConnectionFrom(sucursal);

      const cifrado = cifraData(Clave.trim());
      
      response = await createClave(conexion, IdTrabajador, Cajero, cifrado);
      if (!response.success) return createResponse(400, response);

      return createResponse(200, response);
    }

    const updateClaveTrabajador = async (sucursal, Clave, Cajero) => {
      const conexion = getConnectionFrom(sucursal);

      let response = await getClave(conexion, Cajero.trim());
      if (!response.success) return createResponse(400, response);
      if (response.data.length === 0)
        return createResponse(200, createContentError('No se encontro clave para el cajero ' + Cajero));

      const cifrado = cifraData(Clave.trim());
      response = await updateClave(conexion, Cajero, cifrado);
      if (!response.success) return createResponse(400, response);

      return createResponse(200, response);
    }

    const updateIdTrabajadorForClave = async (sucursal, IdTrabajador, Cajero) => {
      const conexion = getConnectionFrom(sucursal);

      let response = await getClave(conexion, Cajero.trim());
      if (!response.success) return createResponse(400, response);
      if (response.data.length === 0)
        return createResponse(200, createContentError('No se encontro clave para el cajero ' + Cajero));

      response = await updateIdTrabajador(conexion, Cajero, IdTrabajador);
      if (!response.success) return createResponse(400, response);

      return createResponse(200, response);
    }

    return {
        getAllAssists,
        getAllTrabajadores,
        getClaveTrabajador,
        registerAsistenciaTrabajador,
        addClaveTrabajador,
        updateClaveTrabajador,
        updateIdTrabajadorForClave,
    }
})();

module.exports = ServicesTrabajadores;