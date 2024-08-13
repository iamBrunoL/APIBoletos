const PDFDocument = require('pdfkit');
const Sala = require('../models/Sala');
const Asiento = require('../models/Asiento');
const { Op } = require('sequelize');
const registrarLog = require('../middleware/logs');

// Crear una nueva sala
exports.createSala = async (req, res) => {
    const { nombreSala, cantidadAsientos, cantidadFilas, maxAsientosPorFila } = req.body;

    try {
        // Validar entrada
        if (!nombreSala || typeof nombreSala !== 'string' || nombreSala.trim() === '') {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'createSala', { message: 'Nombre de sala inválido.', userAgent }, 'warn');
            return res.status(400).json({ message: 'El nombre de la sala es requerido y debe ser una cadena de texto no vacía.' });
        }

        if (cantidadFilas <= 0 || maxAsientosPorFila <= 0) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'createSala', { message: 'Cantidad de filas o asientos por fila inválidos.', userAgent }, 'warn');
            return res.status(400).json({ message: 'La cantidad de filas y el máximo de asientos por fila deben ser números mayores a 0.' });
        }

        if (isNaN(cantidadAsientos) || cantidadAsientos <= 0) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'createSala', { message: 'Cantidad de asientos inválida.', userAgent }, 'warn');
            return res.status(400).json({ message: 'La cantidad de asientos debe ser un número mayor a 0.' });
        }

        // Calcular la cantidad esperada de asientos
        const cantidadAsientosEsperados = cantidadFilas * maxAsientosPorFila;

        // Verificar que la cantidad de asientos ingresados coincida con la cantidad calculada
        if (cantidadAsientos !== cantidadAsientosEsperados) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'createSala', { message: `Cantidad de asientos no coincide: esperada ${cantidadAsientosEsperados}, proporcionada ${cantidadAsientos}`, userAgent }, 'warn');
            return res.status(400).json({ message: `La cantidad de asientos ingresados (${cantidadAsientos}) no coincide con la cantidad calculada (${cantidadAsientosEsperados}).` });
        }

        // Verificar que la cantidad total de asientos no exceda el máximo permitido (500)
        if (cantidadAsientos > 500) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'createSala', { message: 'Cantidad de asientos excede el máximo permitido de 500.', userAgent }, 'warn');
            return res.status(400).json({ message: 'La cantidad de asientos no puede exceder el máximo permitido de 500.' });
        }

        // Verificar si la sala ya existe
        const salaExistente = await Sala.findOne({ where: { nombreSala } });
        if (salaExistente) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'createSala', { message: `Sala ya existente: ${nombreSala}`, userAgent }, 'warn');
            return res.status(400).json({ message: `Ya existe una sala con el nombre "${nombreSala}". Elige un nombre diferente.` });
        }

        // Crear la sala
        const sala = await Sala.create({
            nombreSala,
            cantidadAsientos
        });

        // Generar letras para las filas
        const filas = Array.from({ length: cantidadFilas }, (_, i) => String.fromCharCode(65 + i));
        const asientos = [];

        // Crear los asientos para cada fila
        filas.forEach(fila => {
            for (let numero = 1; numero <= maxAsientosPorFila; numero++) {
                asientos.push({
                    idSalaAsiento: sala.idSala,
                    filaAsiento: fila,
                    numeroAsiento: numero,
                    estadoAsiento: 'disponible'
                });
            }
        });

        // Crear los asientos en la base de datos
        await Asiento.bulkCreate(asientos);

        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'createSala', { sala, userAgent }, 'info');
        res.status(201).json(sala);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'createSala', { error: error.message, userAgent }, 'error');
        res.status(500).json({ message: 'Error en el servidor. Por favor, intenta de nuevo más tarde.' });
    }
};

// Obtener todas las salas
exports.getAllSalas = async (req, res) => {
    try {
        const salas = await Sala.findAll();
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'getAllSalas', { salasCount: salas.length, userAgent }, 'info');
        res.json(salas);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'getAllSalas', { error: error.message, userAgent }, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Obtener salas por criterios de búsqueda
exports.getSalas = async (req, res) => {
    try {
        const { idSala, nombreSala, cantidadAsientos } = req.query;
        const searchCriteria = {};
        if (idSala) searchCriteria.idSala = idSala;
        if (nombreSala) searchCriteria.nombreSala = { [Op.like]: `%${nombreSala}%` };
        if (cantidadAsientos) searchCriteria.cantidadAsientos = cantidadAsientos;

        const salas = await Sala.findAll({ where: searchCriteria });

        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        if (salas.length > 0) {
            registrarLog(req, 'getSalas', { searchCriteria, resultsCount: salas.length, userAgent }, 'info');
            res.json(salas);
        } else {
            registrarLog(req, 'getSalas', { searchCriteria, userAgent }, 'warn');
            res.status(404).json({ message: 'No se encontraron salas con los criterios proporcionados' });
        }
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'getSalas', { error: error.message, userAgent }, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Actualizar salas por múltiples criterios
exports.updateSalas = async (req, res) => {
    const { idSala, nombreSala, cantidadAsientos, filas, maxAsientosPorFila } = req.body;

    try {
        // Validar ID de la sala
        if (!idSala) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'updateSalas', { message: 'ID de sala no proporcionado', userAgent }, 'warn');
            return res.status(400).json({ message: 'ID de la sala es requerido para la actualización' });
        }

        // Verificar si hay asientos ocupados
        const asientosOcupados = await Asiento.count({
            where: {
                idSalaAsiento: idSala,
                estadoAsiento: 'ocupado'
            }
        });

        if (asientosOcupados > 0) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'updateSalas', { idSala, message: 'Sala no actualizable debido a asientos ocupados', userAgent }, 'warn');
            return res.status(400).json({ message: 'No se puede actualizar la sala porque hay asientos ocupados.' });
        }

        // Validar y calcular la cantidad total de asientos
        if (cantidadAsientos && filas && maxAsientosPorFila) {
            const cantidadCalculada = filas * maxAsientosPorFila;

            if (cantidadAsientos !== cantidadCalculada) {
                const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
                registrarLog(req, 'updateSalas', { idSala, cantidadAsientos, cantidadCalculada, message: 'Cantidad de asientos no coincide', userAgent }, 'warn');
                return res.status(400).json({
                    message: `La cantidad de asientos ingresados (${cantidadAsientos}) no coincide con la cantidad calculada (${cantidadCalculada}).`
                });
            }
        }

        // Validar datos de entrada
        const updateFields = {};
        if (nombreSala) {
            if (nombreSala.trim() === '') {
                const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
                registrarLog(req, 'updateSalas', { idSala, nombreSala, message: 'Nombre de sala vacío', userAgent }, 'warn');
                return res.status(400).json({ message: 'El nombre de la sala no puede estar vacío.' });
            }
            updateFields.nombreSala = nombreSala;
        }

        if (cantidadAsientos) updateFields.cantidadAsientos = cantidadAsientos;

        const [updated] = await Sala.update(updateFields, { where: { idSala } });

        if (updated === 0) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'updateSalas', { idSala, message: 'Sala no encontrada o sin cambios', userAgent }, 'warn');
            return res.status(404).json({ message: 'No se encontró la sala o no se realizaron cambios' });
        }

        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'updateSalas', { idSala, updateFields, userAgent }, 'info');
        res.json({ message: 'Sala actualizada exitosamente' });
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'updateSalas', { idSala, error: error.message, userAgent }, 'error');
        res.status(500).json({ message: 'Error en el servidor. Por favor, intenta de nuevo más tarde.' });
    }
};

// Eliminar una sala por su ID
exports.deleteSala = async (req, res) => {
    const { idSala } = req.params;

    try {
        // Verificar si hay asientos ocupados
        const asientosOcupados = await Asiento.count({
            where: {
                idSalaAsiento: idSala,
                estadoAsiento: 'ocupado'
            }
        });

        if (asientosOcupados > 0) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'deleteSala', { idSala, message: 'Sala no eliminable debido a asientos ocupados', userAgent }, 'warn');
            return res.status(400).json({ message: 'No se puede eliminar la sala porque hay asientos ocupados.' });
        }

        // Eliminar la sala
        const deleted = await Sala.destroy({ where: { idSala } });

        if (deleted === 0) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'deleteSala', { idSala, message: 'Sala no encontrada', userAgent }, 'warn');
            return res.status(404).json({ message: 'Sala no encontrada' });
        }

        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'deleteSala', { idSala, userAgent }, 'info');
        res.json({ message: 'Sala eliminada exitosamente' });
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'deleteSala', { idSala, error: error.message, userAgent }, 'error');
        res.status(500).json({ message: 'Error en el servidor. Por favor, intenta de nuevo más tarde.' });
    }
};

// Generar un PDF con la información de las salas
exports.generateSalasPDF = async (req, res) => {
    try {
        const salas = await Sala.findAll();
        if (salas.length === 0) {
            const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
            registrarLog(req, 'generateSalasPDF', { message: 'No hay salas para generar el PDF', userAgent }, 'warn');
            return res.status(404).json({ message: 'No hay salas disponibles para generar el PDF' });
        }

        const doc = new PDFDocument();
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=salas.pdf');
        doc.pipe(res);

        // Título
        doc.fontSize(20).text('Listado de Salas', { align: 'center' });
        doc.moveDown(2);

        // Información de las salas
        salas.forEach((sala) => {
            doc.fontSize(14).text(`ID: ${sala.idSala}`);
            doc.text(`Nombre: ${sala.nombreSala}`);
            doc.text(`Cantidad de Asientos: ${sala.cantidadAsientos}`);
            doc.moveDown();
        });

        doc.end();

        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'generateSalasPDF', { salasCount: salas.length, userAgent }, 'info');
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog(req, 'generateSalasPDF', { error: error.message, userAgent }, 'error');
        res.status(500).json({ message: 'Error en el servidor. Por favor, intenta de nuevo más tarde.' });
    }
};


// Generar reporte en PDF de las salas
exports.getSalasPDF = async (req, res) => {
    try {
        const salas = await Sala.findAll();

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=salas.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Salas', { align: 'center' });

        salas.forEach(sala => {
            doc.fontSize(12).text(`ID: ${sala.idSala}`);
            doc.fontSize(12).text(`Nombre: ${sala.nombreSala}`);
            doc.fontSize(12).text(`Cantidad de Asientos: ${sala.cantidadAsientos}`);
            doc.moveDown();
        });

        doc.end();

        registrarLog('getSalasPDF', req, { message: 'Reporte de salas generado exitosamente' }, 'info');
    } catch (error) {
        registrarLog('getSalasPDF', req, { error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};
