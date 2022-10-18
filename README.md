# spa-store-backend
Backend de aplicaciones de SPA

EndPoints


| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/articulos/:articulo/precio?sucursal=string_ |  | Obtiene el precio de algun articulo |
| **GET** | _/api/v1/articulos/utilidades/:sucursal?porcentajeUtilidad=int_ |  | Obtiene los articulos que esten por debajo del porcentaje de utilidad enviado |
| **GET** | _/api/v1/articulos/stocks?sucursal=string&company=string&daymin=int&daymax=int_ |  | Obtiene calculos de los stocks de todos los productos con movimientos por sucursal, y empresa(CAASA, SPA) |
| **GET** | _/api/v1/articulos/:nombre/existencias_ |  | Obtiene las existencias de los articulos, haciendo una busqueda por nombre |
| **GET** | _/api/v1/articulos/:sku/existencias/detalles?sucursal=string_ |  | Obtiene detalles de existencia de un articulo, buscandolo por sku |
| **GET** | _/api/v1/articulos/existencias/:sucursal/proveedor/:proveedor_ |  | Obtiene detalles de existencia de un articulo, buscandolo por sku |
| **GET** | _/api/v1/articulos/:barcode/codificador?sucursal=string_ |  | Obtiene detalles de existencia de un articulo, buscandolo por codigo de barras o codigo de articulo de una sucursal determinada |
| **PUT** | _/api/v1/articulos/stocks?sucursal=string&company=string_ | data: { updates }  | Actualiza los stocks de una determindad sucursal, y empresa(CAASA, SPA) |
|||||
| **GET** | _/api/v1/consolidaciones/:sucursal_ | { query: { fechaIni: "YYYYMMDD", fechaFin: "YYYYMMDD" } } | Obtiene las consolidaciones de una determinada sucursal en un lapso de tiempo especifico |
| **GET** | _/api/v1/consolidaciones/:sucursal/articulos/:documento_ |  | Obtiene los detalles de una transferencia en especifico |
|||||
| **GET** | _/api/v1/general/:empresa/conexiones/activas_ |  | Obtiene el estatus de las conexiones de los dyndns de la empresa |
| **GET** | _/api/v1/general/folios/:sucursal_ | query = { promMensual: Number }  | Obtiene un calculo de los folios necesarios para terminar el mes entrante de una sucursal determinada |
| **PUT** | _/api/v1/general/folios/:sucursal_ | query = { newFolio: Number } | Actualiza los folios disponibles de una sucursal determinada |
|||||
| **GET** | _/api/v1/ofertas/:sucursal/validas_ |  | Obtiene las ofertas actuales, ademas que trae datos de validacion de ofertas en cuanto a sus utilidades |
| **GET** | _/api/v1/ofertas/:sucursal/maestros_ |  | Obtiene todas las listas de ofertas maestros |
| **GET** | _/api/v1/ofertas/:sucursal/articulos/:articulo_ |  | Obtiene detalles de un articulo por codigo de articulo o de barras |
| **GET** | _/api/v1/ofertas/:sucursal/articulos/:name/details_ |  | Obtiene detalles de varios articulos buscandolo por nombre |
| **GET** | _/api/v1/ofertas/:sucursal/articulos/validos/:uuidmaster_ |  | Realiza una validacion de los articulos en una determinada lista de ofertas, para saber si se pueden programar en wincaja |
| **GET** | _/api/v1/ofertas/:sucursal/articulos/:uuidmaster_ |  | Obtiene las lista de los articulos por el uuid de las ofertas maestro |
| **GET** | _/api/v1/ofertas/:sucursal/articulos/:uuidmaster/check_ |  | Obtiene una validacion para corroborar que las ofertas estan programadas |
| **POST** | _/api/v1/ofertas/:sucursal/maestros_ |  | Crea una lista de ofertas |
| **POST** | _/api/v1/ofertas/:sucursal/articulos_ |  | Agrega un articulo a las ofertas |
| **PUT** | _/api/v1/ofertas/:sucursal/maestros/:uuidmaster/status_ |  | Modifica el status de una lista de las ofertas |
| **PUT** | _/api/v1/ofertas/:sucursal/maestros/:uuidmaster_ |  | Modifica la lista de las ofertas |
| **PUT** | _/api/v1/ofertas/:sucursal/articulos/:articulo_ |  | Modifica un articulo de la oferta |
| **DELETE** | _/api/v1/ofertas/:sucursal/maestros/:uuidmaster_ |  | Elimina una lista de ofertas |
| **DELETE** | _/api/v1/ofertas/:sucursal/articulos/:articulo_ |  | Elimina un articulo de la oferta |
|||||
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
|||||
| **GET** | _/api/v1/proveedores_ |  | Obtiene Nombre e Id de los proveedores existentes |
|||||
| **GET** | _/api/v1/reportes/inventario/cierre/:sucursal/:tienda/:almacen_ |  | Obtiene un reporte del inventario de lo que hay en el sistema, por sucursal enviando almacen y tienda |
| **GET** | _/api/v1/reportes/ventas/:sucursal/_ | query = { FechaIni = 'YYYYMMDD', FechaFin = 'YYYYMMDD' } | Obtiene un reporte de las ventas hechas en una determinada sucursal, en una fecha especifica |
|||||
| **GET** | _/api/v1/trabajadores/asistencias/:sucursal?fechaini=string&fechafin=string&empresa=string_ |  | Obtiene las asistencias de una determinada sucursal |
