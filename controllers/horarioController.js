const Horario = require('../models/Horario');
const Pelicula = require('../models/Pelicula');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');
const registrarLog = require('../middleware/logs'); // Asegúrate de importar la función de logging

// Crear un nuevo horario
exports.createHorario = async (req, res) => {
    const { horaProgramada, fechaDeEmision, turno } = req.body;
    const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';

    // Validación de datos
    if (!horaProgramada) {
        const errorMessage = 'La hora programada es requerida';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }
    if (!fechaDeEmision) {
        const errorMessage = 'La fecha de emisión es requerida';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }
    if (!turno) {
        const errorMessage = 'El turno es requerido';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }

    // Validar el formato de horaProgramada
    if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(horaProgramada)) {
        const errorMessage = 'Formato de hora no válido';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }

    // Validar el formato de fechaDeEmision
    const formattedDate = new Date(fechaDeEmision);
    if (isNaN(formattedDate.getTime())) {
        const errorMessage = 'Formato de fecha no válido';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }

    // Validar el turno
    const validTurnos = ['mañana', 'tarde', 'noche'];
    if (!validTurnos.includes(turno)) {
        const errorMessage = 'Turno no válido';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }

    try {
        const horario = await Horario.create({
            horaProgramada,
            fechaDeEmision,
            turno
        });
        registrarLog('Horario creado', req, userAgent, 'info');
        res.status(201).json(horario);
    } catch (error) {
        registrarLog(req, `Error al crear horario: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los horarios
exports.getAllHorarios = async (req, res) => {
    const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';

    try {
        const horarios = await Horario.findAll();
        registrarLog('Horarios consultados', req, userAgent, 'info');
        res.json(horarios);
    } catch (error) {
        registrarLog(req, `Error al obtener horarios: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};

// Obtener horarios por criterios de búsqueda
exports.getHorarios = async (req, res) => {
    try {
        const { idHorario, fechaDeEmision, horaProgramada, turno } = req.query;
        const searchCriteria = {};

        if (idHorario) searchCriteria.idHorario = idHorario;

        if (fechaDeEmision) {
            // Convertir fecha a formato YYYY-MM-DD
            const formattedDate = new Date(fechaDeEmision);
            if (isNaN(formattedDate.getTime())) {
                const errorMessage = 'Formato de fecha no válido';
                registrarLog(req, errorMessage); // Registrar el error
                return res.status(400).json({ message: errorMessage });
            }
            searchCriteria.fechaDeEmision = {
                [Op.eq]: formattedDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
            };
        }

        if (horaProgramada) {
            // Validar y ajustar formato de horaProgramada
            const time = horaProgramada;
            if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time)) {
                const errorMessage = 'Formato de hora no válido';
                registrarLog(req, errorMessage); // Registrar el error
                return res.status(400).json({ message: errorMessage });
            }
            searchCriteria.horaProgramada = {
                [Op.eq]: time
            };
        }

        if (turno) {
            if (!['mañana', 'tarde', 'noche'].includes(turno)) {
                const errorMessage = 'Turno no válido';
                registrarLog(req, errorMessage); // Registrar el error
                return res.status(400).json({ message: errorMessage });
            }
            searchCriteria.turno = turno;
        }

        // Ejecutar la consulta
        const horarios = await Horario.findAll({
            where: searchCriteria
        });

        if (horarios.length > 0) {
            registrarLog(req, 'Horarios encontrados con los criterios de búsqueda'); // Registrar la acción exitosa
            res.json(horarios);
        } else {
            const errorMessage = 'No se encontraron horarios con los criterios proporcionados';
            registrarLog(req, errorMessage); // Registrar el error
            res.status(404).json({ message: errorMessage });
        }
    } catch (error) {
        registrarLog(req, `Error al obtener horarios por criterios: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};

// Actualizar horarios por múltiples criterios
exports.updateHorarios = async (req, res) => {
    const { idHorario, horaProgramada, fechaDeEmision, turno } = req.body;

    // Validación de datos
    if (!idHorario) {
        const errorMessage = 'ID del horario es requerido para la actualización';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }

    // Validar el formato de horaProgramada, si se proporciona
    if (horaProgramada && !/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(horaProgramada)) {
        const errorMessage = 'Formato de hora no válido';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }

    // Validar el formato de fechaDeEmision, si se proporciona
    if (fechaDeEmision) {
        const formattedDate = new Date(fechaDeEmision);
        if (isNaN(formattedDate.getTime())) {
            const errorMessage = 'Formato de fecha no válido';
            registrarLog(req, errorMessage); // Registrar el error
            return res.status(400).json({ message: errorMessage });
        }
    }

    // Validar el turno, si se proporciona
    if (turno && !['mañana', 'tarde', 'noche'].includes(turno)) {
        const errorMessage = 'Turno no válido';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ message: errorMessage });
    }

    try {
        // Encuentra el horario a actualizar
        const horario = await Horario.findByPk(idHorario);
        if (!horario) {
            const errorMessage = 'Horario no encontrado';
            registrarLog(req, errorMessage); // Registrar el error
            return res.status(404).json({ message: errorMessage });
        }

        // Actualizar el horario con los campos proporcionados
        const updated = await Horario.update(
            {
                horaProgramada: horaProgramada || horario.horaProgramada,
                fechaDeEmision: fechaDeEmision || horario.fechaDeEmision,
                turno: turno || horario.turno
            },
            { where: { idHorario } }
        );

        if (updated[0] === 1) {
            registrarLog(req, 'Horario actualizado exitosamente'); // Registrar la acción exitosa
            res.json({ message: 'Horario actualizado exitosamente' });
        } else {
            const errorMessage = 'No se pudo actualizar el horario';
            registrarLog(req, errorMessage); // Registrar el error
            res.status(400).json({ message: errorMessage });
        }
    } catch (error) {
        registrarLog(req, `Error al actualizar horario: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un horario
exports.deleteHorario = async (req, res) => {
    try {
        const { idHorario } = req.params;
        if (!idHorario) {
            const errorMessage = 'ID del horario es requerido para la eliminación';
            registrarLog(req, errorMessage); // Registrar el error
            return res.status(400).json({ message: errorMessage });
        }

        // Verificar si el horario existe
        const horario = await Horario.findByPk(idHorario);
        if (!horario) {
            const errorMessage = 'Horario no encontrado';
            registrarLog(req, errorMessage); // Registrar el error
            return res.status(404).json({ message: errorMessage });
        }

        // Verificar si hay registros en la tabla peliculas asociados a este horario
        const peliculas = await Pelicula.findAll({ where: { idHorario } });
        if (peliculas.length > 0) {
            const errorMessage = 'No se puede eliminar el horario porque hay registros asociados en la tabla peliculas';
            registrarLog(req, errorMessage); // Registrar el error
            return res.status(400).json({ message: errorMessage });
        }

        // Eliminar el horario
        await Horario.destroy({ where: { idHorario } });

        registrarLog(req, 'Horario eliminado exitosamente'); // Registrar la acción exitosa
        res.json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
        registrarLog(req, `Error al eliminar horario: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};

// Generar reporte en PDF de los horarios
exports.getHorariosPDF = async (req, res) => {
    try {
        const horarios = await Horario.findAll();

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=horarios.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Horarios', { align: 'center' });

        horarios.forEach(horario => {
            doc.fontSize(12).text(`ID: ${horario.idHorario}`);
            doc.fontSize(12).text(`Hora Programada: ${horario.horaProgramada}`);
            doc.fontSize(12).text(`Turno: ${horario.turno}`);
            doc.fontSize(12).text(`Fecha de Emisión: ${horario.fechaDeEmision}`);
            doc.moveDown();
        });

        doc.end();
        registrarLog(req, 'Reporte de horarios en PDF generado exitosamente'); // Registrar la acción exitosa
    } catch (error) {
        registrarLog(req, `Error al generar reporte PDF de horarios: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};
