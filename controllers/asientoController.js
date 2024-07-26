const Asiento = require('../models/Asiento');
const Sala = require('../models/Sala');

exports.createAsiento = async (req, res) => {
    try {
        const { filaAsiento, idSalaAsiento, numeroAsiento, estadoAsiento } = req.body;

        // Validar que la sala exista
        const sala = await Sala.findByPk(idSalaAsiento);
        if (!sala) {
            return res.status(400).json({ message: 'La sala no existe. Debe crear primero la sala o comprobar los datos ingresados.' });
        }

        // Validar que el asiento no exista ya en la misma fila y sala
        const existingAsiento = await Asiento.findOne({
            where: { filaAsiento, idSalaAsiento, numeroAsiento }
        });
        if (existingAsiento) {
            return res.status(400).json({ message: 'El asiento ya existe en la misma fila y sala.' });
        }

        // Validar fila (debe ser una letra) y estadoAsiento
        if (!/^[A-Za-z]$/.test(filaAsiento)) {
            return res.status(400).json({ message: 'Fila no válida. Debe ser una letra.' });
        }
        if (!['disponible', 'ocupado'].includes(estadoAsiento)) {
            return res.status(400).json({ message: 'Estado no válido. Debe ser "disponible" o "ocupado".' });
        }

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

        // Validar estadoAsiento
        if (!['disponible', 'ocupado'].includes(estadoAsiento)) {
            return res.status(400).json({ message: 'Estado no válido. Debe ser "disponible" o "ocupado".' });
        }

        let searchCriteria = {};

        // Verificar si se ha proporcionado un idAsiento
        if (idAsiento) {
            searchCriteria = { idAsiento };
        } else if (filaAsiento && idSalaAsiento) {
            searchCriteria = { filaAsiento, idSalaAsiento };
        } else {
            return res.status(400).json({ message: 'Debe proporcionar el ID del asiento o la fila y la sala para la actualización.' });
        }

        // Realizar la actualización en la base de datos
        const [updated] = await Asiento.update({ estadoAsiento }, { where: searchCriteria });

        if (updated) {
            res.json({ message: 'Estado del asiento actualizado exitosamente' });
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
        const { id } = req.params;

        // Validar que el idAsiento sea proporcionado
        if (!id) {
            return res.status(400).json({ message: 'ID del asiento es requerido para la eliminación' });
        }

        // Verificar si el asiento existe antes de eliminar
        const asiento = await Asiento.findByPk(id);
        if (!asiento) {
            return res.status(404).json({ message: 'Asiento no encontrado' });
        }

        // Eliminar el asiento
        await Asiento.destroy({ where: { idAsiento: id } });

        res.json({ message: 'Asiento eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
