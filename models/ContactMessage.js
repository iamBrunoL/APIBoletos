const { DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // Asegúrate de tener configurada tu conexión a la base de datos

const ContactMessage = sequelize.define('ContactMessage', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    email: {
        type: DataTypes.STRING(100),
        allowNull: false
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    timestamps: false,
    tableName: 'ContactMessages'
});

module.exports = ContactMessage;
