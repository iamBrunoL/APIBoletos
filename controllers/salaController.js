const Sala = require('../models/Sala');

// Crear una nueva sala
exports.createSala = async (req, res) => {
    try {
        const sala = await Sala.create(req.body);
        res.json(sala);
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

// Obtener salas por múltiples criterios
exports.getSalas = async (req, res) => {
    try {
        const { idSala, nombreSala, ubicacionSala } = req.query;
        
        const searchCriteria = {};
        if (idSala) searchCriteria.idSala = idSala;
        if (nombreSala) searchCriteria.nombreSala = nombreSala;
        if (ubicacionSala) searchCriteria.ubicacionSala = ubicacionSala;

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

// Actualizar una sala
exports.updateSala = async (req, res) => {
    try {
        const { idSala, nombreSala, ubicacionSala, capacidadSala } = req.body;

        if (!idSala) {
            return res.status(400).json({ message: 'ID de la sala es requerido para la actualización' });
        }

        const updateFields = {};
        if (nombreSala) updateFields.nombreSala = nombreSala;
        if (ubicacionSala) updateFields.ubicacionSala = ubicacionSala;
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
