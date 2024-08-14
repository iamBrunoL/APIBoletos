const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Crear un nuevo mensaje de contacto
router.post('/contact', verifyToken, checkRole(['cliente']), contactController.createMessage);

// Obtener todos los mensajes de contacto
router.get('/contact', verifyToken, checkRole(['admin']), contactController.getAllMessages);

// Obtener un mensaje de contacto por su ID
router.get('/contact/:id', verifyToken, checkRole(['admin']), contactController.getMessageById);

// Eliminar un mensaje de contacto por su ID
router.delete('/contact/:id', verifyToken, checkRole(['admin']), contactController.deleteMessage);

module.exports = router;
