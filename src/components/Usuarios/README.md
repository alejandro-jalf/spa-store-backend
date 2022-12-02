# usersSpa
Api rest simple para el logueo de usuarios de la aplicacion de super promociones de acayucan, la aplicacion se escribira a partir de la libreria de express js, la cual nos brinda la facilidad de crear un servidor http. Y con la cual se podra desarrollar la api rest.

## Tecnologias a implementar
- postgres sql
- javascript

## Estructura de la base de datos

| **Campo** | **Tipo** | **Tamaño** | **Descripcion** |
|-----------|----------|------------|-----------------|
| nombre_user | varchar | 35 | |
| apellido_p_user | varchar | 35 | |
| apellido_m_user | varchar | 35 | |
| direccion_user | varchar | 100 | |
| sucursal_user | varchar | 20 | |
| correo_user | varchar | 70 | primary key |
| password_user | varchar | 150 | |
| recovery_code_user | varchar | 50 | default 'empty' |
| tipo_user | varchar | 10 | only('invited', 'manager', 'executive') |
| access_to_user | text | | Texto divido por comas, simulando un array |
| activo_user | boolean | | |
| principal | varchar(100) | | Marca la pagina que se abrira primero |

## Estructura de la api rest

### Ruta base de la api

_https://...._

### Rutas de la api

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|-----------|----------|------------|-----------------|
| **GET** | api/v1 | | Ruta principal, mensaje de bienvenida |
| **GET** | api/v1/usuarios | | Obtiene todos los datos almacenandos en base de datos |
| **GET** | api/v1/usuarios/:correo_user | | Obtiene un usuario determinado |
| **POST** | api/v1/usuarios | { nombre_user: '', apellido_p_user: '', apellido_m_user: '', direccion_user: '', sucursal_user: '', correo_user: '', password_user: '', tipo_user: '', access_to_user: '' } | Crea un nuevo usuario |
| **POST** | api/v1/usuarios/:correo_user/login | { password_user: '' } | Verifica el logueo de un usuario |
| **PUT** | api/v1/usuarios/:correo_user | { nombre_user: '', apellido_p_user: '', apellido_m_user: '', direccion_user: '', sucursal_user: '', correo_user: '', tipo_user: '', access_to_user: '', activo_user: true } | Modifica los datos de un usuario determinado |
| **PUT** | api/v1/usuarios/:correo_user/general | { nombre_user: '', apellido_p_user: '', apellido_m_user: '', direccion_user: '' } | Modifica los datos generales del usuario |
| **PUT** | api/v1/usuarios/:correo_user/email | { new_correo_user: '', password_user: '' } | Actualiza la direccion de correo electronico de un usuario |
| **PUT** | api/v1/usuarios/:correo_user/password | { password_user: '', new_password_user: '' } | Modifica la contraseña actual del usuario |
| **PUT** | api/v1/usuarios/:correo_user/recovery | | Recupera la cuenta de un usuario |
| **PUT** | api/v1/usuarios/:correo_user/status | { activo_user: true } | Cambia el status de un usuario puede enviar true o false |
| **DELETE** | api/v1/usuarios/:correo_user | | Elimina un usuario |
