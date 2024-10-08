const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Crear una nueva sala
router.post('/', verifyToken, checkRole(['admin','cliente']), salaController.createSala);

// Obtener todas las salas
router.get('/', verifyToken, checkRole(['admin','cliente']), salaController.getAllSalas);

// Obtener salas por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin','cliente']), salaController.getSalas);

// Actualizar salas por múltiples criterios
router.put('/', verifyToken, checkRole(['admin','cliente']), salaController.updateSalas);

// Eliminar una sala
router.delete('/:idSala', verifyToken, checkRole(['admin','cliente']), salaController.deleteSala);

// Ruta para generar el reporte en PDF de las salas
router.get('/reporte', verifyToken, checkRole(['admin','cliente']), salaController.getSalasPDF);

module.exports = router;
