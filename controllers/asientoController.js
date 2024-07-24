const Asiento = require('../models/Asiento');

exports.createAsiento = async (req, res) => {
    try {
        const asiento = await Asiento.create(req.body);
        res.json(asiento);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAsientos = async (req, res) => {
    try {
        const asientos = await Asiento.findAll();
        res.json(asientos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener asientos por múltiples criterios
exports.getAsientos = async (req, res) => {
    try {
        // Extraer los criterios de búsqueda del query params
        const { idAsiento, filaAsiento, idSalaAsiento, estadoAsiento } = req.query;
        
        // Construir un objeto de búsqueda basado en los criterios proporcionados
        const searchCriteria = {};
        if (idAsiento) searchCriteria.idAsiento = idAsiento;
        if (filaAsiento) searchCriteria.filaAsiento = filaAsiento;
        if (idSalaAsiento) searchCriteria.idSalaAsiento = idSalaAsiento;
        if (estadoAsiento) searchCriteria.estadoAsiento = estadoAsiento;

        // Buscar los asientos en la base de datos con los criterios proporcionados
        const asientos = await Asiento.findAll({ where: searchCriteria });

        if (asientos.length > 0) {
            res.json(asientos);
        } else {
            res.status(404).json({ message: 'No se encontraron asientos con los criterios proporcionados' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar asientos por múltiples criterios
exports.updateAsientos = async (req, res) => {
    try {
        const { idAsiento, filaAsiento, idSalaAsiento, estadoAsiento } = req.body;

        // Validar que al menos uno de los campos esté presente
        if (!idAsiento && !filaAsiento && !idSalaAsiento && !estadoAsiento) {
            return res.status(400).json({ message: 'Debe proporcionar al menos un campo para actualizar' });
        }

        // Construir el objeto de actualización
        const updateFields = {};
        if (filaAsiento) updateFields.filaAsiento = filaAsiento;
        if (idSalaAsiento) updateFields.idSalaAsiento = idSalaAsiento;
        if (estadoAsiento) updateFields.estadoAsiento = estadoAsiento;

        // Verificar si se ha proporcionado un idAsiento para realizar la actualización
        if (!idAsiento) {
            return res.status(400).json({ message: 'ID del asiento es requerido para la actualización' });
        }

        // Realizar la actualización en la base de datos
        const [updated] = await Asiento.update(updateFields, { where: { idAsiento } });

        if (updated) {
            res.json({ message: 'Asiento actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Asiento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar asientos con validaciones
exports.deleteAsiento = async (req, res) => {
    try {
        const { idAsiento } = req.params;

        // Validar que el idAsiento sea proporcionado
        if (!idAsiento) {
            return res.status(400).json({ message: 'ID del asiento es requerido para la eliminación' });
        }

        // Verificar si el asiento existe antes de eliminar
        const asiento = await Asiento.findByPk(idAsiento);
        if (!asiento) {
            return res.status(404).json({ message: 'Asiento no encontrado' });
        }

        // Eliminar el asiento
        await Asiento.destroy({ where: { idAsiento } });

        res.json({ message: 'Asiento eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};