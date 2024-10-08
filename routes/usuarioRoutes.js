const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Ruta para crear usuarios 
router.post('/', usuarioController.createUsuario);

// Rutas para manejo de sesion de usuarios 
router.post('/login', usuarioController.loginUsuario);
router.post('/logout', usuarioController.logoutUsuario);

// Ruta para buscar usuarios 
router.get('/', verifyToken, checkRole(['admin','cliente']), usuarioController.getAllUsuarios);

// Ruta para buscar usuarios por criterios
router.get('/search', verifyToken, checkRole(['admin','cliente']), usuarioController.getUsuarios);

// Ruta para actualizar usuarios 
router.put('/:id', verifyToken, checkRole(['admin','cliente']), usuarioController.updateUsuario);

// Ruta para eliminar usuarios 
router.delete('/:idUsuario', verifyToken, checkRole(['admin','cliente']), usuarioController.deleteUsuario);

// Ruta para generar el reporte en PDF de usuarios
router.get('/reporte', verifyToken, checkRole(['admin','cliente']), usuarioController.getUsuariosPDF);


module.exports = router;
