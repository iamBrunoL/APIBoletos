const express = require('express');
const sequelize = require('./config/database');
const morgan = require('morgan');
const usuarioRoutes = require('./routes/usuarioRoutes');
const peliculaRoutes = require('./routes/peliculaRoutes');
const horarioRoutes = require('./routes/horarioRoutes');
const salaRoutes = require('./routes/salaRoutes');
const asientoRoutes = require('./routes/asientoRoutes');
const boletoRoutes = require('./routes/boletoRoutes');
const pagoRoutes = require('./routes/pagoRoutes');
const dulceriaRoutes = require('./routes/dulceriaRoutes'); // Nueva ruta para Dulcería
require('dotenv').config(); // Cargar variables de entorno
const path = require('path'); // Importar el módulo path para gestionar rutas

const app = express();
app.use(express.json());
app.use(morgan('dev'));

// Servir archivos estáticos desde la carpeta 'public'
app.use(express.static(path.join(__dirname, 'public')));

// Ruta para la raíz del servidor
app.get('/', (req, res) => {
    res.send('Propiedad de Cine Fox');
});

// Sincronizar modelos con la base de datos
sequelize.sync();

// Usar rutas
app.use('/usuarios', usuarioRoutes);
app.use('/peliculas', peliculaRoutes);
app.use('/horarios', horarioRoutes);
app.use('/salas', salaRoutes);
app.use('/asientos', asientoRoutes);
app.use('/boletos', boletoRoutes);
app.use('/pagos', pagoRoutes);
app.use('/dulceria', dulceriaRoutes); // Usar la ruta de Dulcería

// Middleware para manejar rutas no definidas
app.use((req, res) => {
    res.status(404).send('Upss!!!, la ruta que estás buscando no existe.');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de la API de Cine Fox corriendo en el puerto ${PORT}`);
});
