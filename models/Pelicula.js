const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

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
  descripcionPelicula: {
    type: DataTypes.STRING,
    allowNull: false
  },
  precioBoleto: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  imagenPelicula: {
    type: DataTypes.TEXT('long'),
    allowNull: true 
  }
}, {
  tableName: 'peliculas',
  timestamps: false
});

module.exports = Pelicula;
