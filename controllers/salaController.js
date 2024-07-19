const Sala = require('../models/Sala');

exports.createSala = async (req, res) => {
    try {
        const sala = await Sala.create(req.body);
        res.json(sala);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllSalas = async (req, res) => {
    try {
        const salas = await Sala.findAll();
        res.json(salas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getSalaById = async (req, res) => {
    try {
        const sala = await Sala.findByPk(req.params.id);
        if (sala) {
            res.json(sala);
        } else {
            res.status(404).json({ message: 'Sala no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateSala = async (req, res) => {
    try {
        await Sala.update(req.body, { where: { idSala: req.params.id } });
        res.json({ message: 'Sala actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteSala = async (req, res) => {
    try {
        await Sala.destroy({ where: { idSala: req.params.id } });
        res.json({ message: 'Sala eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
