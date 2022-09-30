## Componente de cocina

Componente para controlar las rutas relacionadas con la informacion y acciones necesarias de ofertas de Super Promociones

### Estructura de las tablas

Las tablas para programar las ofertas estaran conformadas por dos:

#### maestroofertas

| **Campo** | **Tipo** | **Tamaño** | **Descripcion** |
|-----------|----------|------------|-----------------|
| uuid | varchar | 100 | primary key |
| sucursal | varchar | 10 |  |
| status | int | | 0: Creada, 1: Enviada, 2: En revision, 3: Programada, 4: cancelada |
| editable | boolean | |  |
| tipoOferta | varchar | 200 |  |
| fechaInicio | date | |  |
| fechaFin | date | |  |
| descripcion | varchar | 200 |  |
| fechaAlta | date | |  |
| creadoPor | varchar | 100 |  |
| fechaModificado | date | |  |
| modificadoPor | varchar | 100 |  |

```sql
CREATE TABLE MaestroOfertas(
    uuid NVARCHAR(100) PRIMARY KEY,
    sucursal NVARCHAR(10) NOT NULL,
    estatus INT NOT NULL,
    editable BIT NOT NULL,
    tipoOferta NVARCHAR(200) NOT NULL,
    fechaInicio DATETIME NOT NULL,
    fechaFin DATETIME NOT NULL,
    descripcion NVARCHAR(200) NOT NULL,
    fechaAlta DATETIME NOT NULL,
    creadoPor NVARCHAR(100) NOT NULL,
    fechaModificado DATETIME NOT NULL,
    modificadoPor NVARCHAR(100) NOT NULL,
)
```

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

```sql
CREATE TABLE ArticulosOferta(
    uuid_maestro NVARCHAR(100),
    articulo NVARCHAR(10) NOT NULL,
    nombre NVARCHAR(150) NOT NULL,
    costo float NOT NULL,
    descripcion NVARCHAR(150) NOT NULL,
    precio float NOT NULL,
    oferta float NOT NULL,
    fechaAlta DATETIME NOT NULL,
    creadoPor NVARCHAR(100) NOT NULL,
    fechaModificado DATETIME NOT NULL,
    modificadoPor NVARCHAR(100) NOT NULL,
    PRIMARY KEY(uuid_maestro, articulo),
    CONSTRAINT FK_UUID_ARTICULOOFERTA FOREIGN KEY(uuid_maestro) REFERENCES MaestroOfertas(uuid) ON DELETE NO ACTION ON UPDATE CASCADE
)
```

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
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