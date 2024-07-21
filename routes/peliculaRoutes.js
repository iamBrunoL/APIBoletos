const express = require('express');
const router = express.Router();
const peliculaController = require('../controllers/peliculaController');
const verifyToken = require('../middleware/auth');

// Definir rutas y sus callbacks
router.post('/', verifyToken, peliculaController.createPelicula);
router.get('/', verifyToken, peliculaController.getAllPeliculas);
router.get('/:id', verifyToken, peliculaController.getPeliculaById);
router.put('/:id', verifyToken, peliculaController.updatePelicula);
router.delete('/:id', verifyToken, peliculaController.deletePelicula);



module.exports = router;
