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
        const turno = horario.turno;

        // Verificar que el asiento está disponible en la sala correcta
        const asiento = await Asiento.findOne({
            where: {
                numeroAsiento: numeroAsientoReservado,
                idSalaAsiento: idSala,
                estadoAsiento: 'disponible'
            }
        });
        if (!asiento) {
            return res.status(400).json({ message: 'Asiento no disponible' });
        }

        const filaAsiento = asiento.filaAsiento;

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
            Numero de Boleto: ${boleto.idBoleto}.
            Numero de transaccion: ${boleto.idPago}
            Fecha de compra: ${boleto.fechaReserva.toISOString().split('T')[0]}.
            Usuario: ${nombreUsuario}.
            Pelicula: ${nombrePelicula}.
            Fecha de emision: ${fechaDeEmision}.
            Hora de emision: ${horaProgramada}.
            Turno: ${turno}.
            Sala: ${nombreSala}.
            Fila de asiento: ${filaAsiento}.
            Numero de asiento: ${numeroAsientoReservado}.
            Gracias por su preferencia.
            
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


exports.updateBoletos = async (req, res) => {
    try {
        const { idBoleto, idPelicula, idSala, idAsientoReservado } = req.body;
        if (!idBoleto) {
            return res.status(400).json({ message: 'ID del boleto es requerido para la actualización' });
        }

        // Verificar si el idPelicula proporcionado existe
        if (idPelicula) {
            const pelicula = await Pelicula.findByPk(idPelicula);
            if (!pelicula) {
                return res.status(400).json({ message: 'Película no encontrada' });
            }
        }

        // Verificar si el idSala proporcionado existe
        if (idSala) {
            const sala = await Sala.findByPk(idSala);
            if (!sala) {
                return res.status(400).json({ message: 'Sala no encontrada' });
            }
        }

        // Verificar si el idAsientoReservado proporcionado existe y está disponible
        if (idAsientoReservado) {
            const asiento = await Asiento.findByPk(idAsientoReservado);
            if (!asiento) {
                return res.status(400).json({ message: 'Asiento no encontrado' });
            }

            if (asiento.estadoAsiento !== 'disponible') {
                return res.status(400).json({ message: 'Asiento no disponible' });
            }
        }

        // Verificar que el boleto existe antes de intentar actualizarlo
        const boleto = await Boleto.findByPk(idBoleto);
        if (!boleto) {
            return res.status(404).json({ message: 'Boleto no encontrado' });
        }

        const updateFields = {};
        if (idPelicula) updateFields.idPelicula = idPelicula;
        if (idSala) updateFields.idSala = idSala;
        if (idAsientoReservado) {
            updateFields.idAsientoReservado = idAsientoReservado;
            // Actualizar el estado del asiento a 'ocupado'
            await Asiento.update({ estadoAsiento: 'ocupado' }, { where: { idAsiento: idAsientoReservado } });
        }

        // Impedir la actualización de idPago y fechaReserva
        if (req.body.idPago || req.body.fechaReserva) {
            return res.status(400).json({ message: 'No se permite actualizar idPago o fechaReserva' });
        }

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
        const { id } = req.params; // Obtener el ID del boleto desde los parámetros de la URL
        console.log('ID del boleto recibido:', id); // Log del ID recibido

        // Verificar si el ID del boleto está presente
        if (!id) {
            return res.status(400).json({ message: 'ID del boleto es requerido para la eliminación' });
        }

        // Buscar el boleto en la base de datos
        const boleto = await Boleto.findByPk(id);
        //console.log('Boleto encontrado:', boleto); Log del boleto encontrado

        if (!boleto) {
            return res.status(404).json({ message: 'Boleto no encontrado' });
        }

        // Verificar si el boleto está ocupado
        if (boleto.estadoAsiento === 'ocupado') {
            return res.status(400).json({ message: 'El boleto está ocupado y no puede ser eliminado' });
        }

        // Obtener el ID del asiento asociado con el boleto
        const idAsiento = boleto.idAsientoReservado;
        
        // Actualizar el estado del asiento a "disponible"
        await Asiento.update({ estadoAsiento: 'disponible' }, { where: { idAsiento } });

        // Eliminar el boleto
        await Boleto.destroy({ where: { idBoleto: id } });
        res.json({ message: 'Boleto eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.generateReport = async (req, res) => {
    try {
        // Obtener todos los boletos con las asociaciones necesarias
        const boletos = await Boleto.findAll({
            include: [
                { model: Pago, include: [{ model: Usuario, attributes: ['nombreUsuario'] }] },
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
                .text(`Usuario: ${boleto.Pago.Usuario.nombreUsuario}`)
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
