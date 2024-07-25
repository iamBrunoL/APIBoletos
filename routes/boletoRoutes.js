const express = require('express');
const router = express.Router();
const boletoController = require('../controllers/boletoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks

// Crear un nuevo boleto
router.post('/', verifyToken, checkRole(['cliente']), boletoController.createBoleto);

// Obtener todos los boletos
router.get('/', verifyToken, checkRole(['admin']), boletoController.getAllBoletos);

// Obtener boletos por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin']), boletoController.getBoletos);

// Actualizar boletos por múltiples criterios
router.put('/', verifyToken, checkRole(['admin']), boletoController.updateBoletos);

// Eliminar un boleto
router.delete('/:id', verifyToken, checkRole(['admin']), boletoController.deleteBoleto);

// Ruta para generar el reporte en PDF de los boletos
router.get('/reporte/pdf', verifyToken, checkRole(['admin']), boletoController.getBoletosPDF);

module.exports = router;
