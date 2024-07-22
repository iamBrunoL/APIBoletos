const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Horario = require('./Horario');

const Pelicula = sequelize.define('Pelicula', {
  idPelicula: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  nombrePelicula: {
    type: DataTypes.STRING,
    allowNull: false
  },
  directorPelicula: {
    type: DataTypes.STRING,
    allowNull: false
  },
  duracionPelicula: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  actoresPelicula: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  clasificacionPelicula: {
    type: DataTypes.STRING,
    allowNull: false
  },
  idHorario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Horario,
      key: 'idHorario'
    }
  },
  precioBoleto: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
}, {
  tableName: 'peliculas',
  timestamps: false
});

module.exports = Pelicula;
