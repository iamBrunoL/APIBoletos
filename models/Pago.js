const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");
const Usuario = require("./Usuario");

const Pago = sequelize.define("Pago", {
  idCompra: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  idUsuario: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Usuario,
      key: "idUsuario",
    },
  },
  cantidadPago: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  metodoPago: {
    type: DataTypes.ENUM("tarjeta", "efectivo", "terceros"),
    allowNull: false,
  },
}, {
  tableName: 'pagos',
  timestamps: false
});

module.exports = Pago;
