const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const verifyToken = require('../middleware/auth');

// Definir rutas y sus callbacks
router.post('/', verifyToken, pagoController.createPago);
router.get('/', verifyToken, pagoController.getAllPagos);
router.get('/:id', verifyToken, pagoController.getPagoById);
router.put('/:id', verifyToken, pagoController.updatePago);
router.delete('/:id', verifyToken, pagoController.deletePago);

module.exports = router;
