const express = require('express');
const router = express.Router();
const boletoController = require('../controllers/boletoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks
router.post('/', verifyToken, checkRole(['cliente']), boletoController.createBoleto);
router.get('/', verifyToken, checkRole(['admin']), boletoController.getAllBoletos);
router.get('/:id', verifyToken, checkRole(['admin']), boletoController.getBoletoById);
router.put('/:id', verifyToken, boletoController.updateBoleto);
router.delete('/:id', verifyToken, checkRole(['cliente']), boletoController.deleteBoleto);

module.exports = router;
