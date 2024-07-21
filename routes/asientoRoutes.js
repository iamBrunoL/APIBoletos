const express = require('express');
const router = express.Router();
const asientoController = require('../controllers/asientoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks
router.post('/', verifyToken, checkRole(['admin']), asientoController.createAsiento);
router.get('/', verifyToken, checkRole(['admin']), asientoController.getAllAsientos);
router.get('/:id', verifyToken, checkRole(['admin']), asientoController.getAsientoById);
router.put('/:id', verifyToken, checkRole(['admin']), asientoController.updateAsiento);
router.delete('/:id', verifyToken, checkRole(['admin']), asientoController.deleteAsiento);

module.exports = router;
