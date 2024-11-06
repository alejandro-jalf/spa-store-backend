## Componente de cocina

Componente para controlar el backend de la aplicacion de solicitud de articulos

### Rutas del componente

| **Metodo** | **Ruta** | **Request** | **Descripcion** |
|------------|----------|-------------|-----------------|
| **GET** | _/api/v1/inventarioscea/departamentos_ | | Obtiene una lista de los departamentos registrados |
| **GET** | _/api/v1/inventarioscea/departamentos/:codigo_ | | Obtiene un departamento en especifico |
| **GET** | _/api/v1/inventarioscea/sucursales_ | | Obtiene una lista de las sucursales registradas |
| **GET** | _/api/v1/inventarioscea/sucursales/:codigo_ | | Obtiene una sucursale registrada |
| **GET** | _/api/v1/inventarioscea/tipos_ | | Obtiene una lista de los tipos de equipos registrados |
| **GET** | _/api/v1/inventarioscea/tipos/:codigo_ | | Obtiene un tipo de equipo registrado |
| **GET** | _/api/v1/inventarioscea/fichas_ | | Obtiene la lista de las fichas tecnicas capturadas |
| **GET** | _/api/v1/inventarioscea/fichas/:folio_ | | Obtiene una ficha tecnica capturada |
| **POST** | _/api/v1/inventarioscea/departamentos_ | body = { Codigo: '', Descripcion: '' } | Crea nuevo departamento |
| **POST** | _/api/v1/inventarioscea/sucursales_ | body = { Codigo: '', Descripcion: '', Estado: '', Ciudad: '', Calle: '', Numero: '', CP: '' } | Crea una nueva sucursal |
| **POST** | _/api/v1/inventarioscea/tipos_ | body = { Codigo: '', Descripcion: '', Campos: '' } | Crea un nuevo tipo de equipo |
| **POST** | _/api/v1/inventarioscea/fichas_ | body = { Folio: '', Ciudad: '', FechaCaptura: '', Responsable: '', Sucursal: '', Despartamento: '', Modelo: '', Marca: '', PantallaPulgadas: '', TamañoPulgadas: '', Fabricante: '', PuertoHDMI: '', PuertoVGA: '', Color: '', Serie: '', Codigo: '', Clave: '', Digitos: '', Largo: '', Ancho: '', Grosor: '', Alambrico: '', SO: '', MotherBoard: '', Procesador: '', DiscoDuro: '', RAM: '', Conectividad: '', TipoPila: '', DuracionBateria: '', Voltaje: '', Accesorios: '', Garantia: '', Toner: '', Tambor: '', Tipo: '', NumeroSerial: '', Material: '', Valocidades: '', Capacidad: '', ContieneBateria: '', NumeroPuertas: '', TemperaturaOperacion: '', ConsumoEnergetico: '', Iluminacion: '', SistemaRefrigeracion: '', Combustible: '', Contactos: '', Cargador: '', Observaciones: '', Created: '', CreatedBy: '', Updated: '', UpdatedBy: '' } | Crea una nueva ficha tecnica |
| **PUT** | _/api/v1/inventarioscea/departamentos/:codigo_ | body = { Descripcion: '' } | actualiza un departamento |
| **PUT** | _/api/v1/inventarioscea/sucursales/:codigo_ | body = { Descripcion: '', Estado: '', Ciudad: '', Calle: '', Numero: '', CP: '' } | Actualiza una sucursal |
| **PUT** | _/api/v1/inventarioscea/tipos/:codigo_ | body = { Descripcion: '', Campos: '' } | Actualiza un tipo de equipo |
| **PUT** | _/api/v1/inventarioscea/fichas/:folio_ | body = { Ciudad: '', Responsable: '', Modelo: '', Marca: '', PantallaPulgadas: '', TamañoPulgadas: '', Fabricante: '', PuertoHDMI: '', PuertoVGA: '', Color: '', Serie: '', Codigo: '', Clave: '', Digitos: '', Largo: '', Ancho: '', Grosor: '', Alambrico: '', SO: '', MotherBoard: '', Procesador: '', DiscoDuro: '', RAM: '', Conectividad: '', TipoPila: '', DuracionBateria: '', Voltaje: '', Accesorios: '', Garantia: '', Toner: '', Tambor: '', Tipo: '', NumeroSerial: '', Material: '', Valocidades: '', Capacidad: '', ContieneBateria: '', NumeroPuertas: '', TemperaturaOperacion: '', ConsumoEnergetico: '', Iluminacion: '', SistemaRefrigeracion: '', Combustible: '', Contactos: '', Cargador: '', Observaciones: '', Updated: '', UpdatedBy: '' } | Actualiza los datos generales de una ficha tecnica |
| **DELETE** | _/api/v1/inventarioscea/departamentos/:codigo_ | | Elimina un departamento en especifico |
| **DELETE** | _/api/v1/inventarioscea/sucursales/:codigo_ | | Elimina una sucursal registrada |
| **DELETE** | _/api/v1/inventarioscea/tipos/:codigo_ | | Elimina un tipo de equipo registrado |
| **DELETE** | _/api/v1/inventarioscea/fichas/:folio_ | | Elimina una ficha tecnica capturada |
