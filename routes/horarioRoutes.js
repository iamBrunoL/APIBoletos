const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');
const verifyToken = require('../middleware/auth');

// Definir rutas y sus callbacks
router.post('/', verifyToken, horarioController.createHorario);
router.get('/', verifyToken, horarioController.getAllHorarios);
router.get('/:id', verifyToken, horarioController.getHorarioById);
router.put('/:id', verifyToken, horarioController.updateHorario);
router.delete('/:id', verifyToken, horarioController.deleteHorario);

module.exports = router;
