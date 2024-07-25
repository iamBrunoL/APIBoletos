const Pago = require('../models/Pago');
const Boleto = require('../models/Boleto');
const Asiento = require('../models/Asiento');
const Usuario = require('../models/Usuario');
const Pelicula = require('../models/Pelicula');
const Horario = require('../models/Horario');
const Sala = require('../models/Sala');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');

exports.createBoleto = async (req, res) => {
    const { idPelicula, idSala, numeroAsientoReservado, metodoPago } = req.body;
    const token = req.header('Authorization').replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    try {
        const pelicula = await Pelicula.findOne({ where: { idPelicula } });
        if (!pelicula) {
            return res.status(400).json({ message: 'Película no encontrada' });
        }

        const idHorario = pelicula.idHorario;
        const precioBoleto = pelicula.precioBoleto;
        const nombrePelicula = pelicula.nombrePelicula;

        const horario = await Horario.findOne({ where: { idHorario } });
        if (!horario) {
            return res.status(400).json({ message: 'Horario no encontrado' });
        }

        const horaProgramada = horario.horaProgramada;
        const fechaDeEmision = horario.fechaDeEmision;

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

        const sala = await Sala.findOne({ where: { idSala } });
        if (!sala) {
            return res.status(400).json({ message: 'Sala no encontrada' });
        }

        const nombreSala = sala.nombreSala;

        const usuario = await Usuario.findByPk(decodedToken.id);
        const nombreUsuario = usuario.nombreUsuario;

        const pago = await Pago.create({
            idUsuario: usuario.idUsuario,
            cantidadPago: precioBoleto,
            metodoPago: metodoPago
        });

        const fechaReserva = new Date();

        const boleto = await Boleto.create({
            idPelicula,
            idHorario,
            idSala,
            idPago: pago.idCompra,
            idAsientoReservado: asiento.idAsiento,
            fechaReserva
        });

        await Asiento.update({ estadoAsiento: 'ocupado' }, { where: { idAsiento: asiento.idAsiento } });

        const response = {
            idBoleto: boleto.idBoleto,
            idPago: boleto.idPago,
            nombreUsuario: nombreUsuario,
            nombrePelicula: nombrePelicula,
            horaProgramada: horaProgramada,
            nombreSala: nombreSala,
            numeroAsientoReservado: numeroAsientoReservado,
            fechaReserva: boleto.fechaReserva,
            fechaDeEmision: fechaDeEmision
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

exports.getBoletos = async (req, res) => {
    try {
        const { idBoleto, idPelicula, idSala, idAsientoReservado, idPago } = req.query;
        const searchCriteria = {};
        if (idBoleto) searchCriteria.idBoleto = idBoleto;
        if (idPelicula) searchCriteria.idPelicula = idPelicula;
        if (idSala) searchCriteria.idSala = idSala;
        if (idAsientoReservado) searchCriteria.idAsientoReservado = idAsientoReservado;
        if (idPago) searchCriteria.idPago = idPago;

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

exports.updateBoletos = async (req, res) => {
    try {
        const { idBoleto, idPelicula, idSala, idAsientoReservado, idPago, fechaReserva } = req.body;

        if (!idBoleto) {
            return res.status(400).json({ message: 'ID del boleto es requerido para la actualización' });
        }

        const updateFields = {};
        if (idPelicula) updateFields.idPelicula = idPelicula;
        if (idSala) updateFields.idSala = idSala;
        if (idAsientoReservado) updateFields.idAsientoReservado = idAsientoReservado;
        if (idPago) updateFields.idPago = idPago;
        if (fechaReserva) updateFields.fechaReserva = fechaReserva;

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

exports.deleteBoleto = async (req, res) => {
    try {
        const { idBoleto } = req.params;

        if (!idBoleto) {
            return res.status(400).json({ message: 'ID del boleto es requerido para la eliminación' });
        }

        const boleto = await Boleto.findByPk(idBoleto);
        if (!boleto) {
            return res.status(404).json({ message: 'Boleto no encontrado' });
        }

        await Boleto.destroy({ where: { idBoleto } });

        res.json({ message: 'Boleto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBoletosPDF = async (req, res) => {
    try {
        const boletos = await Boleto.findAll({
            include: [
                { model: Pelicula, attributes: ['nombrePelicula'] },
                { model: Sala, attributes: ['nombreSala'] },
                { model: Usuario, attributes: ['nombreUsuario'] },
                { model: Pago, attributes: ['metodoPago'] }
            ]
        });

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=boletos.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Boletos', { align: 'center' });

        boletos.forEach(boleto => {
            doc.fontSize(12).text(`ID: ${boleto.idBoleto}`);
            doc.fontSize(12).text(`Película: ${boleto.Pelicula.nombrePelicula}`);
            doc.fontSize(12).text(`Sala: ${boleto.Sala.nombreSala}`);
            doc.fontSize(12).text(`Asiento: ${boleto.idAsientoReservado}`);
            doc.fontSize(12).text(`Usuario: ${boleto.Usuario.nombreUsuario}`);
            doc.fontSize(12).text(`Método de Pago: ${boleto.Pago.metodoPago}`);
            doc.fontSize(12).text(`Fecha de Reserva: ${boleto.fechaReserva}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
