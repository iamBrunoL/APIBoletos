const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('blao5xqfq9hfx2xk7rgf', 'u1vuve184jrusyc2', 'ik3esLZEGNz9M3Iys0T3', {
  host: 'blao5xqfq9hfx2xk7rgf-mysql.services.clever-cloud.com',
  dialect: 'mysql',
  logging: false // permite mostrar u ocultar que en la terminal la verificacion de la existencia de las tablas en la base de datos
});

module.exports = sequelize;
