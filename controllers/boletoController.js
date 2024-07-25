const Pago = require('../models/Pago');
const Boleto = require('../models/Boleto');
const Asiento = require('../models/Asiento');
const Usuario = require('../models/Usuario');
const Pelicula = require('../models/Pelicula');
const Horario = require('../models/Horario');
const Sala = require('../models/Sala');
const jwt = require('jsonwebtoken');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');


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

        // Obtener la hora programada y el turno del horario
        const horario = await Horario.findOne({ where: { idHorario } });
        if (!horario) {
            return res.status(400).json({ message: 'Horario no encontrado' });
        }

        const horaProgramada = horario.horaProgramada;
        const fechaDeEmision = horario.fechaDeEmision;
        const turno = horario.turno; // Asegúrate de que el modelo Horario tiene un campo 'turno'

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

        const filaAsiento = asiento.filaAsiento; // Asegúrate de que el modelo Asiento tiene un campo 'filaAsiento'

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

        // Datos de la respuesta
        const response = {
            idBoleto: boleto.idBoleto,
            idPago: boleto.idPago,
            nombreUsuario: nombreUsuario,
            nombrePelicula: nombrePelicula,
            horaProgramada: horaProgramada,
            nombreSala: nombreSala,
            numeroAsientoReservado: numeroAsientoReservado,
            filaAsiento: filaAsiento,
            fechaReserva: boleto.fechaReserva,
            fechaDeEmision: fechaDeEmision,
            turno: turno // Incluir el turno
        };

        // Generar el QR con la información especificada
        const qrCodeData = `
            Cine Fox
            Numero de Boleto: ${boleto.idBoleto}
            Numero de transaccion: ${boleto.idPago}
            Fecha de compra: ${boleto.fechaReserva.toISOString().split('T')[0]}
            Usuario: ${nombreUsuario}
            Pelicula: ${nombrePelicula}
            Fecha de emision: ${fechaDeEmision}
            Hora de emision: ${horaProgramada}
            Turno: ${turno}
            Sala: ${nombreSala}
            Fila de asiento: ${filaAsiento}
            Numero de asiento: ${numeroAsientoReservado}
            
        `;
        const qrCode = await QRCode.toDataURL(qrCodeData);

        // Incluir el QR en la respuesta
        response.qrCode = qrCode;

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

// Actualizar boletos por múltiples criterios
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

// Eliminar boletos con validaciones
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

// Generar reporte en PDF de boletos
exports.generateReport = async (req, res) => {
    try {
        const boletos = await Boleto.findAll({
            include: [
                { model: Usuario, attributes: ['nombreUsuario'] },
                { model: Pelicula, attributes: ['nombrePelicula'] },
                { model: Sala, attributes: ['nombreSala'] },
                { model: Horario, attributes: ['horaProgramada', 'fechaDeEmision'] },
                { model: Asiento, attributes: ['numeroAsiento'] }
            ]
        });

        if (!boletos || boletos.length === 0) {
            return res.status(404).json({ message: 'No se encontraron boletos para el reporte' });
        }

        const doc = new PDFDocument();
        let buffers = [];
        doc.on('data', buffers.push.bind(buffers));
        doc.on('end', () => {
            let pdfData = Buffer.concat(buffers);
            res
                .writeHead(200, {
                    'Content-Length': Buffer.byteLength(pdfData),
                    'Content-Type': 'application/pdf',
                    'Content-disposition': 'attachment;filename=boletos_report.pdf',
                })
                .end(pdfData);
        });

        doc.fontSize(14).text('Reporte de Boletos', { align: 'center' });
        doc.moveDown();

        boletos.forEach((boleto) => {
            doc
                .fontSize(12)
                .text(`Boleto ID: ${boleto.idBoleto}`)
                .text(`Usuario: ${boleto.Usuario.nombreUsuario}`)
                .text(`Película: ${boleto.Pelicula.nombrePelicula}`)
                .text(`Sala: ${boleto.Sala.nombreSala}`)
                .text(`Asiento: ${boleto.Asiento.numeroAsiento}`)
                .text(`Hora Programada: ${boleto.Horario.horaProgramada}`)
                .text(`Fecha de Emisión: ${boleto.Horario.fechaDeEmision}`)
                .moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
