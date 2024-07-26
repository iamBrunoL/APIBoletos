const express = require('express');
const router = express.Router();
const horarioController = require('../controllers/horarioController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks

// Crear un nuevo horario
router.post('/', verifyToken, checkRole(['admin']), horarioController.createHorario);

// Obtener todos los horarios
router.get('/', verifyToken, checkRole(['admin']), horarioController.getAllHorarios);

// Obtener horarios por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin']), horarioController.getHorarios);

// Actualizar horarios por múltiples criterios
router.put('/', verifyToken, checkRole(['admin']), horarioController.updateHorarios);

// Eliminar un horario
router.delete('/:idHorario', verifyToken, checkRole(['admin']), horarioController.deleteHorario);

// Ruta para generar el reporte en PDF de los horarios
router.get('/reporte', horarioController.getHorariosPDF);

module.exports = router;
