const { Sequelize } = require('sequelize');

const sequelize = new Sequelize('blao5xqfq9hfx2xk7rgf', 'u1vuve184jrusyc2', 'ik3esLZEGNz9M3Iys0T3', {
  host: 'blao5xqfq9hfx2xk7rgf-mysql.services.clever-cloud.com',
  dialect: 'mysql'
});

module.exports = sequelize;
