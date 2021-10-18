## Componente de cocina

Componente para controlar las rutas relacionadas con la informacion y acciones necesarias de ofertas de Super Promociones

### Estructura de las tablas

Las tablas para programar las ofertas estaran conformadas por dos:

#### maestroofertas

| **Campo** | **Tipo** | **Tamaño** | **Descripcion** |
|-----------|----------|------------|-----------------|
| uuid | varchar | 100 | primary key |
| sucursal | varchar | 5 |  |
| status | int | | 0: Pendiente, 1: En proceso, 3: Programada, 4: cancelada |
| editable | boolean | |  |
| tipoOferta | varchar | 200 |  |
| fechaInicio | date | |  |
| fechaFin | date | |  |
| descripcion | varchar | 200 |  |
| fechaAlta | date | |  |
| creadoPor | varchar | 100 |  |
| fechaModificado | date | |  |
| modificadoPor | varchar | 100 |  |

#### articulosoferta

| **Campo** | **Tipo** | **Tamaño** | **Descripcion** |
|-----------|----------|------------|-----------------|
| uuid_maestro | varchar | 100 | foreign key |
| articulo | varchar | 10 |  |
| nombre | varchar | 150 | |
| costo | float | |  |
| descripcion | varchar | 150 |  |
| precio | float | | |
| oferta | float | 200 |  |
| fechaAlta | date | |  |
| creadoPor | varchar | 100 |  |
| fechaModificado | date | |  |
| modificadoPor | varchar | 100 |  |

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/ofertas/:sucursal/validas_ |  | Obtiene las ofertas actuales, ademnas que trae datos de validacion de ofertas en cuanto a sus utilidades |
| **GET** | _/api/v1/ofertas/maestros_ |  | Obtiene todas las listas de ofertas |
| **GET** | _/api/v1/ofertas/articulos/:uuidmaster_ |  | Obtiene las lista de los articulos por el uuid de las ofertas maestro |
| **POST** | _/api/v1/ofertas/maestros_ |  | Crea una lista de ofertas |
| **POST** | _/api/v1/ofertas/articulos_ |  | Agrega un articulo a las ofertas |
| **PUT** | _/api/v1/ofertas/maestros/:uuidmaster/status_ |  | Modifica el status de una lista de las ofertas |
| **PUT** | _/api/v1/ofertas/maestros/:uuidmaster_ |  | Modifica la lista de las ofertas |
| **PUT** | _/api/v1/ofertas/articulos/:articulo_ |  | Modifica un articulo de la oferta |
| **DELETE** | _/api/v1/ofertas/maestros/:uuidmaster_ |  | Elimina una lista de ofertas |
| **DELETE** | _/api/v1/ofertas/articulos/:articulo_ |  | Elimina un articulo de la oferta |