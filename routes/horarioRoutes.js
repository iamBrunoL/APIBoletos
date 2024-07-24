const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks
router.post('/', verifyToken, checkRole(['admin']), horarioController.createHorario);
router.get('/', verifyToken, checkRole(['admin']), horarioController.getAllHorarios);
router.put('/:id', verifyToken, checkRole(['admin']), horarioController.updateHorario);
router.delete('/:id', verifyToken, checkRole(['admin']), horarioController.deleteHorario);

module.exports = router;
