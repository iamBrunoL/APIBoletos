const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks

// Crear un nuevo pago
router.post('/', verifyToken, checkRole(['admin']), pagoController.createPago);

// Obtener todos los pagos
router.get('/', verifyToken, checkRole(['admin']), pagoController.getAllPagos);

// Obtener pagos por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin']), pagoController.getPagos);

// Actualizar pagos por múltiples criterios
router.put('/', verifyToken, checkRole(['admin']), pagoController.updatePagos);

// Eliminar un pago
router.delete('/:id', verifyToken, checkRole(['admin']), pagoController.deletePago);

// Ruta para generar el reporte en PDF de los pagos
router.get('/reporte/pdf', verifyToken, checkRole(['admin']), pagoController.getPagosPDF);

module.exports = router;
