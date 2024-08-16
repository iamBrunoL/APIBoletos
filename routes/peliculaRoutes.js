const express = require('express');
const router = express.Router();
const peliculaController = require('../controllers/peliculaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Crear una nueva película con imagen
router.post('/', verifyToken, checkRole(['admin','cliente']), peliculaController.createPelicula);

// Obtener todas las películas
router.get('/', verifyToken, checkRole(['admin','cliente']), peliculaController.getAllPeliculas);

// Actualizar una película existente
router.put('/:idPelicula', verifyToken, checkRole(['admin','cliente']), peliculaController.updatePelicula);

// Eliminar una película
router.delete('/:idPelicula', verifyToken, checkRole(['admin','cliente']), peliculaController.deletePelicula);

// Ruta para generar el reporte en PDF de las películas
router.get('/reporte', verifyToken, checkRole(['admin','cliente']), peliculaController.getPeliculasPDF);

module.exports = router;
