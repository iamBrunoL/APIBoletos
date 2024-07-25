const Pago = require('../models/Pago');
const Usuario = require('../models/Usuario');
const PDFDocument = require('pdfkit');

// Crear un nuevo pago
exports.createPago = async (req, res) => {
    const { idUsuario, cantidadPago, metodoPago } = req.body;

    try {
        const pago = await Pago.create({
            idUsuario,
            cantidadPago,
            metodoPago
        });

        res.status(201).json(pago);
    } catch (error) {
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
        const { idPago, idUsuario, metodoPago } = req.query;
        const searchCriteria = {};
        if (idPago) searchCriteria.idPago = idPago;
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
    try {
        const { idPago, idUsuario, cantidadPago, metodoPago } = req.body;

        if (!idPago) {
            return res.status(400).json({ message: 'ID del pago es requerido para la actualización' });
        }

        const updateFields = {};
        if (idUsuario) updateFields.idUsuario = idUsuario;
        if (cantidadPago) updateFields.cantidadPago = cantidadPago;
        if (metodoPago) updateFields.metodoPago = metodoPago;

        const [updated] = await Pago.update(updateFields, { where: { idPago } });

        if (updated) {
            res.json({ message: 'Pago actualizado exitosamente' });
        } else {
            res.status(404).json({ message: 'Pago no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un pago
exports.deletePago = async (req, res) => {
    try {
        const { idPago } = req.params;

        if (!idPago) {
            return res.status(400).json({ message: 'ID del pago es requerido para la eliminación' });
        }

        const pago = await Pago.findByPk(idPago);
        if (!pago) {
            return res.status(404).json({ message: 'Pago no encontrado' });
        }

        await Pago.destroy({ where: { idPago } });

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
            doc.fontSize(12).text(`ID: ${pago.idPago}`);
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
