const PDFDocument = require('pdfkit');
const Asiento = require('../models/Asiento');
const Sala = require('../models/Sala');
const registrarLog = require('../middleware/logs');

exports.createAsiento = async (req, res) => {
    try {
        const { filaAsiento, idSalaAsiento, numeroAsiento, estadoAsiento } = req.body;

        // Validar que la sala exista
        const sala = await Sala.findByPk(idSalaAsiento);
        if (!sala) {
            await registrarLog(req, 'Intento de crear un asiento en una sala inexistente');
            return res.status(400).json({ message: 'La sala no existe. Debe crear primero la sala o comprobar los datos ingresados.' });
        }

        // Validar que el asiento no exista ya en la misma fila y sala
        const existingAsiento = await Asiento.findOne({
            where: { filaAsiento, idSalaAsiento, numeroAsiento }
        });
        if (existingAsiento) {
            await registrarLog(req, 'Intento de crear un asiento que ya existe en la misma fila y sala');
            return res.status(400).json({ message: 'El asiento ya existe en la misma fila y sala.' });
        }

        // Validar fila (debe ser una letra) y estadoAsiento
        if (!/^[A-Za-z]$/.test(filaAsiento)) {
            await registrarLog(req, 'Intento de crear un asiento con fila no válida');
            return res.status(400).json({ message: 'Fila no válida. Debe ser una letra.' });
        }
        if (!['disponible', 'ocupado'].includes(estadoAsiento)) {
            await registrarLog(req, 'Intento de crear un asiento con estado no válido');
            return res.status(400).json({ message: 'Estado no válido. Debe ser "disponible" o "ocupado".' });
        }

        const asiento = await Asiento.create(req.body);
        await registrarLog(req, 'Asiento creado exitosamente');
        res.json(asiento);
    } catch (error) {
        await registrarLog(req, `Error al crear el asiento: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getAllAsientos = async (req, res) => {
    try {
        const asientos = await Asiento.findAll();
        await registrarLog(req, 'Consulta de todos los asientos');
        res.json(asientos);
    } catch (error) {
        await registrarLog(req, `Error al obtener todos los asientos: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.getAsientos = async (req, res) => {
    try {
        const { idAsiento, filaAsiento, idSalaAsiento, estadoAsiento } = req.query;
        const searchCriteria = {};

        if (idAsiento) searchCriteria.idAsiento = idAsiento;
        if (filaAsiento) searchCriteria.filaAsiento = filaAsiento;
        if (idSalaAsiento) searchCriteria.idSalaAsiento = idSalaAsiento;
        if (estadoAsiento) searchCriteria.estadoAsiento = estadoAsiento;

        const asientos = await Asiento.findAll({ where: searchCriteria });

        if (asientos.length > 0) {
            await registrarLog(req, 'Consulta de asientos con criterios específicos');
            res.json(asientos);
        } else {
            await registrarLog(req, 'No se encontraron asientos con los criterios proporcionados');
            res.status(404).json({ message: 'No se encontraron asientos con los criterios proporcionados' });
        }
    } catch (error) {
        await registrarLog(req, `Error al obtener asientos: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

exports.updateAsientos = async (req, res) => {
    try {
        const { idAsiento, filaAsiento, idSalaAsiento, estadoAsiento } = req.body;

        // Validar estado del asiento
        if (!['disponible', 'ocupado'].includes(estadoAsiento)) {
            await registrarLog(req, 'Intento de actualizar un asiento con estado no válido');
            return res.status(400).json({ message: 'Estado no válido. Debe ser "disponible" o "ocupado".' });
        }

        let searchCriteria = {};

        // Determinar criterios de búsqueda
        if (idAsiento) {
            searchCriteria = { idAsiento };
        } else if (filaAsiento && idSalaAsiento) {
            searchCriteria = { filaAsiento, idSalaAsiento };
        } else {
            await registrarLog(req, 'Intento de actualizar asiento sin proporcionar criterios válidos');
            return res.status(400).json({ message: 'Debe proporcionar el ID del asiento o la fila y la sala para la actualización.' });
        }

        // Buscar el asiento actual
        const asiento = await Asiento.findOne({ where: searchCriteria });

        if (!asiento) {
            await registrarLog(req, 'Asiento no encontrado para la actualización');
            return res.status(404).json({ message: 'Asiento no encontrado' });
        }

        // Verificar si el estado es el mismo que el actual
        if (asiento.estadoAsiento === estadoAsiento) {
            await registrarLog(req, 'Intento de actualizar el asiento con el mismo estado');
            return res.status(400).json({ message: 'El estado del asiento es el mismo que el actual. No se realizó ninguna actualización.' });
        }

        // Actualizar el estado del asiento
        await Asiento.update({ estadoAsiento }, { where: searchCriteria });

        await registrarLog(req, 'Asiento actualizado exitosamente');
        res.json({ message: 'Estado del asiento actualizado exitosamente' });
    } catch (error) {
        await registrarLog(req, `Error al actualizar asiento: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};


exports.deleteAsiento = async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            await registrarLog(req, 'Intento de eliminar un asiento sin ID');
            return res.status(400).json({ message: 'ID del asiento es requerido para la eliminación' });
        }

        const asiento = await Asiento.findByPk(id);
        if (!asiento) {
            await registrarLog(req, 'Intento de eliminar un asiento que no existe');
            return res.status(404).json({ message: 'Asiento no encontrado' });
        }

        await Asiento.destroy({ where: { idAsiento: id } });
        await registrarLog(req, 'Asiento eliminado exitosamente');
        res.json({ message: 'Asiento eliminado exitosamente' });
    } catch (error) {
        await registrarLog(req, `Error al eliminar asiento: ${error.message}`);
        res.status(500).json({ error: error.message });
    }
};

// Generar reporte en PDF de los asientos
exports.getAsientosPDF = async (req, res) => {
    try {
        // Obtener todos los asientos
        const asientos = await Asiento.findAll();

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();

        // Configurar los encabezados para la respuesta PDF
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=asientos.pdf');

        // Enviar el documento PDF a la respuesta
        doc.pipe(res);

        // Agregar título al documento
        doc.fontSize(20).text('Reporte de Asientos', { align: 'center' });
        doc.moveDown();

        // Agregar cada asiento al documento
        for (const asiento of asientos) {
            // Obtener los detalles de la sala asociada
            const sala = await Sala.findByPk(asiento.idSalaAsiento);

            doc.fontSize(12).text(`ID: ${asiento.idAsiento}`);
            doc.fontSize(12).text(`Fila: ${asiento.filaAsiento}`);
            doc.fontSize(12).text(`Número: ${asiento.numeroAsiento}`);
            doc.fontSize(12).text(`Estado: ${asiento.estadoAsiento}`);
            doc.fontSize(12).text(`Sala: ${sala ? sala.nombreSala : 'Sala no encontrada'}`);
            doc.moveDown();
        }

        // Finalizar el documento
        doc.end();

        // Registrar el log de generación del reporte
        registrarLog('getAsientosPDF', req, { message: 'Reporte de asientos generado exitosamente' }, 'info');
    } catch (error) {
        // Registrar el error y enviar una respuesta de error
        registrarLog('getAsientosPDF', req, { error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};