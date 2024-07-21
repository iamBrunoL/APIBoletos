const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks
router.post('/', usuarioController.createUsuario);
router.post('/login', usuarioController.loginUsuario); // Ruta para login no protegida
router.post('/logout', usuarioController.logoutUsuario);

router.get('/', verifyToken, checkRole(['admin']), usuarioController.getAllUsuarios);
router.get('/:id', verifyToken, checkRole(['admin']), usuarioController.getUsuarioById);
router.put('/:id', verifyToken, checkRole(['admin']), usuarioController.updateUsuario);
router.delete('/:id', verifyToken, checkRole(['admin']), usuarioController.deleteUsuario);

module.exports = router;
