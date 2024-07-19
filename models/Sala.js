const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Sala = sequelize.define('Sala', {
  idSala: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombreSala: {
    type: DataTypes.STRING,
    allowNull: false
  },
  cantidadAsientos: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  tableName: 'salas',
  timestamps: false
});

module.exports = Sala;
