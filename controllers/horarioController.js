const Horario = require('../models/Horario');
const Pelicula = require('../models/Pelicula');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');
const { validationResult } = require('express-validator');

// Crear un nuevo horario
exports.createHorario = async (req, res) => {
    const { horaProgramada, fechaDeEmision, turno } = req.body;

    // Validación de datos
    if (!horaProgramada) {
        return res.status(400).json({ message: 'La hora programada es requerida' });
    }
    if (!fechaDeEmision) {
        return res.status(400).json({ message: 'La fecha de emisión es requerida' });
    }
    if (!turno) {
        return res.status(400).json({ message: 'El turno es requerido' });
    }

    // Validar el formato de horaProgramada
    if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(horaProgramada)) {
        return res.status(400).json({ message: 'Formato de hora no válido' });
    }

    // Validar el formato de fechaDeEmision
    const formattedDate = new Date(fechaDeEmision);
    if (isNaN(formattedDate.getTime())) {
        return res.status(400).json({ message: 'Formato de fecha no válido' });
    }

    // Validar el turno
    const validTurnos = ['mañana', 'tarde', 'noche'];
    if (!validTurnos.includes(turno)) {
        return res.status(400).json({ message: 'Turno no válido' });
    }

    try {
        const horario = await Horario.create({
            horaProgramada,
            fechaDeEmision,
            turno
        });

        res.status(201).json(horario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Obtener todos los horarios
exports.getAllHorarios = async (req, res) => {
    try {
        const horarios = await Horario.findAll();
        res.json(horarios);
    } catch (error) {
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
                return res.status(400).json({ message: 'Formato de fecha no válido' });
            }
            searchCriteria.fechaDeEmision = {
                [Op.eq]: formattedDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
            };
        }

        if (horaProgramada) {
            // Validar y ajustar formato de horaProgramada
            const time = horaProgramada;
            if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time)) {
                return res.status(400).json({ message: 'Formato de hora no válido' });
            }
            searchCriteria.horaProgramada = {
                [Op.eq]: time
            };
        }

        if (turno) {
            if (!['mañana', 'tarde', 'noche'].includes(turno)) {
                return res.status(400).json({ message: 'Turno no válido' });
            }
            searchCriteria.turno = turno;
        }

        console.log('Search Criteria:', searchCriteria); // Depura los criterios de búsqueda

        // Ejecutar la consulta
        const horarios = await Horario.findAll({
            where: searchCriteria
        });

        console.log('Horarios Encontrados:', horarios); // Depura los horarios encontrados

        if (horarios.length > 0) {
            res.json(horarios);
        } else {
            res.status(404).json({ message: 'No se encontraron horarios con los criterios proporcionados' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar horarios por múltiples criterios
exports.updateHorarios = async (req, res) => {
    const { idHorario, horaProgramada, fechaDeEmision, turno } = req.body;

    // Validación de datos
    if (!idHorario) {
        return res.status(400).json({ message: 'ID del horario es requerido para la actualización' });
    }

    // Validar el formato de horaProgramada, si se proporciona
    if (horaProgramada && !/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(horaProgramada)) {
        return res.status(400).json({ message: 'Formato de hora no válido' });
    }

    // Validar el formato de fechaDeEmision, si se proporciona
    if (fechaDeEmision) {
        const formattedDate = new Date(fechaDeEmision);
        if (isNaN(formattedDate.getTime())) {
            return res.status(400).json({ message: 'Formato de fecha no válido' });
        }
    }

    // Validar el turno, si se proporciona
    if (turno && !['mañana', 'tarde', 'noche'].includes(turno)) {
        return res.status(400).json({ message: 'Turno no válido' });
    }

    try {
        // Encuentra el horario a actualizar
        const horario = await Horario.findByPk(idHorario);
        if (!horario) {
            return res.status(404).json({ message: 'Horario no encontrado' });
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
            res.json({ message: 'Horario actualizado exitosamente' });
        } else {
            res.status(400).json({ message: 'No se pudo actualizar el horario' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteHorario = async (req, res) => {
    try {
        const { idHorario } = req.params;
        console.log('ID del horario recibido:', idHorario);

        if (!idHorario) {
            return res.status(400).json({ message: 'ID del horario es requerido para la eliminación' });
        }

        // Verificar si el horario existe
        const horario = await Horario.findByPk(idHorario);
        if (!horario) {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }

        // Verificar si hay registros en la tabla peliculas asociados a este horario
        const peliculas = await Pelicula.findAll({ where: { idHorario } });
        if (peliculas.length > 0) {
            return res.status(400).json({ message: 'No se puede eliminar el horario porque hay registros asociados en la tabla peliculas' });
        }

        // Eliminar el horario
        await Horario.destroy({ where: { idHorario } });

        res.json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
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
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
