const Horario = require('../models/Horario');
const Pelicula = require('../models/Pelicula');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');
const registrarLog = require('../middleware/logs'); // Asegúrate de que la ruta sea correcta

// Crear un nuevo horario
exports.createHorario = async (req, res) => {
    const { horaProgramada } = req.body;
    const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';

    // Validación de datos
    if (!horaProgramada) {
        const errorMessage = 'La hora programada es requerida';
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'createHorario', { errorMessage, userAgent }, 'warn');
        return res.status(400).json({ message: errorMessage });
    }

    // Validar el formato de horaProgramada
    if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(horaProgramada)) {
        const errorMessage = 'Formato de hora no válido';
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'createHorario', { errorMessage, userAgent }, 'warn');
        return res.status(400).json({ message: errorMessage });
    }


    try {
        const horario = await Horario.create({
            horaProgramada
        });
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'createHorario', { message: 'Horario creado exitosamente', horario, userAgent }, 'info');
        res.status(201).json(horario);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'createHorario', { error: error.message, userAgent }, 'error');
        res.status(500).json({ error: 'Error al crear el horario. Por favor, intenta de nuevo más tarde.' });
    }
};

// Obtener todos los horarios
exports.getAllHorarios = async (req, res) => {
    const userAgent = req.headers && req.headers['user-agent'] ? req.headers['user-agent'] : 'unknown';
    try {
        const horarios = await Horario.findAll();
        if (!horarios || horarios.length === 0) {
            throw new Error('No se encontraron horarios.');
        }
        registrarLog(req, 'getAllHorarios', { message: 'Horarios consultados exitosamente', userAgent }, 'info');
        res.json(horarios);
    } catch (error) {
        registrarLog(req, 'getAllHorarios', { error: error.message, userAgent }, 'error');
        res.status(500).json({ error: 'Error al obtener los horarios. Por favor, intenta de nuevo más tarde.' });
    }
};


// Obtener horarios por criterios de búsqueda
exports.getHorarios = async (req, res) => {
    const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';

    try {
        const { idHorario, horaProgramada } = req.query;
        const searchCriteria = {};

        if (idHorario) searchCriteria.idHorario = idHorario;

        if (horaProgramada) {
            const time = horaProgramada;
            if (!/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(time)) {
                const errorMessage = 'Formato de hora no válido';
                registrarLog('Formato de hora no válido', req, userAgent, 'error');
                return res.status(400).json({ message: errorMessage });
            }
            searchCriteria.horaProgramada = {
                [Op.eq]: time
            };
        }

        const horarios = await Horario.findAll({
            where: searchCriteria
        });

        if (horarios.length > 0) {
            registrarLog('Horarios encontrados con los criterios de búsqueda', req, userAgent, 'info');
            res.json(horarios);
        } else {
            const errorMessage = 'No se encontraron horarios con los criterios proporcionados';
            registrarLog('No se encontraron horarios con los criterios proporcionados', req, userAgent, 'warning');
            res.status(404).json({ message: errorMessage });
        }
    } catch (error) {
        registrarLog(`Error al obtener horarios por criterios: ${error.message}`, req, userAgent, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Actualizar horarios por múltiples criterios
exports.updateHorarios = async (req, res) => {
    const { idHorario, horaProgramada } = req.body;
    const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';

    if (!idHorario) {
        const errorMessage = 'ID del horario es requerido para la actualización';
        registrarLog('ID del horario es requerido para la actualización', req, userAgent, 'error');
        return res.status(400).json({ message: errorMessage });
    }

    if (horaProgramada && !/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/.test(horaProgramada)) {
        const errorMessage = 'Formato de hora no válido';
        registrarLog('Formato de hora no válido', req, userAgent, 'error');
        return res.status(400).json({ message: errorMessage });
    }

    try {
        const horario = await Horario.findByPk(idHorario);
        if (!horario) {
            const errorMessage = 'Horario no encontrado';
            registrarLog('Horario no encontrado', req, userAgent, 'warning');
            return res.status(404).json({ message: errorMessage });
        }

        const updated = await Horario.update(
            {
                horaProgramada: horaProgramada || horario.horaProgramada
            },
            { where: { idHorario } }
        );

        if (updated[0] === 1) {
            registrarLog('Horario actualizado exitosamente', req, userAgent, 'info');
            res.json({ message: 'Horario actualizado exitosamente' });
        } else {
            const errorMessage = 'No se pudo actualizar el horario';
            registrarLog('No se pudo actualizar el horario', req, userAgent, 'error');
            res.status(400).json({ message: errorMessage });
        }
    } catch (error) {
        registrarLog(`Error al actualizar horario: ${error.message}`, req, userAgent, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un horario por ID
exports.deleteHorario = async (req, res) => {
    const { idHorario } = req.params;
    const userAgent = req.headers['user-agent'] || 'unknown';
    
    // Log para depuración
    console.log('User-Agent:', userAgent);

    if (!idHorario) {
        const errorMessage = 'ID del horario es requerido para la eliminación';
        registrarLog(req, 'deleteHorario', { message: errorMessage, userAgent }, 'error');
        return res.status(400).json({ message: errorMessage });
    }

    try {
        // Verificar si el horario existe
        const horario = await Horario.findOne({ where: { idHorario } });

        if (!horario) {
            const errorMessage = 'Horario no encontrado';
            registrarLog(req, 'deleteHorario', { message: errorMessage, userAgent }, 'warning');
            return res.status(404).json({ message: errorMessage });
        }

        // Verificar si hay registros en la tabla peliculas asociados a este horario
        const peliculas = await Pelicula.findAll({ where: { idHorario } });
        if (peliculas.length > 0) {
            const errorMessage = 'No se puede eliminar el horario porque hay registros asociados en la tabla peliculas';
            registrarLog(req, 'deleteHorario', { message: errorMessage, userAgent }, 'warning');
            return res.status(400).json({ message: errorMessage });
        }

        // Eliminar el horario
        await horario.destroy();
        registrarLog(req, 'deleteHorario', { message: 'Horario eliminado exitosamente', userAgent }, 'info');
        res.json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
        registrarLog(req, 'deleteHorario', { error: error.message, userAgent }, 'error');
        res.status(500).json({ error: 'Error al eliminar el horario. Por favor, intenta de nuevo más tarde.' });
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
            doc.moveDown();
        });

        doc.end();
        registrarLog(req, 'Reporte de horarios en PDF generado exitosamente'); // Registrar la acción exitosa
    } catch (error) {
        registrarLog(req, `Error al generar reporte PDF de horarios: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};
