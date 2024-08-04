const Pago = require('../models/Pago');
const Usuario = require('../models/Usuario');
const PDFDocument = require('pdfkit');
const registrarLog = require('../middleware/logs'); // Importar la función para registrar logs
const Boleto = require('../models/Boleto');
const Asiento = require('../models/Asiento');



// Crear un nuevo pago
exports.createPago = async (req, res) => {
    const { idUsuario, cantidadPago, metodoPago } = req.body;

    // Imprimir los datos recibidos para depuración
    console.log('Datos recibidos:', req.body);

    // Validar los datos requeridos
    if (!idUsuario) {
        const errorMessage = 'El campo idUsuario es requerido.';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }
    if (!cantidadPago) {
        const errorMessage = 'El campo cantidadPago es requerido.';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }
    if (!metodoPago) {
        const errorMessage = 'El campo metodoPago es requerido.';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }

    // Validar que cantidadPago sea un número positivo
    if (isNaN(cantidadPago) || cantidadPago <= 0) {
        const errorMessage = 'El campo cantidadPago debe ser un número positivo.';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }

    // Validar que metodoPago esté en un conjunto permitido (opcional)
    const metodosPermitidos = ['tarjeta', 'efectivo', 'transferencia'];
    if (!metodosPermitidos.includes(metodoPago)) {
        const errorMessage = 'El campo metodoPago debe ser uno de los siguientes: tarjeta, efectivo, transferencia.';
        registrarLog(req, errorMessage); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }

    try {
        // Verificar que el usuario existe
        const usuario = await Usuario.findByPk(idUsuario);
        if (!usuario) {
            const errorMessage = 'Usuario no encontrado.';
            registrarLog(req, errorMessage); // Registrar el error
            return res.status(404).json({ error: errorMessage });
        }

        // Crear el nuevo pago
        const pago = await Pago.create({
            idUsuario,
            cantidadPago,
            metodoPago
        });

        registrarLog(req, 'Pago creado exitosamente'); // Registrar la acción exitosa
        res.status(201).json(pago);
    } catch (error) {
        // Manejar errores específicos de Sequelize
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            registrarLog(req, `Errores de validación: ${errors.join(', ')}`); // Registrar el error
            return res.status(400).json({ error: errors.join(', ') });
        }
        registrarLog(req, `Error al crear pago: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};
// Obtener todos los pagos
exports.getAllPagos = async (req, res) => {
    try {
        // Verificar que req.headers está definido
        if (!req.headers) {
            return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
        }

        const pagos = await Pago.findAll();
        await registrarLog('getAllPagos', req, { pagosCount: pagos.length }, 'info'); // Registrar la acción exitosa
        res.json(pagos);
    } catch (error) {
        await registrarLog('getAllPagos', req, { error: error.message }, 'error'); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};

// Obtener pagos por criterios de búsqueda
exports.getPagos = async (req, res) => {
    try {
        // Verificar que req.headers está definido
        if (!req.headers) {
            return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
        }

        const { idCompra, idUsuario, metodoPago } = req.query;
        const searchCriteria = {};
        if (idCompra) searchCriteria.idCompra = idCompra;
        if (idUsuario) searchCriteria.idUsuario = idUsuario;
        if (metodoPago) searchCriteria.metodoPago = { [Op.like]: `%${metodoPago}%` };

        const pagos = await Pago.findAll({ where: searchCriteria });

        if (pagos.length > 0) {
            await registrarLog('getPagos', req, { searchCriteria, pagosCount: pagos.length }, 'info'); // Registrar la acción exitosa
            res.json(pagos);
        } else {
            const message = 'No se encontraron pagos con los criterios proporcionados';
            await registrarLog('getPagos', req, { searchCriteria, message }, 'warn'); // Registrar la falta de resultados
            res.status(404).json({ message });
        }
    } catch (error) {
        await registrarLog('getPagos', req, { error: error.message }, 'error'); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};


// Actualizar pagos por múltiples criterios
exports.updatePagos = async (req, res) => {
    const { idCompra, idUsuario, cantidadPago, metodoPago } = req.body;

    // Imprimir los datos recibidos para depuración
    console.log('Datos recibidos para actualización:', req.body);

    // Verificar que req.headers está definido
    if (!req.headers) {
        return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
    }

    // Validar el ID del pago
    if (!idCompra) {
        const errorMessage = 'ID del pago es requerido para la actualización.';
        await registrarLog('updatePagos', req, { error: errorMessage }, 'error'); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }

    // Validar que al menos uno de los campos a actualizar esté presente
    if (!idUsuario && !cantidadPago && !metodoPago) {
        const errorMessage = 'Debe proporcionar al menos uno de los campos para actualizar.';
        await registrarLog('updatePagos', req, { error: errorMessage }, 'error'); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }

    // Validar que cantidadPago sea un número positivo
    if (cantidadPago && (isNaN(cantidadPago) || cantidadPago <= 0)) {
        const errorMessage = 'El campo cantidadPago debe ser un número positivo.';
        await registrarLog('updatePagos', req, { error: errorMessage }, 'error'); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }

    // Validar que metodoPago esté en un conjunto permitido (opcional)
    const metodosPermitidos = ['tarjeta', 'efectivo', 'transferencia'];
    if (metodoPago && !metodosPermitidos.includes(metodoPago)) {
        const errorMessage = 'El campo metodoPago debe ser uno de los siguientes: tarjeta, efectivo, transferencia.';
        await registrarLog('updatePagos', req, { error: errorMessage }, 'error'); // Registrar el error
        return res.status(400).json({ error: errorMessage });
    }

    try {
        // Verificar que el usuario existe si se proporciona idUsuario
        if (idUsuario) {
            const usuario = await Usuario.findByPk(idUsuario);
            if (!usuario) {
                const errorMessage = 'Usuario no encontrado.';
                await registrarLog('updatePagos', req, { error: errorMessage }, 'error'); // Registrar el error
                return res.status(404).json({ error: errorMessage });
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
            await registrarLog('updatePagos', req, { idCompra, idUsuario, cantidadPago, metodoPago }, 'info'); // Registrar la acción exitosa
            res.json({ message: 'Pago actualizado exitosamente.' });
        } else {
            const errorMessage = 'Pago no encontrado.';
            await registrarLog('updatePagos', req, { error: errorMessage }, 'error'); // Registrar el error
            res.status(404).json({ error: errorMessage });
        }
    } catch (error) {
        // Manejar errores específicos de Sequelize
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            const errorMessage = 'Error de clave foránea: asegúrese de que los valores proporcionados sean válidos.';
            await registrarLog('updatePagos', req, { error: errorMessage }, 'error'); // Registrar el error
            return res.status(400).json({ error: errorMessage });
        }
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            await registrarLog('updatePagos', req, { errors: errors.join(', ') }, 'error'); // Registrar el error
            return res.status(400).json({ error: errors.join(', ') });
        }
        await registrarLog('updatePagos', req, { error: error.message }, 'error'); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un pago
exports.deletePago = async (req, res) => {
    try {
        const { idCompra } = req.params;

        // Verificar que req.headers está definido
        if (!req.headers) {
            return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
        }

        if (!idCompra) {
            const errorMessage = 'ID del pago es requerido para la eliminación';
            await registrarLog('deletePago', req, { error: errorMessage }, 'error'); // Registrar el error
            return res.status(400).json({ message: errorMessage });
        }

        // Buscar todos los boletos asociados al pago
        const boletos = await Boleto.findAll({ where: { idPago: idCompra } });
        if (boletos.length > 0) {
            // Eliminar los boletos asociados
            await Boleto.destroy({ where: { idPago: idCompra } });

            // Actualizar el estado del asiento
            for (const boleto of boletos) {
                const { idAsiento } = boleto;
                await Asiento.update({ estado: 'disponible' }, { where: { idAsiento } });
            }
        }

        // Eliminar el pago
        const pago = await Pago.findByPk(idCompra);
        if (!pago) {
            const errorMessage = 'Pago no encontrado';
            await registrarLog('deletePago', req, { error: errorMessage }, 'error'); // Registrar el error
            return res.status(404).json({ message: errorMessage });
        }

        await Pago.destroy({ where: { idCompra } });

        await registrarLog('deletePago', req, { idCompra }, 'info'); // Registrar la acción exitosa
        res.json({ message: 'Pago eliminado exitosamente' });
    } catch (error) {
        await registrarLog('deletePago', req, { error: error.message }, 'error'); // Registrar el error
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
        registrarLog(req, `Error al generar PDF de pagos: ${error.message}`); // Registrar el error
        res.status(500).json({ error: error.message });
    }
};
