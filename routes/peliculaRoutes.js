const express = require('express');
const router = express.Router();
const peliculaController = require('../controllers/peliculaController');

// Definir rutas y sus callbacks
router.post('/', peliculaController.createPelicula);
router.get('/', peliculaController.getAllPeliculas);
router.get('/:id', peliculaController.getPeliculaById);
router.put('/:id', peliculaController.updatePelicula);
router.delete('/:id', peliculaController.deletePelicula);



module.exports = router;
