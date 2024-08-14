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
  fechaDeEmision: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'horarios',
  timestamps: false
});

module.exports = Horario;
