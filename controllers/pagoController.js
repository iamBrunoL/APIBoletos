const Pago = require('../models/Pago');

exports.createPago = async (req, res) => {
    try {
        const pago = await Pago.create(req.body);
        res.json(pago);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllPagos = async (req, res) => {
    try {
        const pagos = await Pago.findAll();
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPagoById = async (req, res) => {
    try {
        const pago = await Pago.findByPk(req.params.id);
        if (pago) {
            res.json(pago);
        } else {
            res.status(404).json({ message: 'Pago no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePago = async (req, res) => {
    try {
        await Pago.update(req.body, { where: { idCompra: req.params.id } });
        res.json({ message: 'Pago actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePago = async (req, res) => {
    try {
        await Pago.destroy({ where: { idCompra: req.params.id } });
        res.json({ message: 'Pago eliminado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
