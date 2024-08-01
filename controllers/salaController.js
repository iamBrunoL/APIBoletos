const PDFDocument = require('pdfkit');
const Sala = require('../models/Sala');
const Asiento = require('../models/Asiento');
const { Op } = require('sequelize');
const { registrarLog } = require('../middleware/logs'); // Asegúrate de tener esta ruta

// Crear una nueva sala
exports.createSala = async (req, res) => {
    const { nombreSala, cantidadAsientos, cantidadFilas, maxAsientosPorFila } = req.body;

    try {
        // Validar entrada
        if (!nombreSala || typeof nombreSala !== 'string' || nombreSala.trim() === '') {
            registrarLog('createSala', req, { message: 'Nombre de sala inválido.' }, 'warn');
            return res.status(400).json({ message: 'El nombre de la sala es requerido y debe ser una cadena de texto no vacía.' });
        }

        if (cantidadFilas <= 0 || maxAsientosPorFila <= 0) {
            registrarLog('createSala', req, { message: 'Cantidad de filas o asientos por fila inválidos.' }, 'warn');
            return res.status(400).json({ message: 'La cantidad de filas y el máximo de asientos por fila deben ser números mayores a 0.' });
        }

        if (isNaN(cantidadAsientos) || cantidadAsientos <= 0) {
            registrarLog('createSala', req, { message: 'Cantidad de asientos inválida.' }, 'warn');
            return res.status(400).json({ message: 'La cantidad de asientos debe ser un número mayor a 0.' });
        }

        // Verificar si la sala ya existe
        const salaExistente = await Sala.findOne({ where: { nombreSala } });
        if (salaExistente) {
            registrarLog('createSala', req, { message: `Sala ya existente: ${nombreSala}` }, 'warn');
            return res.status(400).json({ message: `Ya existe una sala con el nombre "${nombreSala}". Elige un nombre diferente.` });
        }

        // Calcular la cantidad esperada de asientos
        const cantidadAsientosEsperados = cantidadFilas * maxAsientosPorFila;

        // Verificar que la cantidad de asientos ingresados coincida con la cantidad calculada
        if (cantidadAsientos !== cantidadAsientosEsperados) {
            registrarLog('createSala', req, { message: `Cantidad de asientos no coincide: esperada ${cantidadAsientosEsperados}, proporcionada ${cantidadAsientos}` }, 'warn');
            return res.status(400).json({ message: `La cantidad de asientos ingresados (${cantidadAsientos}) no coincide con la cantidad calculada (${cantidadAsientosEsperados}).` });
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

        registrarLog('createSala', req, { sala }, 'info');
        res.status(201).json(sala);
    } catch (error) {
        registrarLog('createSala', req, { error: error.message }, 'error');
        res.status(500).json({ message: 'Error en el servidor. Por favor, intenta de nuevo más tarde.' });
    }
};

// Obtener todas las salas
exports.getAllSalas = async (req, res) => {
    try {
        const salas = await Sala.findAll();
        registrarLog('getAllSalas', req, { salasCount: salas.length }, 'info');
        res.json(salas);
    } catch (error) {
        registrarLog('getAllSalas', req, { error: error.message }, 'error');
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

        if (salas.length > 0) {
            registrarLog('getSalas', req, { searchCriteria, resultsCount: salas.length }, 'info');
            res.json(salas);
        } else {
            registrarLog('getSalas', req, { searchCriteria }, 'warn');
            res.status(404).json({ message: 'No se encontraron salas con los criterios proporcionados' });
        }
    } catch (error) {
        registrarLog('getSalas', req, { error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Actualizar salas por múltiples criterios
exports.updateSalas = async (req, res) => {
    const { idSala, nombreSala, cantidadAsientos, filas, maxAsientosPorFila } = req.body;

    try {
        // Validar ID de la sala
        if (!idSala) {
            registrarLog('updateSalas', req, { message: 'ID de sala no proporcionado' }, 'warn');
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
            registrarLog('updateSalas', req, { idSala, message: 'Sala no actualizable debido a asientos ocupados' }, 'warn');
            return res.status(400).json({ message: 'No se puede actualizar la sala porque hay asientos ocupados.' });
        }

        // Validar y calcular la cantidad total de asientos
        if (cantidadAsientos && filas && maxAsientosPorFila) {
            const cantidadCalculada = filas * maxAsientosPorFila;

            if (cantidadAsientos !== cantidadCalculada) {
                registrarLog('updateSalas', req, { idSala, cantidadAsientos, cantidadCalculada, message: 'Cantidad de asientos no coincide' }, 'warn');
                return res.status(400).json({
                    message: `La cantidad de asientos ingresados (${cantidadAsientos}) no coincide con la cantidad calculada (${cantidadCalculada}).`
                });
            }
        }

        // Validar datos de entrada
        const updateFields = {};
        if (nombreSala) {
            if (nombreSala.trim() === '') {
                registrarLog('updateSalas', req, { idSala, nombreSala, message: 'Nombre de sala vacío' }, 'warn');
                return res.status(400).json({ message: 'El nombre de la sala no puede estar vacío' });
            }
            updateFields.nombreSala = nombreSala;
        }
        if (cantidadAsientos) {
            if (cantidadAsientos <= 0) {
                registrarLog('updateSalas', req, { idSala, cantidadAsientos, message: 'Cantidad de asientos no válida' }, 'warn');
                return res.status(400).json({ message: 'La cantidad de asientos debe ser un número positivo' });
            }
            updateFields.cantidadAsientos = cantidadAsientos;
        }
        if (filas) {
            if (filas <= 0) {
                registrarLog('updateSalas', req, { idSala, filas, message: 'Cantidad de filas no válida' }, 'warn');
                return res.status(400).json({ message: 'La cantidad de filas debe ser un número positivo' });
            }
            updateFields.filas = filas;
        }
        if (maxAsientosPorFila) {
            if (maxAsientosPorFila <= 0) {
                registrarLog('updateSalas', req, { idSala, maxAsientosPorFila, message: 'Número máximo de asientos por fila no válido' }, 'warn');
                return res.status(400).json({ message: 'El número máximo de asientos por fila debe ser un número positivo' });
            }
            updateFields.maxAsientosPorFila = maxAsientosPorFila;
        }

        const [updated] = await Sala.update(updateFields, { where: { idSala } });

        if (updated) {
            // Actualizar asientos en la base de datos
            if (filas && maxAsientosPorFila) {
                await Asiento.destroy({ where: { idSalaAsiento: idSala } });

                for (let i = 0; i < filas; i++) {
                    const filaAsiento = String.fromCharCode(65 + i); // Genera letras A, B, C, etc.
                    for (let j = 1; j <= maxAsientosPorFila; j++) {
                        await Asiento.create({
                            idSalaAsiento: idSala,
                            filaAsiento: filaAsiento,
                            numeroAsiento: j,
                            estadoAsiento: 'disponible'
                        });
                    }
                }
            }

            registrarLog('updateSalas', req, { idSala, updateFields }, 'info');
            res.json({ message: 'Sala actualizada exitosamente' });
        } else {
            registrarLog('updateSalas', req, { idSala, message: 'Sala no encontrada' }, 'warn');
            res.status(404).json({ message: 'Sala no encontrada' });
        }
    } catch (error) {
        registrarLog('updateSalas', req, { idSala, error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una sala
exports.deleteSala = async (req, res) => {
    const { idSala } = req.params;

    try {
        // Validar que se ha proporcionado el ID de la sala
        if (!idSala) {
            registrarLog('deleteSala', req, { message: 'ID de sala no proporcionado' }, 'warn');
            return res.status(400).json({ message: 'ID de la sala es requerido para la eliminación.' });
        }

        // Verificar si la sala existe
        const sala = await Sala.findByPk(idSala);
        if (!sala) {
            registrarLog('deleteSala', req, { idSala, message: 'Sala no encontrada' }, 'warn');
            return res.status(404).json({ message: 'Sala no encontrada.' });
        }

        // Verificar el estado de todos los asientos asociados a la sala
        const asientos = await Asiento.findAll({ where: { idSalaAsiento: idSala } });

        // Verificar si todos los asientos están disponibles
        const todosDisponibles = asientos.every(asiento => asiento.estadoAsiento === 'disponible');

        if (!todosDisponibles) {
            registrarLog('deleteSala', req, { idSala, message: 'No se puede eliminar la sala debido a asientos ocupados' }, 'warn');
            return res.status(400).json({ message: 'No se puede eliminar la sala porque algunos asientos están ocupados.' });
        }

        // Eliminar los asientos asociados a la sala
        await Asiento.destroy({ where: { idSalaAsiento: idSala } });

        // Eliminar la sala
        await Sala.destroy({ where: { idSala } });

        registrarLog('deleteSala', req, { idSala, message: 'Sala eliminada exitosamente' }, 'info');
        res.json({ message: 'Sala eliminada exitosamente.' });
    } catch (error) {
        registrarLog('deleteSala', req, { idSala, error: error.message }, 'error');
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
