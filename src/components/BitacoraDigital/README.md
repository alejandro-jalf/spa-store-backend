## Componente de cocina

Componente para controlar la bitacora digital de Super Promociones

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/bitacoradigital/compras/last/:sucursal_ | query = { limit: 500 } | Obtiene los ultimos folios de bitacora por sucursal |
| **GET** | _/api/v1/bitacoradigital/compras/:sucursal_ | query = { fecha: Cadena de Texto 'YYYYMMDD' } | Obtiene los folios de una determinada fecha y una determinada sucursal |
| **GET** | _/api/v1/bitacoradigital/compras/consulta/folio/:folio_ |  | Obtiene los datos de un folio determinado |
| **GET** | _/api/v1/bitacoradigital/compras/consulta/id/:id_ |  | Obtiene los datos de un folio determinado |
| **GET** | _/api/v1/bitacoradigital/compras/generate/:sucursal/:fecha_ |  | Devuelve un nuevo Folio para bitacora |
| **GET** | _/api/v1/bitacoradigital/proveedores_ |  | Obtiene la lista de proveedores en la tabla de bitacora |
| **POST** | _/api/v1/bitacoradigital/compras_ | body = { Sucursal: '', Fecha: '', Folio: '', Proveedor: '', Subtotal: 0.0, descuento: 0.0, Ieps: 0.0, Iva: 0.0, Total: 0.0, Documento: '' } | Crea un nuevo registro en bitacora |
| **POST** | _/api/v1/bitacoradigital/compras/empty_ | body = { Sucursal: '', Fecha: '' } | Crea un nuevo folio vacio en bitacora |
| **PUT** | _/api/v1/bitacoradigital/compras/:uuid_ | body = { Proveedor: '', Subtotal: 0.0, descuento: 0.0, Ieps: 0.0, Iva: 0.0, Total: 0.0, Documento: '' } | Actualiza los datos de un registro de bitacora determinado |
| **PUT** | _/api/v1/bitacoradigital/compras/:uuid/estatus/:estatus_ |  | Actualiza el estatus de un registro de bitacora determinado |