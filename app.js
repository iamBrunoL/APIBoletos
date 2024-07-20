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

const app = express();
app.use(express.json());
app.use(morgan('dev'));

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en el puerto ${PORT}`);
});
