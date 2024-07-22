const Pago = require('../models/Pago');
const Boleto = require('../models/Boleto');
const Asiento = require('../models/Asiento');
const Usuario = require('../models/Usuario');
const Pelicula = require('../models/Pelicula');
const jwt = require('jsonwebtoken');

exports.createBoleto = async (req, res) => {
    const { idPelicula, idSala, numeroAsientoReservado, fechaReserva, metodoPago } = req.body;
    const token = req.header('Authorization').replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    try {
        // Obtener la película y su precio
        const pelicula = await Pelicula.findOne({
            where: {
                idPelicula
            }
        });

        if (!pelicula) {
            return res.status(400).json({ message: 'Película no encontrada' });
        }

        const idHorario = pelicula.idHorario;
        const precioBoleto = pelicula.precioBoleto;

        // Verificar que el asiento está disponible en la sala correcta
        const asiento = await Asiento.findOne({
            where: {
                numeroAsiento: numeroAsientoReservado,
                idSalaAsiento: idSala,
                estadoAsiento: 'disponible'
            }
        });

        if (!asiento) {
            return res.status(400).json({ message: 'Asiento no disponible o no existe' });
        }

        // Obtener el usuario
        const usuario = await Usuario.findByPk(decodedToken.id);

        // Crear el registro de pago con el precio de la película
        const pago = await Pago.create({
            idUsuario: usuario.idUsuario,
            cantidadPago: precioBoleto, // Utilizar el precio del boleto de la película
            metodoPago: metodoPago
        });

        // Calcular la fecha de expiración
        const fechaExpiracion = new Date(fechaReserva);
        fechaExpiracion.setDate(fechaExpiracion.getDate() + 2);

        // Crear el boleto
        const boleto = await Boleto.create({
            idPelicula,
            idHorario,
            idSala,
            idPago: pago.idCompra,
            idAsientoReservado: asiento.idAsiento, // Usar el id del asiento encontrado
            fechaReserva,
            fechaExpiracion
        });

        // Actualizar el estado del asiento
        await Asiento.update({ estadoAsiento: 'ocupado' }, { where: { idAsiento: asiento.idAsiento } });

        // Responder con numeroAsientoReservado en lugar de idAsientoReservado
        const response = {
            idBoleto: boleto.idBoleto,
            idPelicula: boleto.idPelicula,
            idHorario: boleto.idHorario,
            idSala: boleto.idSala,
            idPago: boleto.idPago,
            numeroAsientoReservado: numeroAsientoReservado,
            fechaReserva: boleto.fechaReserva,
            fechaExpiracion: boleto.fechaExpiracion
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllBoletos = async (req, res) => {
    try {
        const boletos = await Boleto.findAll();
        res.json(boletos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBoletoById = async (req, res) => {
    try {
        const boleto = await Boleto.findByPk(req.params.id);
        if (boleto) {
            res.json(boleto);
        } else {
            res.status(404).json({ message: 'Boleto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBoleto = async (req, res) => {
    try {
        await Boleto.update(req.body, { where: { idBoleto: req.params.id } });
        res.json({ message: 'Boleto actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBoleto = async (req, res) => {
    try {
        await Boleto.destroy({ where: { idBoleto: req.params.id } });
        res.json({ message: 'Boleto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
