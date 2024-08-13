const Dulceria = require('../models/Dulceria');
const registrarLog = require('../middleware/logs');

exports.getAllProductos = async (req, res) => {
    try {
        const productos = await Dulceria.findAll();
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog('getAllDulceria', req, { productosCount: productos.length, userAgent }, 'info');
        res.json(productos);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        await registrarLog('getAllProductos', req, { error: error.message, userAgent }, 'error');
        res.status(500).json({ message: 'Error al obtener los productos' });
    }
};

exports.createProducto = async (req, res) => {
    try {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        const { nombreProducto, precioProducto } = req.body;
        const nuevoProducto = await Dulceria.create({ nombreProducto, precioProducto });
        await registrarLog('createProducto', req, { producto: nuevoProducto.idProducto }, 'info');
        res.status(201).json(nuevoProducto);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        await registrarLog('createProducto', req, { error: error.message, userAgent }, 'error');
        res.status(500).json({ message: 'Error al crear el producto' });
    }
};

exports.updateProducto = async (req, res) => {
    try {
        const { idProducto } = req.params;
        const { nombreProducto, precioProducto } = req.body;
        const producto = await Dulceria.findByPk(idProducto);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        producto.nombreProducto = nombreProducto;
        producto.precioProducto = precioProducto;
        await producto.save();

        await registrarLog('updateProducto', req, { producto: producto.idProducto }, 'info');
        res.json(producto);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        await registrarLog('updateProducto', req, { error: error.message, userAgent }, 'error');
        res.status(500).json({ message: 'Error al actualizar el producto' });
    }
};

exports.deleteProducto = async (req, res) => {
    try {
        const { idProducto } = req.params;
        const producto = await Dulceria.findByPk(idProducto);

        if (!producto) {
            return res.status(404).json({ message: 'Producto no encontrado' });
        }

        await producto.destroy();
        await registrarLog('deleteProducto', req, { producto: producto.idProducto }, 'info');
        res.json({ message: 'Producto eliminado' });
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        await registrarLog('deleteProducto', req, { error: error.message, userAgent }, 'error');
        res.status(500).json({ message: 'Error al eliminar el producto' });
    }
};
