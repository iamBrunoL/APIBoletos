const express = require('express');
const router = express.Router();
const pagoController = require('../controllers/pagoController');
const verifyToken = require('../middleware/auth');
const checkRole = require('../middleware/roleMiddleware');

router.get('/', verifyToken, checkRole(['admin']), pagoController.getAllPagos);
router.get('/:id', verifyToken, checkRole(['admin']), pagoController.getPagoById);


module.exports = router;
