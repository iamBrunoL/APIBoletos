const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks

// Crear un nuevo pago
router.post('/', verifyToken, checkRole(['admin','cliente']), pagoController.createPago);

// Obtener todos los pagos
router.get('/', verifyToken, checkRole(['admin','cliente']), pagoController.getAllPagos);

// Obtener pagos por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin','cliente']), pagoController.getPagos);

// Actualizar pagos por múltiples criterios
router.put('/', verifyToken, checkRole(['admin','cliente']), pagoController.updatePagos);

// Eliminar un pago
router.delete('/:idCompra', verifyToken, checkRole(['admin','cliente']), pagoController.deletePago);

// Ruta para generar el reporte en PDF de los pagos
router.get('/reporte', verifyToken, checkRole(['admin','cliente']),  pagoController.getPagosPDF);

module.exports = router;
