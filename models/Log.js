const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de que la configuración de la base de datos esté correcta

const Log = sequelize.define('Log', {
  idLog: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
    allowNull: false
  },
  usuario: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  accion: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  fechaHora: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  host: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  navegador: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  sistemaOperativo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  tipoDispositivo: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  direccionIP: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  ubicacion: {
    type: DataTypes.STRING(255),
    allowNull: false
  }
}, {
  tableName: 'logs',
  timestamps: false // Desactiva los campos createdAt y updatedAt si no los necesitas
});

module.exports = Log;
