## Componente de cocina

Componente para controlar el backend de la aplicacion de solicitud de articulos

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/solicitud/articulos_ | | Obtiene una lista de articulos solicitados como maximo 200 |
| **GET** | _/api/v1/solicitud/articulos/:uuid_ |  | Obtiene detalles de un articulo solicitado |
| **POST** | _/api/v1/solicitud/articulos/:sucursal_ | body = { CreadoPor: '' } | Crea una nueva solicitud de articulo |
| **PUT** | _/api/v1/solicitud/articulos/:uuid/update_ | body = { CodigoBarra: '', Nombre: '', IVA: 0, Ieps: 0, TazaIeps: 0.0, TipoModelo: '', Marca: '', Presentacion: '', UnidadMedida: '', UnidadCompra: '', FactorCompra, FactorCompra: 0.0, UnidadVenta: '', FactorVenta: 0.0, ActualizadoPor: '', } | Actualiza los datos de la solicitud |
| **PUT** | _/api/v1/solicitud/articulos/:uuid/status/:estatus_ | body = { Articulo: '00000000' } | Cambia el status de una determinada solicitud, estatus puede ser ('EN SUCURSAL', 'ENVIADO', 'EN PROCESO', 'ATENDIDO', 'CANCELADO'), Se envia query solo si es estatus atendido |
| **DELETE** | _/api/v1/solicitud/articulos/:uuid/delete_ | | Elimina una solicitud de articulo
 |