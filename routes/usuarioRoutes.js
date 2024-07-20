const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verifyToken = require('../middleware/auth');

// Definir rutas y sus callbacks
router.post('/', usuarioController.createUsuario);
router.post('/login', usuarioController.loginUsuario); // Ruta para login no protegida
router.post('/logout', usuarioController.logoutUsuario);

router.get('/', verifyToken, usuarioController.getAllUsuarios);
router.get('/:id', verifyToken, usuarioController.getUsuarioById);
router.put('/:id', verifyToken, usuarioController.updateUsuario);
router.delete('/:id', verifyToken, usuarioController.deleteUsuario);

module.exports = router;
