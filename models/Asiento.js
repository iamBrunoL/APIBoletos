const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Sala = require('./Sala');

const Asiento = sequelize.define('Asiento', {
  idAsiento: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  filaAsiento: {
    type: DataTypes.STRING,
    allowNull: false
  },
  numeroAsiento: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  idSalaAsiento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Sala,
      key: 'idSala'
    }
  },
  estadoAsiento: {
    type: DataTypes.ENUM('disponible', 'ocupado'),
    allowNull: false
  }
}, {
  tableName: 'asientos',
  timestamps: false
});

module.exports = Asiento;
