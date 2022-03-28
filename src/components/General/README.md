## Componente de cocina

Componente para controlar las rutas relacionadas con la informacion general de Super Promociones

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/general/:empresa/conexiones/activas_ |  | Obtiene el estatus de las conexiones de los dyndns de la empresa |
| **GET** | _/api/v1/general/folios/:sucursal_ |  | Obtiene un calculo de los folios necesarios para terminar el mes entrante de una sucursal determinada |
| **PUT** | _/api/v1/general/folios/:sucursal_ |  | Actualiza los folios disponibles de una sucursal determinada |