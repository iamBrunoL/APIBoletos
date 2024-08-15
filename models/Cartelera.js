const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Pelicula = require('./Pelicula');
const Horario = require('./Horario');
const Sala = require('./Sala');

const Cartelera = sequelize.define('Cartelera', {
    idCartelera: {
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
    idSala: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: Sala,
            key: 'idSala'
        }
    },
    nombreDia: {
        type: DataTypes.STRING,
        allowNull: false,
      }
}, {
    tableName: 'cartelera',
    timestamps: false
});


Cartelera.belongsTo(Pelicula, { foreignKey: 'idPelicula' });
Cartelera.belongsTo(Horario, { foreignKey: 'idHorario' });
Cartelera.belongsTo(Sala, { foreignKey: 'idSala' });

module.exports = Cartelera;
