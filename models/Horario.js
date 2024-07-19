const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Horario = sequelize.define('Horario', {
  idHorario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  horaProgramada: {
    type: DataTypes.TIME,
    allowNull: false
  },
  turno: {
    type: DataTypes.ENUM('mañana', 'tarde', 'noche'),
    allowNull: false
  }
}, {
  tableName: 'horarios',
  timestamps: false
});

module.exports = Horario;
