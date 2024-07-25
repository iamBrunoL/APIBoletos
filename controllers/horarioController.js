const Horario = require('../models/Horario');
const Pelicula = require('../models/Pelicula');
const Sala = require('../models/Sala');
const PDFDocument = require('pdfkit');

// Crear un nuevo horario
exports.createHorario = async (req, res) => {
    const { idPelicula, idSala, horaProgramada, fechaDeEmision } = req.body;

    try {
        const horario = await Horario.create({
            idPelicula,
            idSala,
            horaProgramada,
            fechaDeEmision
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
        const { idHorario, idPelicula, idSala, fechaDeEmision } = req.query;
        const searchCriteria = {};
        if (idHorario) searchCriteria.idHorario = idHorario;
        if (idPelicula) searchCriteria.idPelicula = idPelicula;
        if (idSala) searchCriteria.idSala = idSala;
        if (fechaDeEmision) searchCriteria.fechaDeEmision = fechaDeEmision;

        const horarios = await Horario.findAll({ where: searchCriteria });

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
    try {
        const { idHorario, idPelicula, idSala, horaProgramada, fechaDeEmision } = req.body;

        if (!idHorario) {
            return res.status(400).json({ message: 'ID del horario es requerido para la actualización' });
        }

        const updateFields = {};
        if (idPelicula) updateFields.idPelicula = idPelicula;
        if (idSala) updateFields.idSala = idSala;
        if (horaProgramada) updateFields.horaProgramada = horaProgramada;
        if (fechaDeEmision) updateFields.fechaDeEmision = fechaDeEmision;

        const [updated] = await Horario.update(updateFields, { where: { idHorario } });

        if (updated) {
            res.json({ message: 'Horario actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Horario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un horario
exports.deleteHorario = async (req, res) => {
    try {
        const { idHorario } = req.params;

        if (!idHorario) {
            return res.status(400).json({ message: 'ID del horario es requerido para la eliminación' });
        }

        const horario = await Horario.findByPk(idHorario);
        if (!horario) {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }

        await Horario.destroy({ where: { idHorario } });

        res.json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generar reporte en PDF de los horarios
exports.getHorariosPDF = async (req, res) => {
    try {
        const horarios = await Horario.findAll({
            include: [
                { model: Pelicula, attributes: ['nombrePelicula'] },
                { model: Sala, attributes: ['nombreSala'] }
            ]
        });

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=horarios.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Horarios', { align: 'center' });

        horarios.forEach(horario => {
            doc.fontSize(12).text(`ID: ${horario.idHorario}`);
            doc.fontSize(12).text(`Película: ${horario.Pelicula.nombrePelicula}`);
            doc.fontSize(12).text(`Sala: ${horario.Sala.nombreSala}`);
            doc.fontSize(12).text(`Hora Programada: ${horario.horaProgramada}`);
            doc.fontSize(12).text(`Fecha de Emision: ${horario.fechaDeEmision}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
