const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');

// Definir rutas y sus callbacks
router.post('/', horarioController.createHorario);
router.get('/', horarioController.getAllHorarios);
router.get('/:id', horarioController.getHorarioById);
router.put('/:id', horarioController.updateHorario);
router.delete('/:id', horarioController.deleteHorario);

module.exports = router;
