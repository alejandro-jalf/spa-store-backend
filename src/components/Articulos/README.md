## Componente de cocina

Componente para controlar las rutas relacionadas con la informacion y acciones necesarias de la parte de articulos de Super Promociones

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/articulos/:articulo/precio?sucursal=string_ |  | Obtiene el precio de algun articulo |
| **GET** | _/api/v1/articulos/utilidades/:sucursal?porcentajeUtilidad=int_ |  | Obtiene los articulos que esten por debajo del porcentaje de utilidad enviado |
| **GET** | _/api/v1/articulos/stocks?sucursal=string&company=string&daymin=int&daymax=int_ |  | Obtiene calculos de los stocks de todos los productos con movimientos por sucursal, y empresa(CAASA, SPA) |
| **GET** | _/api/v1/articulos/:nombre/existencias_ |  | Obtiene las existencias de los articulos, haciendo una busqueda por nombre |
| **GET** | _/api/v1/articulos/:sku/existencias/detalles?sucursal=string_ |  | Obtiene detalles de existencia de un articulo, buscandolo por sku |
| **GET** | _/api/v1/articulos/:barcode/codificador?sucursal=string_ |  | Obtiene detalles de existencia de un articulo, buscandolo por codigo de barras o codigo de articulo de una sucursal determinada |
| **PUT** | _/api/v1/articulos/stocks?sucursal=string&company=string_ | data: { updates }  | Actualiza los stocks de una determindad sucursal, y empresa(CAASA, SPA) |