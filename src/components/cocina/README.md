## Componente de cocina

Componente para controlar las rutas relacionadas con la informacion y acciones necesarias de la parte de cocina de Super Promociones

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/cocina/_ |  | Ruta principal del componente|
| **GET** | _/api/v1/cocina/ventas/:sucursal?fechaIni=yyyymmdd&fechaFin=yyyymmdd_ |  | Obtiene las ventas totales por dia en el rango establecido |
| **GET** | _/api/v1/cocina/ventas/:sucursal/detalles?fechaIni=yyyymmdd&fechaFin=yyyymmdd_ |  | Obtiene todas las ventas de cada dia en el rango establecido |