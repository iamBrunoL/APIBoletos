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

exports.getAsientoById = async (req, res) => {
    try {
        const asiento = await Asiento.findByPk(req.params.id);
        if (asiento) {
            res.json(asiento);
        } else {
            res.status(404).json({ message: 'Asiento no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateAsiento = async (req, res) => {
    try {
        await Asiento.update(req.body, { where: { idAsiento: req.params.id } });
        res.json({ message: 'Asiento actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteAsiento = async (req, res) => {
    try {
        await Asiento.destroy({ where: { idAsiento: req.params.id } });
        res.json({ message: 'Asiento eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
