const Boleto = require('../models/Boleto');

exports.createBoleto = async (req, res) => {
    try {
        const boleto = await Boleto.create(req.body);
        res.json(boleto);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllBoletos = async (req, res) => {
    try {
        const boletos = await Boleto.findAll();
        res.json(boletos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getBoletoById = async (req, res) => {
    try {
        const boleto = await Boleto.findByPk(req.params.id);
        if (boleto) {
            res.json(boleto);
        } else {
            res.status(404).json({ message: 'Boleto no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updateBoleto = async (req, res) => {
    try {
        await Boleto.update(req.body, { where: { idBoleto: req.params.id } });
        res.json({ message: 'Boleto actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteBoleto = async (req, res) => {
    try {
        await Boleto.destroy({ where: { idBoleto: req.params.id } });
        res.json({ message: 'Boleto eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
