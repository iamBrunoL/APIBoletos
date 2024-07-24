const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks

// Crear una nueva sala
router.post('/', verifyToken, checkRole(['admin']), salaController.createSala);

// Obtener todas las salas
router.get('/', verifyToken, checkRole(['admin']), salaController.getAllSalas);

// Buscar salas por criterios
router.get('/search', verifyToken, checkRole(['admin']), salaController.getSalas);

// Actualizar una sala
router.put('/', verifyToken, checkRole(['admin']), salaController.updateSala);

// Eliminar una sala
router.delete('/:idSala', verifyToken, checkRole(['admin']), salaController.deleteSala);

module.exports = router;
