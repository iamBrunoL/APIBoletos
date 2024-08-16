const Log = require('../models/Log');
const registrarLog = require('../middleware/logs');

// Obtener los logs en orden descendente por `fechaHora` mostrando solo `usuario`, `accion`, `fechaHora`, y `host`
exports.getLogs = async (req, res) => {
    try {
        const logs = await Log.findAll({
            attributes: ['usuario', 'accion', 'fechaHora', 'host'],
            order: [['fechaHora', 'DESC']]
        });

        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog('getLogs',req, { logsCount: logs.length, userAgent }, 'info');

        res.json(logs);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog('getLogs',req, { error: error.message, userAgent }, 'error');
        res.status(500).json({ error: error.message });
    }
};
