const Pago = require('../models/Pago');
const Boleto = require('../models/Boleto');
const Asiento = require('../models/Asiento');
const Usuario = require('../models/Usuario');
const Pelicula = require('../models/Pelicula');
const Horario = require('../models/Horario');
const Sala = require('../models/Sala');
const jwt = require('jsonwebtoken');

exports.createBoleto = async (req, res) => {
    const { idPelicula, idSala, numeroAsientoReservado, metodoPago } = req.body;
    const token = req.header('Authorization').replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    try {
        // Obtener la película y su precio
        const pelicula = await Pelicula.findOne({ where: { idPelicula } });
        if (!pelicula) {
            return res.status(400).json({ message: 'Película no encontrada' });
        }

        const idHorario = pelicula.idHorario;
        const precioBoleto = pelicula.precioBoleto;
        const nombrePelicula = pelicula.nombrePelicula;

        // Obtener la hora programada del horario
        const horario = await Horario.findOne({ where: { idHorario } });
        if (!horario) {
            return res.status(400).json({ message: 'Horario no encontrado' });
        }

        const horaProgramada = horario.horaProgramada;
        const fechaDeEmision = horario.fechaDeEmision;

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

        // Obtener la sala
        const sala = await Sala.findOne({ where: { idSala } });
        if (!sala) {
            return res.status(400).json({ message: 'Sala no encontrada' });
        }

        const nombreSala = sala.nombreSala;

        // Obtener el usuario
        const usuario = await Usuario.findByPk(decodedToken.id);
        const nombreUsuario = usuario.nombreUsuario;

        // Crear el registro de pago con el precio de la película
        const pago = await Pago.create({
            idUsuario: usuario.idUsuario,
            cantidadPago: precioBoleto,
            metodoPago: metodoPago
        });

        // Obtener la fecha actual para fechaReserva
        const fechaReserva = new Date();

        // Crear el boleto
        const boleto = await Boleto.create({
            idPelicula,
            idHorario,
            idSala,
            idPago: pago.idCompra,
            idAsientoReservado: asiento.idAsiento,
            fechaReserva
        });

        // Actualizar el estado del asiento
        await Asiento.update({ estadoAsiento: 'ocupado' }, { where: { idAsiento: asiento.idAsiento } });

        // Responder con los nombres y no con los IDs
        const response = {
            idBoleto: boleto.idBoleto,
            idPago: boleto.idPago,
            nombreUsuario: nombreUsuario,
            nombrePelicula: nombrePelicula,
            horaProgramada: horaProgramada,
            nombreSala: nombreSala,
            numeroAsientoReservado: numeroAsientoReservado,
            fechaReserva: boleto.fechaReserva,
            fechaDeEmision: fechaDeEmision // Incluir la fecha de emisión
        };

        res.json(response);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los boletos
exports.getAllBoletos = async (req, res) => {
    try {
        const boletos = await Boleto.findAll();
        res.json(boletos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener boletos por múltiples criterios
exports.getBoletos = async (req, res) => {
    try {
        // Extraer los criterios de búsqueda del query params
        const { idBoleto, idPelicula, idSala, idAsientoReservado, idPago } = req.query;
        
        // Construir un objeto de búsqueda basado en los criterios proporcionados
        const searchCriteria = {};
        if (idBoleto) searchCriteria.idBoleto = idBoleto;
        if (idPelicula) searchCriteria.idPelicula = idPelicula;
        if (idSala) searchCriteria.idSala = idSala;
        if (idAsientoReservado) searchCriteria.idAsientoReservado = idAsientoReservado;
        if (idPago) searchCriteria.idPago = idPago;

        // Buscar los boletos en la base de datos con los criterios proporcionados
        const boletos = await Boleto.findAll({ where: searchCriteria });

        if (boletos.length > 0) {
            res.json(boletos);
        } else {
            res.status(404).json({ message: 'No se encontraron boletos con los criterios proporcionados' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar boletos por múltiples criterios
exports.updateBoletos = async (req, res) => {
    try {
        const { idBoleto, idPelicula, idSala, idAsientoReservado, idPago, fechaReserva } = req.body;

        // Validar que al menos uno de los campos esté presente
        if (!idBoleto) {
            return res.status(400).json({ message: 'ID del boleto es requerido para la actualización' });
        }

        // Construir el objeto de actualización
        const updateFields = {};
        if (idPelicula) updateFields.idPelicula = idPelicula;
        if (idSala) updateFields.idSala = idSala;
        if (idAsientoReservado) updateFields.idAsientoReservado = idAsientoReservado;
        if (idPago) updateFields.idPago = idPago;
        if (fechaReserva) updateFields.fechaReserva = fechaReserva;

        // Realizar la actualización en la base de datos
        const [updated] = await Boleto.update(updateFields, { where: { idBoleto } });

        if (updated) {
            res.json({ message: 'Boleto actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Boleto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar boletos con validaciones
exports.deleteBoleto = async (req, res) => {
    try {
        const { idBoleto } = req.params;

        // Validar que el idBoleto sea proporcionado
        if (!idBoleto) {
            return res.status(400).json({ message: 'ID del boleto es requerido para la eliminación' });
        }

        // Verificar si el boleto existe antes de eliminar
        const boleto = await Boleto.findByPk(idBoleto);
        if (!boleto) {
            return res.status(404).json({ message: 'Boleto no encontrado' });
        }

        // Eliminar el boleto
        await Boleto.destroy({ where: { idBoleto } });

        res.json({ message: 'Boleto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
