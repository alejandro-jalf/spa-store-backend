## Componente de cocina

Componente para controlar las rutas relacionadas con la informacion y acciones necesarias de la parte de proveedores de Super Promociones

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/proveedores_ |  | Obtiene Nombre e Id de los proveedores existentes |

#### SolicitudProveedores

| **Campo** | **Tipo** | **Tamaño** | **Descripcion** |
|-----------|----------|------------|-----------------|
| UUID | nvarchar | 100 | primary key |
| CuentaContabilidad | nvarchar | 20 | |
| CuentaWinCaja | nvarchar | 35 | |
| Nombre | nvarchar | 200 | |
| RFC | nvarchar | 30 |  |
| Direccion | nvarchar | 200 | |
| Telefono | nvarchar | 20 |  |
| Correo | nvarchar | 50 |  |
| Estatus | nvarchar | 20 |  |
| FechaCreado | datetime | | |
| CreadoPor | nvarchar | 50 | |
| FechaEnviado | datetime | | |
| FechaAtendido | datetime | |  |

#### script sql

```sql
CREATE TABLE SolicitudProveedores(
    UUID nvarchar(100) DEFAULT NEWID(),
    Sucursal nvarchar(3),
    Consecutivo int,
    CuentaContabilidad nvarchar(20),
    CuentaWinCaja nvarchar(35),
    Nombre nvarchar(200),
    RFC nvarchar(30),
    Direccion nvarchar(200),
    Telefono nvarchar(20),
    Correo nvarchar(50),
    Estatus nvarchar(20),
    FechaCreado datetime DEFAULT GETDATE(),
    CreadoPor nvarchar(50),
    FechaEnviado datetime DEFAULT GETDATE(),
    FechaAtendido datetime DEFAULT GETDATE()
);
```
