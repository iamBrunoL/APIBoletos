const express = require('express');
const dulceriaController = require('../controllers/dulceriaController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/', verifyToken, checkRole(['admin', 'cliente']), dulceriaController.getAllProductos);
router.post('/', verifyToken, checkRole(['admin']), dulceriaController.createProducto);
router.put('/:idProducto', verifyToken, checkRole(['admin']), dulceriaController.updateProducto);
router.delete('/:idProducto', verifyToken, checkRole(['admin']), dulceriaController.deleteProducto);

module.exports = router;
