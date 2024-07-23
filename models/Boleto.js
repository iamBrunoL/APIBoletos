const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pelicula = require('./Pelicula');
const Horario = require('./Horario');
const Sala = require('./Sala');
const Asiento = require('./Asiento');
const Pago = require('./Pago');

const Boleto = sequelize.define('Boleto', {
  idBoleto: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
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
  idPago: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Pago,
      key: 'idCompra'
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
  }
}, {
  tableName: 'boletos',
  timestamps: false
});

module.exports = Boleto;
