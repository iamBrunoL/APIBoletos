const express = require('express');
const router = express.Router();
const peliculaController = require('../controllers/peliculaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

// Definir rutas y sus callbacks
router.post('/', verifyToken, checkRole(['admin']), peliculaController.createPelicula);
router.get('/', verifyToken, checkRole(['cliente']), peliculaController.getAllPeliculas);
router.get('/:id', verifyToken, checkRole(['admin']), peliculaController.getPeliculaById);
router.put('/:id', verifyToken, checkRole(['admin']), peliculaController.updatePelicula);
router.delete('/:id', verifyToken, checkRole(['admin']), peliculaController.deletePelicula);



module.exports = router;
