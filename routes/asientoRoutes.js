const express = require('express');
const router = express.Router();
const asientoController = require('../controllers/asientoController');

// Definir rutas y sus callbacks
router.post('/', asientoController.createAsiento);
router.get('/', asientoController.getAllAsientos);
router.get('/:id', asientoController.getAsientoById);
router.put('/:id', asientoController.updateAsiento);
router.delete('/:id', asientoController.deleteAsiento);

module.exports = router;
