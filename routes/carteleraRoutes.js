const express = require('express');
const router = express.Router();
const carteleraController = require('../controllers/carteleraController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Crear una nueva entrada en la cartelera
router.post('/', verifyToken, checkRole(['admin']), carteleraController.createCartelera);

// Obtener todas las entradas en la cartelera
router.get('/', verifyToken, checkRole(['admin']), carteleraController.getAllCarteleras);

// Eliminar una entrada en la cartelera
router.delete('/:idCartelera', verifyToken, checkRole(['admin']), carteleraController.deleteCartelera);

module.exports = router;
