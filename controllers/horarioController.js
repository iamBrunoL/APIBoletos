const Horario = require('../models/Horario');

exports.createHorario = async (req, res) => {
    try {
        const horario = await Horario.create(req.body);
        res.json(horario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllHorarios = async (req, res) => {
    try {
        const horarios = await Horario.findAll();
        res.json(horarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getHorarioById = async (req, res) => {
    try {
        const horario = await Horario.findByPk(req.params.id);
        if (horario) {
            res.json(horario);
        } else {
            res.status(404).json({ message: 'Horario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateHorario = async (req, res) => {
    try {
        await Horario.update(req.body, { where: { idHorario: req.params.id } });
        res.json({ message: 'Horario actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteHorario = async (req, res) => {
    try {
        await Horario.destroy({ where: { idHorario: req.params.id } });
        res.json({ message: 'Horario eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
