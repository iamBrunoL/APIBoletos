const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');
const verifyToken = require('../middleware/auth');

// Definir rutas y sus callbacks
router.post('/', verifyToken, salaController.createSala);
router.get('/', verifyToken, salaController.getAllSalas);
router.get('/:id', verifyToken, salaController.getSalaById);
router.put('/:id', verifyToken, salaController.updateSala);
router.delete('/:id', verifyToken, salaController.deleteSala);

module.exports = router;
