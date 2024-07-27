const express = require('express');
const router = express.Router();
const peliculaController = require('../controllers/peliculaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Crear una nueva película
router.post('/', verifyToken, checkRole(['admin']), peliculaController.createPelicula);

// Obtener todas las películas
router.get('/', verifyToken, checkRole(['admin']), peliculaController.getAllPeliculas);

// Obtener películas por criterios de búsqueda
router.get('/search', verifyToken, checkRole(['admin']), peliculaController.getPeliculas);

// Actualizar películas por múltiples criterios
router.put('/', verifyToken, checkRole(['admin']), peliculaController.updatePeliculas);

// Eliminar una película
router.delete('/:idPelicula', verifyToken, checkRole(['admin']), peliculaController.deletePelicula);

// Ruta para generar el reporte en PDF de las películas
router.get('/reporte',  peliculaController.getPeliculasPDF);

module.exports = router;
