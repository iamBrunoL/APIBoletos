# API Documentation
## Endpoints

### **Asientos**

- **POST** `/asientos`
  - **Description**: Crear un nuevo asiento.
  - **Protected**: Sí (admin)

- **GET** `/asientos`
  - **Description**: Obtener todos los asientos.
  - **Protected**: Sí (admin)

- **GET** `/asientos/search`
  - **Description**: Obtener asientos por criterios de búsqueda (múltiples criterios).
  - **Protected**: Sí (admin)

- **PUT** `/asientos`
  - **Description**: Actualizar asientos por múltiples criterios.
  - **Protected**: Sí (admin)

- **DELETE** `/asientos/:id`
  - **Description**: Eliminar un asiento.
  - **Protected**: Sí (admin)

### **Boletos**

- **POST** `/boletos`
  - **Description**: Crear un nuevo boleto.
  - **Protected**: Sí (cliente)

- **GET** `/boletos`
  - **Description**: Obtener todos los boletos.
  - **Protected**: Sí (admin)

- **GET** `/boletos/search`
  - **Description**: Obtener boletos por criterios de búsqueda (múltiples criterios).
  - **Protected**: Sí (admin)

- **PUT** `/boletos`
  - **Description**: Actualizar boletos por múltiples criterios.
  - **Protected**: Sí (admin)

- **DELETE** `/boletos/:id`
  - **Description**: Eliminar un boleto.
  - **Protected**: Sí (admin)

### **Horarios**

- **POST** `/horarios`
  - **Description**: Crear un nuevo horario.
  - **Protected**: Sí (admin)

- **GET** `/horarios`
  - **Description**: Obtener todos los horarios.
  - **Protected**: Sí (admin)

- **PUT** `/horarios/:id`
  - **Description**: Actualizar un horario.
  - **Protected**: Sí (admin)

- **DELETE** `/horarios/:id`
  - **Description**: Eliminar un horario.
  - **Protected**: Sí (admin)

### **Pagos**

- **GET** `/pagos`
  - **Description**: Obtener todos los pagos.
  - **Protected**: Sí (admin)

- **GET** `/pagos/:id`
  - **Description**: Obtener un pago por ID.
  - **Protected**: Sí (admin)

### **Películas**

- **POST** `/peliculas`
  - **Description**: Crear una nueva película.
  - **Protected**: Sí (admin)

- **GET** `/peliculas`
  - **Description**: Obtener todas las películas.
  - **Protected**: Sí (cliente)

- **GET** `/peliculas/search`
  - **Description**: Buscar películas por criterios (múltiples criterios).
  - **Protected**: Sí (admin)

- **PUT** `/peliculas`
  - **Description**: Actualizar una película.
  - **Protected**: Sí (admin)

- **DELETE** `/peliculas/:idPelicula`
  - **Description**: Eliminar una película.
  - **Protected**: Sí (admin)

### **Salas**

- **POST** `/salas`
  - **Description**: Crear una nueva sala.
  - **Protected**: Sí (admin)

- **GET** `/salas`
  - **Description**: Obtener todas las salas.
  - **Protected**: Sí (admin)

- **GET** `/salas/search`
  - **Description**: Buscar salas por criterios (múltiples criterios).
  - **Protected**: Sí (admin)

- **PUT** `/salas`
  - **Description**: Actualizar una sala.
  - **Protected**: Sí (admin)

- **DELETE** `/salas/:idSala`
  - **Description**: Eliminar una sala.
  - **Protected**: Sí (admin)

### **Usuarios**

- **POST** `/usuarios`
  - **Description**: Crear un nuevo usuario.
  - **Protected**: No

- **POST** `/usuarios/login`
  - **Description**: Iniciar sesión (ruta no protegida).
  - **Protected**: No

- **POST** `/usuarios/logout`
  - **Description**: Cerrar sesión.
  - **Protected**: Sí

- **GET** `/usuarios`
  - **Description**: Obtener todos los usuarios.
  - **Protected**: Sí (admin)

- **GET** `/usuarios/search`
  - **Description**: Buscar usuarios por criterios (múltiples criterios).
  - **Protected**: Sí (admin)

- **PUT** `/usuarios/:id`
  - **Description**: Actualizar un usuario.
  - **Protected**: Sí (admin)

- **DELETE** `/usuarios/:id`
  - **Description**: Eliminar un usuario.
  - **Protected**: Sí (admin)

---
