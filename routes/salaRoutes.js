const express = require('express');
const router = express.Router();
const salaController = require('../controllers/salaController');

// Definir rutas y sus callbacks
router.post('/', salaController.createSala);
router.get('/', salaController.getAllSalas);
router.get('/:id', salaController.getSalaById);
router.put('/:id', salaController.updateSala);
router.delete('/:id', salaController.deleteSala);

module.exports = router;
