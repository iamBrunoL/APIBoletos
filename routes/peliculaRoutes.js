const express = require('express');
const router = express.Router();
const peliculaController = require('../controllers/peliculaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks

// Crear una nueva película
router.post('/', verifyToken, checkRole(['admin']), peliculaController.createPelicula);

// Obtener todas las películas
router.get('/', verifyToken, checkRole(['cliente']), peliculaController.getAllPeliculas);

// Buscar películas por criterios
router.get('/search', verifyToken, checkRole(['admin']), peliculaController.getPeliculas);

// Actualizar una película
router.put('/', verifyToken, checkRole(['admin']), peliculaController.updatePelicula);

// Eliminar una película
router.delete('/:idPelicula', verifyToken, checkRole(['admin']), peliculaController.deletePelicula);

module.exports = router;
