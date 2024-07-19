const express = require('express');
const router = express.Router();
const boletoController = require('../controllers/boletoController');

// Definir rutas y sus callbacks
router.post('/', boletoController.createBoleto);
router.get('/', boletoController.getAllBoletos);
router.get('/:id', boletoController.getBoletoById);
router.put('/:id', boletoController.updateBoleto);
router.delete('/:id', boletoController.deleteBoleto);

module.exports = router;
