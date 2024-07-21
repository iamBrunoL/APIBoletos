const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks
router.post('/', verifyToken, checkRole(['admin']), salaController.createSala);
router.get('/', verifyToken, checkRole(['admin']), salaController.getAllSalas);
router.get('/:id', verifyToken, checkRole(['admin']), salaController.getSalaById);
router.put('/:id', verifyToken, checkRole(['admin']), salaController.updateSala);
router.delete('/:id', verifyToken, checkRole(['admin']), salaController.deleteSala);

module.exports = router;
