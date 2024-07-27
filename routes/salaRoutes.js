const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Crear una nueva sala
router.post('/', verifyToken, checkRole(['admin']), salaController.createSala);

// Obtener todas las salas
router.get('/', verifyToken, checkRole(['admin']), salaController.getAllSalas);

// Obtener salas por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin']), salaController.getSalas);

// Actualizar salas por múltiples criterios
router.put('/', verifyToken, checkRole(['admin']), salaController.updateSalas);

// Eliminar una sala
router.delete('/:idSala', verifyToken, checkRole(['admin']), salaController.deleteSala);

// Ruta para generar el reporte en PDF de las salas
router.get('/reporte', verifyToken, checkRole(['admin']), salaController.getSalasPDF);

module.exports = router;
