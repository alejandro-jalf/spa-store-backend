## Componente de cocina

Componente para controlar las rutas relacionadas con la informacion y acciones necesarias de la parte de trabajadores de Super Promociones y de central abarrotera, esto puede incluir los trabajadores que existen asi como sus asistencias y huellas digitales

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/trabajadores/asistencias/:sucursal?fechaini=string&fechafin=string&empresa=string_ |  | Obtiene las asistencias de una determinada sucursal |
| **GET** | _/api/v1/trabajadores/:sucursal_ |  | Obtiene la lista de todos los trabajadores registrados |
| **GET** | _/api/v1/trabajadores/claves/:sucursal/:cajero_ |  | Obtiene la clave del trabajador |
| **POST** | _/api/v1/trabajadores/asistencias/:sucursal/:cajero/:estatus_ |  | Registra una asistencia del trabajador |
| **POST** | _/api/v1/trabajadores/claves/:sucursal_ | body = { Cajero: '', Clave: '', IdTrabajador: '' } | Registra la clave del trabajador |
| **PUT** | _/api/v1/trabajadores/claves/:sucursal/:cajero_ | body = { Clave: '' } | Actualiza la clave del trabajador |
| **PUT** | _/api/v1/trabajadores/claves/:sucursal/:cajero/IdTrabajador_ | body = { IdTrabajador: '' } | Actualiza el id del trabajador |