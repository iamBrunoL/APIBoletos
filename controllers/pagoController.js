const Pago = require('../models/Pago');
const Usuario = require('../models/Usuario');
const PDFDocument = require('pdfkit');

// Crear un nuevo pago
exports.createPago = async (req, res) => {
    const { idUsuario, cantidadPago, metodoPago } = req.body;

    // Imprimir los datos recibidos para depuración
    console.log('Datos recibidos:', req.body);

    // Validar los datos requeridos
    if (!idUsuario) {
        return res.status(400).json({ error: 'El campo idUsuario es requerido.' });
    }
    if (!cantidadPago) {
        return res.status(400).json({ error: 'El campo cantidadPago es requerido.' });
    }
    if (!metodoPago) {
        return res.status(400).json({ error: 'El campo metodoPago es requerido.' });
    }

    // Validar que cantidadPago sea un número positivo
    if (isNaN(cantidadPago) || cantidadPago <= 0) {
        return res.status(400).json({ error: 'El campo cantidadPago debe ser un número positivo.' });
    }

    // Validar que metodoPago esté en un conjunto permitido (opcional)
    const metodosPermitidos = ['tarjeta', 'efectivo', 'transferencia'];
    if (!metodosPermitidos.includes(metodoPago)) {
        return res.status(400).json({ error: 'El campo metodoPago debe ser uno de los siguientes: tarjeta, efectivo, transferencia.' });
    }

    try {
        // Verificar que el usuario existe
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            return res.status(404).json({ error: 'Usuario no encontrado.' });
        }

        // Crear el nuevo pago
        const pago = await Pago.create({
            idUsuario,
            cantidadPago,
            metodoPago
        });

        res.status(201).json(pago);
    } catch (error) {
        // Manejar errores específicos de Sequelize
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
};


// Obtener todos los pagos
exports.getAllPagos = async (req, res) => {
    try {
        const pagos = await Pago.findAll();
        res.json(pagos);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener pagos por criterios de búsqueda
exports.getPagos = async (req, res) => {
    try {
        const { idCompra, idUsuario, metodoPago } = req.query;
        const searchCriteria = {};
        if (idCompra) searchCriteria.idCompra = idCompra;
        if (idUsuario) searchCriteria.idUsuario = idUsuario;
        if (metodoPago) searchCriteria.metodoPago = metodoPago;

        const pagos = await Pago.findAll({ where: searchCriteria });

        if (pagos.length > 0) {
            res.json(pagos);
        } else {
            res.status(404).json({ message: 'No se encontraron pagos con los criterios proporcionados' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar pagos por múltiples criterios
exports.updatePagos = async (req, res) => {
    const { idCompra, idUsuario, cantidadPago, metodoPago } = req.body;

    // Imprimir los datos recibidos para depuración
    console.log('Datos recibidos para actualización:', req.body);

    // Validar el ID del pago
    if (!idCompra) {
        return res.status(400).json({ error: 'ID del pago es requerido para la actualización.' });
    }

    // Validar que al menos uno de los campos a actualizar esté presente
    if (!idUsuario && !cantidadPago && !metodoPago) {
        return res.status(400).json({ error: 'Debe proporcionar al menos uno de los campos para actualizar.' });
    }

    // Validar que cantidadPago sea un número positivo
    if (cantidadPago && (isNaN(cantidadPago) || cantidadPago <= 0)) {
        return res.status(400).json({ error: 'El campo cantidadPago debe ser un número positivo.' });
    }

    // Validar que metodoPago esté en un conjunto permitido (opcional)
    const metodosPermitidos = ['tarjeta', 'efectivo', 'transferencia'];
    if (metodoPago && !metodosPermitidos.includes(metodoPago)) {
        return res.status(400).json({ error: 'El campo metodoPago debe ser uno de los siguientes: tarjeta, efectivo, transferencia.' });
    }

    try {
        // Verificar que el usuario existe si se proporciona idUsuario
        if (idUsuario) {
            const usuario = await Usuario.findByPk(idUsuario);
            if (!usuario) {
                return res.status(404).json({ error: 'Usuario no encontrado.' });
            }
        }

        // Actualizar el pago
        const [updated] = await Pago.update({
            idUsuario,
            cantidadPago,
            metodoPago
        }, {
            where: { idCompra }
        });

        if (updated) {
            res.json({ message: 'Pago actualizado exitosamente.' });
        } else {
            res.status(404).json({ error: 'Pago no encontrado.' });
        }
    } catch (error) {
        // Manejar errores específicos de Sequelize
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: 'Error de clave foránea: asegúrese de que los valores proporcionados sean válidos.' });
        }
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: error.message });
    }
};


// Eliminar un pago
exports.deletePago = async (req, res) => {
    try {
        const { idCompra } = req.params;

        if (!idCompra) {
            return res.status(400).json({ message: 'ID del pago es requerido para la eliminación' });
        }

        const pago = await Pago.findByPk(idCompra);
        if (!pago) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        await Pago.destroy({ where: { idCompra } });

        res.json({ message: 'Pago eliminado exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Generar reporte en PDF de los pagos
exports.getPagosPDF = async (req, res) => {
    try {
        const pagos = await Pago.findAll({
            include: [
                { model: Usuario, attributes: ['nombreUsuario'] }
            ]
        });

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=pagos.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Pagos', { align: 'center' });

        pagos.forEach(pago => {
            doc.fontSize(12).text(`ID: ${pago.idCompra}`);
            doc.fontSize(12).text(`Usuario: ${pago.Usuario.nombreUsuario}`);
            doc.fontSize(12).text(`Cantidad: ${pago.cantidadPago}`);
            doc.fontSize(12).text(`Método de Pago: ${pago.metodoPago}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
