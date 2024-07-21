const express = require('express');
const router = express.Router();
const asientoController = require('../controllers/asientoController');
const verifyToken = require('../middleware/auth');

// Definir rutas y sus callbacks
router.post('/', verifyToken, asientoController.createAsiento);
router.get('/', verifyToken, asientoController.getAllAsientos);
router.get('/:id', verifyToken, asientoController.getAsientoById);
router.put('/:id', verifyToken, asientoController.updateAsiento);
router.delete('/:id', verifyToken, asientoController.deleteAsiento);

module.exports = router;
