## Componente de cocina

Componente para controlar generar reportes en general de las tiendas de super promociones de acayucan

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/reportes/inventario/cierre/:sucursal/:tienda/:almacen_ |  | Obtiene un reporte del inventario de lo que hay en el sistema, por sucursal enviando almacen y tienda |
| **GET** | _/api/v1/reportes/ventas/:sucursal/_ | query = { FechaIni = 'YYYYMMDD', FechaFin = 'YYYYMMDD' } | Obtiene un reporte de las ventas hechas en una determinada sucursal, en una fecha especifica |
