const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Usuario = sequelize.define('Usuario', {
  idUsuario: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombreUsuario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  apellidoUsuario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  edadUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  correoUsuario: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  telefonoUsuario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  contrasenaUsuario: {
    type: DataTypes.STRING,
    allowNull: false
  },
  tipoUsuario: {
    type: DataTypes.ENUM('cliente', 'admin', 'otro'),
    allowNull: false,
    defaultValue: 'cliente'
  }
}, {
  tableName: 'usuarios',
  timestamps: false
});

module.exports = Usuario;
