const express = require('express');
const router = express.Router();
const asientoController = require('../controllers/asientoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks

// Crear un nuevo asiento
router.post('/', verifyToken, checkRole(['admin','cliente']), asientoController.createAsiento);

// Obtener todos los asientos
router.get('/', verifyToken, checkRole(['admin','cliente']), asientoController.getAllAsientos);

// Obtener asientos por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin','cliente']), asientoController.getAsientos);

// Actualizar asientos por múltiples criterios
router.put('/', verifyToken, checkRole(['admin','cliente']), asientoController.updateAsientos);

// Eliminar un asiento
router.delete('/:id', verifyToken, checkRole(['admin','cliente']), asientoController.deleteAsiento);

// Generar reporte PDF de los asientos
router.get('/reporte', verifyToken, checkRole(['admin','cliente']), asientoController.getAsientosPDF);

module.exports = router;
