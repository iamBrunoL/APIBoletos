const express = require('express');
const router = express.Router();
const boletoController = require('../controllers/boletoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Crear un nuevo boleto con generación de QR
router.post('/', verifyToken, checkRole(['cliente']), boletoController.createBoleto);

// Obtener todos los boletos
router.get('/', verifyToken, checkRole(['admin','cliente']), boletoController.getAllBoletos);

// Obtener boletos por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin','cliente']), boletoController.getBoletos);

// Actualizar boletos por múltiples criterios
router.put('/', verifyToken, checkRole(['admin','cliente']), boletoController.updateBoletos);

// Eliminar un boleto
router.delete('/:id', verifyToken, checkRole(['admin','cliente']), boletoController.deleteBoleto);

// Generar reporte en PDF de boletos
router.get('/reporte', verifyToken, checkRole(['admin','cliente']), boletoController.generateReport);

module.exports = router;
