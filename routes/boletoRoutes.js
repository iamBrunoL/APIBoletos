const express = require('express');
const router = express.Router();
const boletoController = require('../controllers/boletoController');
const verifyToken = require('../middleware/auth');

// Definir rutas y sus callbacks
router.post('/', verifyToken, boletoController.createBoleto);
router.get('/', verifyToken, boletoController.getAllBoletos);
router.get('/:id', verifyToken, boletoController.getBoletoById);
router.put('/:id', verifyToken, boletoController.updateBoleto);
router.delete('/:id', verifyToken, boletoController.deleteBoleto);

module.exports = router;
