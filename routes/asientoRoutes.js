const express = require('express');
const router = express.Router();
const asientoController = require('../controllers/asientoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks

// Crear un nuevo asiento
router.post('/', verifyToken, checkRole(['admin']), asientoController.createAsiento);

// Obtener todos los asientos
router.get('/', verifyToken, checkRole(['admin']), asientoController.getAllAsientos);

// Obtener asientos por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin']), asientoController.getAsientos);

// Actualizar asientos por múltiples criterios
router.put('/', verifyToken, checkRole(['admin']), asientoController.updateAsientos);

// Eliminar un asiento
router.delete('/:id', verifyToken, checkRole(['admin']), asientoController.deleteAsiento);

// Generar reporte PDF de los asientos
router.get('/reporte', verifyToken, checkRole(['admin']), asientoController.getAsientosPDF);

module.exports = router;
