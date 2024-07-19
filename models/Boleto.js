const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');
const Pelicula = require('./Pelicula');
const Horario = require('./Horario');
const Sala = require('./Sala');
const Asiento = require('./Asiento');

const Boleto = sequelize.define('Boleto', {
  idBoleto: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: 'idUsuario'
    }
  },
  idPelicula: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Pelicula,
      key: 'idPelicula'
    }
  },
  idHorario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Horario,
      key: 'idHorario'
    }
  },
  idSala: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Sala,
      key: 'idSala'
    }
  },
  idAsientoReservado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Asiento,
      key: 'idAsiento'
    }
  },
  fechaReserva: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fechaExpiracion: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'boletos',
  timestamps: false
});

module.exports = Boleto;
