const express = require('express');
const router = express.Router();
const logController = require('../controllers/logController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Obtener logs en orden descendente (de los más recientes a los más antiguos)
router.get('/', verifyToken, checkRole(['admin','cliente']), logController.getLogs);

module.exports = router;
