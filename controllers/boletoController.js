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
const registrarLog = require('../middleware/logs'); // Importar la función de registro de logs

exports.createBoleto = async (req, res) => {
    const { idPelicula, idSala, numeroAsientoReservado, metodoPago } = req.body;
    const token = req.header('Authorization').replace('Bearer ', '');
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    try {
        // Obtener la película y su precio
        const pelicula = await Pelicula.findOne({ where: { idPelicula } });
        if (!pelicula) {
            registrarLog(req, 'ERROR', 'Película no encontrada');
            return res.status(400).json({ message: 'Película no encontrada' });
        }

        const idHorario = pelicula.idHorario;
        const precioBoleto = pelicula.precioBoleto;
        const nombrePelicula = pelicula.nombrePelicula;

        // Obtener la hora programada y el turno del horario
        const horario = await Horario.findOne({ where: { idHorario } });
        if (!horario) {
            registrarLog(req, 'ERROR', 'Horario no encontrado');
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
            registrarLog(req, 'ERROR', 'Asiento no disponible');
            return res.status(400).json({ message: 'Asiento no disponible' });
        }

        const filaAsiento = asiento.filaAsiento;

        // Obtener la sala
        const sala = await Sala.findOne({ where: { idSala } });
        if (!sala) {
            registrarLog(req, 'ERROR', 'Sala no encontrada');
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

        registrarLog(req, 'INFO', `Boleto creado con éxito: ${boleto.idBoleto}`);
        res.json(response);
    } catch (error) {
        registrarLog(req, 'ERROR', `Error al crear boleto: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los boletos
exports.getAllBoletos = async (req, res) => {
    try {
        const boletos = await Boleto.findAll();
        registrarLog(req, 'INFO', 'Obtención de todos los boletos realizada con éxito');
        res.json(boletos);
    } catch (error) {
        registrarLog(req, 'ERROR', `Error al obtener todos los boletos: ${error.message}`);
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
            registrarLog(req, 'INFO', 'Boletos encontrados con los criterios especificados');
            res.json(boletos);
        } else {
            registrarLog(req, 'INFO', 'No se encontraron boletos con los criterios especificados');
            res.status(404).json({ message: 'No se encontraron boletos con los criterios proporcionados' });
        }
    } catch (error) {
        registrarLog(req, 'ERROR', `Error al obtener boletos por criterios: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.updateBoletos = async (req, res) => {
    try {
        const { idBoleto, idPelicula, idSala, idAsientoReservado } = req.body;
        if (!idBoleto) {
            registrarLog(req, 'ERROR', 'ID del boleto no proporcionado para la actualización');
            return res.status(400).json({ message: 'ID del boleto es requerido para la actualización' });
        }

        // Verificar si el idPelicula proporcionado existe
        if (idPelicula) {
            const pelicula = await Pelicula.findByPk(idPelicula);
            if (!pelicula) {
                registrarLog(req, 'ERROR', 'Película no encontrada');
                return res.status(400).json({ message: 'Película no encontrada' });
            }
        }

        // Verificar si el idSala proporcionado existe
        if (idSala) {
            const sala = await Sala.findByPk(idSala);
            if (!sala) {
                registrarLog(req, 'ERROR', 'Sala no encontrada');
                return res.status(400).json({ message: 'Sala no encontrada' });
            }
        }

        // Verificar si el idAsientoReservado proporcionado existe y está disponible
        if (idAsientoReservado) {
            const asiento = await Asiento.findByPk(idAsientoReservado);
            if (!asiento) {
                registrarLog(req, 'ERROR', 'Asiento no encontrado');
                return res.status(400).json({ message: 'Asiento no encontrado' });
            }

            if (asiento.estadoAsiento !== 'disponible') {
                registrarLog(req, 'ERROR', 'Asiento no disponible');
                return res.status(400).json({ message: 'Asiento no disponible' });
            }
        }

        // Verificar que el boleto existe antes de intentar actualizarlo
        const boleto = await Boleto.findByPk(idBoleto);
        if (!boleto) {
            registrarLog(req, 'ERROR', 'Boleto no encontrado');
            return res.status(404).json({ message: 'Boleto no encontrado' });
        }

        // Actualizar el boleto con los datos proporcionados
        await Boleto.update({ idPelicula, idSala, idAsientoReservado }, { where: { idBoleto } });

        registrarLog(req, 'INFO', `Boleto actualizado: ${idBoleto}`);
        res.json({ message: 'Boleto actualizado exitosamente' });
    } catch (error) {
        registrarLog(req, 'ERROR', `Error al actualizar boleto: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBoleto = async (req, res) => {
    try {
        const { idBoleto } = req.body;
        if (!idBoleto) {
            registrarLog(req, 'ERROR', 'ID del boleto no proporcionado para la eliminación');
            return res.status(400).json({ message: 'ID del boleto es requerido para la eliminación' });
        }

        // Verificar que el boleto existe antes de intentar eliminarlo
        const boleto = await Boleto.findByPk(idBoleto);
        if (!boleto) {
            registrarLog(req, 'ERROR', 'Boleto no encontrado');
            return res.status(404).json({ message: 'Boleto no encontrado' });
        }

        // Eliminar el boleto
        await Boleto.destroy({ where: { idBoleto } });

        registrarLog(req, 'INFO', `Boleto eliminado: ${idBoleto}`);
        res.json({ message: 'Boleto eliminado exitosamente' });
    } catch (error) {
        registrarLog(req, 'ERROR', `Error al eliminar boleto: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};


// Generar reporte en PDF de los boletos
exports.generateReport = async (req, res) => {
    try {
        // Obtener todos los boletos
        const boletos = await Boleto.findAll();

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();

        // Configurar los encabezados para la respuesta PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=boletos.pdf');

        // Enviar el documento PDF a la respuesta
        doc.pipe(res);

        // Agregar título al documento
        doc.fontSize(20).text('Reporte de Boletos', { align: 'center' });
        doc.moveDown();

        // Agregar cada boleto al documento
        boletos.forEach(boleto => {
            doc.fontSize(12).text(`ID: ${boleto.idBoleto}`);
            doc.fontSize(12).text(`Cliente: ${boleto.nombreCliente}`);
            doc.fontSize(12).text(`Fecha: ${boleto.fecha}`);
            doc.fontSize(12).text(`Sala: ${boleto.idSala}`);
            doc.fontSize(12).text(`Asiento: ${boleto.numeroAsiento}`);
            doc.fontSize(12).text(`Precio: ${boleto.precio}`);
            doc.moveDown();
        });

        // Finalizar el documento
        doc.end();

        // Registrar el log de generación del reporte
        registrarLog('generateReport', req, { message: 'Reporte de boletos generado exitosamente' }, 'info');
    } catch (error) {
        // Registrar el error y enviar una respuesta de error
        registrarLog('generateReport', req, { error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};