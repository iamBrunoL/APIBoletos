const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Dulceria = sequelize.define('Dulceria', {
    idProducto: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    nombreProducto: {
        type: DataTypes.STRING(50),
        allowNull: false,
    },
    precioProducto: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    tableName: 'dulceria',
    timestamps: false,
});

module.exports = Dulceria;
