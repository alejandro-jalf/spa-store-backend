## Componente de cocina

Componente obtener datos de mayoristas

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/mayoristas/:sucursal/compra/:documento_ |  | Obtiene una compra capturada para comparar |
| **GET** | _/api/v1/mayoristas/:sucursal/orden/:consecutivo_ |  | Obtiene una orden de compra capturada para comparar |
| **PUT** | _/api/v1/mayoristas/:sucursal/orden/:consecutivo_ | body: { Articulo, Nombre, CantidadRegularUC, CantidadRegular, CostoValor, TotalPactado, Position } | Modifica el costo de un articulo de una orden de compra determinada |
