## Componente de cocina

Componente para controlar el backend de la aplicacion de pedidos

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/pedidos/maestros_ | query = { database = '' }  | Obtiene los pedidos en donde su Estatus sea distinto de en sucursal o cancelado |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio/articulo/:articulo_ | query = { database = '' } | Obtiene la lista de los articulos haciendo una busqueda por articulo |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio/nombre/:nombre_ | query = { database = '' } | Obtiene la lista de los articulos haciendo una busqueda por nombre |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio/dias/:dias_ | query = { database = '' } | Obtiene la lista de los articulos haciendo una busqueda por dias atras |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio_ | query = { database = '' } | Obtiene la lista de los articulos de determinada sucursal y folio |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio/reporte_ | query = { database = '' } | Obtiene un reporte de los articulos de determinada sucursal y folio |
| **GET** | _/api/v1/pedidos/maestros/:sucursal_ | query = { database = '' } | Obtiene los pedidos de determinada sucursal |
| **POST** | _/api/v1/pedidos/maestros/:sucursal_ | query = { database = '' } | Agrega un pedido a una determinada sucursal |
| **POST** | _/api/v1/pedidos/detalles/:articulo_ | body = { pedido: '', sucursal: '', PeCaja:0.0, PePieza: 0.0 } query = { database = '' }  | Agrega o actualiza un articulo en detallesPedidos |
| **PUT** | _/api/v1/pedidos/maestros/:sucursal/:folio/:estatus_ | query = { entrada: '', salida: '', database = '' } | cambia el status de una determinada sucursal, query "entrada" y "salida" solo son necesarios para estatus atendido, estatus puede ser ('PEDIDO CANCELADO', 'PEDIDO EN PROCESO', 'PEDIDO ENVIADO', 'PEDIDO ATENDIDO') |