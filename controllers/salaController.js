const Sala = require('../models/Sala');
const PDFDocument = require('pdfkit');

// Crear una nueva sala
exports.createSala = async (req, res) => {
    const { nombreSala, capacidadSala } = req.body;

    try {
        const sala = await Sala.create({
            nombreSala,
            capacidadSala
        });

        res.status(201).json(sala);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todas las salas
exports.getAllSalas = async (req, res) => {
    try {
        const salas = await Sala.findAll();
        res.json(salas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener salas por criterios de búsqueda
exports.getSalas = async (req, res) => {
    try {
        const { idSala, nombreSala } = req.query;
        const searchCriteria = {};
        if (idSala) searchCriteria.idSala = idSala;
        if (nombreSala) searchCriteria.nombreSala = nombreSala;

        const salas = await Sala.findAll({ where: searchCriteria });

        if (salas.length > 0) {
            res.json(salas);
        } else {
            res.status(404).json({ message: 'No se encontraron salas con los criterios proporcionados' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar salas por múltiples criterios
exports.updateSalas = async (req, res) => {
    try {
        const { idSala, nombreSala, capacidadSala } = req.body;

        if (!idSala) {
            return res.status(400).json({ message: 'ID de la sala es requerido para la actualización' });
        }

        const updateFields = {};
        if (nombreSala) updateFields.nombreSala = nombreSala;
        if (capacidadSala) updateFields.capacidadSala = capacidadSala;

        const [updated] = await Sala.update(updateFields, { where: { idSala } });

        if (updated) {
            res.json({ message: 'Sala actualizada exitosamente' });
        } else {
            res.status(404).json({ message: 'Sala no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una sala
exports.deleteSala = async (req, res) => {
    try {
        const { idSala } = req.params;

        if (!idSala) {
            return res.status(400).json({ message: 'ID de la sala es requerido para la eliminación' });
        }

        const sala = await Sala.findByPk(idSala);
        if (!sala) {
            return res.status(404).json({ message: 'Sala no encontrada' });
        }

        await Sala.destroy({ where: { idSala } });

        res.json({ message: 'Sala eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generar reporte en PDF de las salas
exports.getSalasPDF = async (req, res) => {
    try {
        const salas = await Sala.findAll();

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=salas.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Salas', { align: 'center' });

        salas.forEach(sala => {
            doc.fontSize(12).text(`ID: ${sala.idSala}`);
            doc.fontSize(12).text(`Nombre: ${sala.nombreSala}`);
            doc.fontSize(12).text(`Capacidad: ${sala.capacidadSala}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
