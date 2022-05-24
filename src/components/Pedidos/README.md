## Componente de cocina

Componente para controlar el backend de la aplicacion de pedidos

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/pedidos/:sucursal/sujerido_ | | Obtiene una lista de articulos sujeridos para solicitar a bodega |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio/articulos/:articulo_ | query = { database = '', source = '' } | Obtiene la lista de los articulos haciendo una busqueda por articulo |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio/nombres/:nombre_ | query = { database = '', source = '' } | Obtiene la lista de los articulos haciendo una busqueda por nombre |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio/dias/:dias_ | query = { database = '', source = '' } | Obtiene la lista de los articulos haciendo una busqueda por dias atras |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio_ | query = { database = '', source = '' } | Obtiene la lista de los articulos de determinada sucursal y folio |
| **GET** | _/api/v1/pedidos/detalles/:sucursal/:folio/reporte_ | query = { database = '', source = '' } | Obtiene un reporte de los articulos de determinada sucursal y folio |
| **GET** | _/api/v1/pedidos/maestros/:sucursal_ | query = { database = '', source = '' } | Obtiene los pedidos de determinada sucursal |
| **GET** | _/api/v1/pedidos/maestros_ | query = { database = '', source = '' }  | Obtiene los pedidos en donde su Estatus sea distinto de en sucursal o cancelado |
| **POST** | _/api/v1/pedidos/maestros/:sucursal_ | query = { database = '', source = '' } | Agrega un pedido a una determinada sucursal |
| **POST** | _/api/v1/pedidos/detalles/:articulo_ | body = { pedido: '', sucursal: '', PeCaja:0.0, PePieza: 0.0 } query = { database = '', source = '' }  | Agrega o actualiza un articulo en detallesPedidos |
| **PUT** | _/api/v1/pedidos/maestros/:sucursal/:folio/:estatus_ | query = { entrada: '', salida: '', database = '', source = '' } | cambia el status de una determinada sucursal, query "entrada" y "salida" solo son necesarios para estatus atendido, estatus puede ser ('PEDIDO CANCELADO', 'PEDIDO EN PROCESO', 'PEDIDO ENVIADO', 'PEDIDO ATENDIDO') |