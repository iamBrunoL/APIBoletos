const { Op } = require('sequelize');
const Pelicula = require('../models/Pelicula');
const Horario = require('../models/Horario'); 
const PDFDocument = require('pdfkit');
const registrarLog = require('../middleware/logs'); // Asegúrate de que la ruta sea correcta

// Crear una nueva película
exports.createPelicula = async (req, res) => {
    const { nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, idHorario, precioBoleto } = req.body;

    // Verificar que req.headers está definido
    if (!req.headers) {
        return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
    }

    // Registrar la solicitud inicial
    registrarLog('createPelicula - datos recibidos', req, { nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, idHorario, precioBoleto });

    // Validar los datos requeridos
    if (!nombrePelicula || !directorPelicula || !duracionPelicula || !actoresPelicula || !clasificacionPelicula || !idHorario || !precioBoleto) {
        const errorMsg = 'Todos los campos son obligatorios.';
        registrarLog('createPelicula - error', req, { error: errorMsg });
        return res.status(400).json({ error: errorMsg });
    }

    try {
        // Verificar si el horario existe
        const horarioExistente = await Horario.findByPk(idHorario);
        if (!horarioExistente) {
            const errorMsg = 'El horario especificado no existe.';
            registrarLog('createPelicula - error', req, { error: errorMsg });
            return res.status(400).json({ error: errorMsg });
        }

        // Verificar si ya existe una película con el mismo nombre, director y horario
        const peliculaExistente = await Pelicula.findOne({
            where: {
                nombrePelicula,
                directorPelicula,
                clasificacionPelicula,
                idHorario
            }
        });

        if (peliculaExistente) {
            const warningMsg = 'La película ya existe con el mismo nombre, director y horario. Intente cambiando el horario';
            registrarLog('createPelicula - advertencia', req, { warning: warningMsg });
            return res.status(409).json({ message: warningMsg });
        }

        // Crear nueva película
        const pelicula = await Pelicula.create({
            nombrePelicula,
            directorPelicula,
            duracionPelicula,
            actoresPelicula,
            clasificacionPelicula,
            idHorario,
            precioBoleto
        });

        registrarLog('createPelicula - éxito', req, { pelicula });
        res.status(201).json(pelicula);
    } catch (error) {
        // Registrar detalles del error
        registrarLog('createPelicula - error', req, { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Ocurrió un error al crear la película.' });
    }
};


// Obtener todas las películas
exports.getAllPeliculas = async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll();
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog('getAllPeliculas', req, { peliculasCount: peliculas.length, userAgent }, 'info');
        res.json(peliculas);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog('getAllSalas', req, { error: error.message, userAgent }, 'error');

        res.status(500).json({ error: error.message });
    }
};

// Obtener películas por criterios de búsqueda
exports.getPeliculas = async (req, res) => {
    try {
        const { idPelicula, nombrePelicula, clasificacionPelicula, directorPelicula, duracionPelicula, actoresPelicula, idHorario, precioBoleto } = req.query;
        const searchCriteria = {};
        if (idPelicula) searchCriteria.idPelicula = idPelicula;
        if (nombrePelicula) searchCriteria.nombrePelicula = nombrePelicula;
        if (clasificacionPelicula) searchCriteria.clasificacionPelicula = clasificacionPelicula;
        if (directorPelicula) searchCriteria.directorPelicula = directorPelicula;
        if (duracionPelicula) searchCriteria.duracionPelicula = duracionPelicula;
        if (actoresPelicula) searchCriteria.actoresPelicula = actoresPelicula;
        if (idHorario) searchCriteria.idHorario = idHorario;
        if (precioBoleto) searchCriteria.precioBoleto = precioBoleto;

        const peliculas = await Pelicula.findAll({ where: searchCriteria });

        if (peliculas.length > 0) {
            registrarLog(req, 'getPeliculas', { searchCriteria, peliculas }, 'info');
            res.json(peliculas);
        } else {
            registrarLog(req, 'getPeliculas', { searchCriteria, message: 'No se encontraron películas con los criterios proporcionados' }, 'warning');
            res.status(404).json({ message: 'No se encontraron películas con los criterios proporcionados' });
        }
    } catch (error) {
        registrarLog(req, 'getPeliculas', { error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Actualizar películas por múltiples criterios
exports.updatePeliculas = async (req, res) => {
    try {
        const { idPelicula, nombrePelicula, descripcion, duracionPelicula, genero, directorPelicula, actoresPelicula, clasificacionPelicula, precioBoleto, idHorario } = req.body;

        if (!idPelicula) {
            registrarLog(req, 'updatePeliculas', { message: 'ID de la película es requerido para la actualización' }, 'error');
            return res.status(400).json({ message: 'ID de la película es requerido para la actualización' });
        }

        // Validar clasificacionPelicula
        const validClasificaciones = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
        if (clasificacionPelicula && !validClasificaciones.includes(clasificacionPelicula)) {
            registrarLog(req, 'updatePeliculas', { message: 'Clasificación de película no válida' }, 'error');
            return res.status(400).json({ message: 'Clasificación de película no válida' });
        }

        const updateFields = {};
        if (nombrePelicula) {
            if (nombrePelicula.trim() === '') {
                registrarLog(req, 'updatePeliculas', { message: 'Nombre de la película no puede estar vacío' }, 'error');
                return res.status(400).json({ message: 'Nombre de la película no puede estar vacío' });
            }
            updateFields.nombrePelicula = nombrePelicula;
        }
        if (descripcion) updateFields.descripcion = descripcion;
        if (duracionPelicula) {
            if (duracionPelicula <= 0) {
                registrarLog(req, 'updatePeliculas', { message: 'Duración de la película debe ser un número positivo' }, 'error');
                return res.status(400).json({ message: 'Duración de la película debe ser un número positivo' });
            }
            updateFields.duracionPelicula = duracionPelicula;
        }
        if (genero) updateFields.genero = genero;
        if (directorPelicula) updateFields.directorPelicula = directorPelicula;
        if (actoresPelicula) {
            if (actoresPelicula.trim() === '') {
                registrarLog(req, 'updatePeliculas', { message: 'Actores de la película no puede estar vacío' }, 'error');
                return res.status(400).json({ message: 'Actores de la película no puede estar vacío' });
            }
            updateFields.actoresPelicula = actoresPelicula;
        }
        if (clasificacionPelicula) updateFields.clasificacionPelicula = clasificacionPelicula;
        if (precioBoleto) {
            if (precioBoleto <= 0) {
                registrarLog(req, 'updatePeliculas', { message: 'Precio del boleto debe ser un número positivo' }, 'error');
                return res.status(400).json({ message: 'Precio del boleto debe ser un número positivo' });
            }
            updateFields.precioBoleto = precioBoleto;
        }
        if (idHorario) updateFields.idHorario = idHorario;

        const [updated] = await Pelicula.update(updateFields, { where: { idPelicula } });

        if (updated) {
            registrarLog(req, 'updatePeliculas', { updateFields }, 'info');
            res.json({ message: 'Película actualizada exitosamente' });
        } else {
            registrarLog(req, 'updatePeliculas', { message: 'Película no encontrada con el ID proporcionado' }, 'warning');
            res.status(404).json({ message: 'Película no encontrada con el ID proporcionado' });
        }
    } catch (error) {
        registrarLog(req, 'updatePeliculas', { error: error.message }, 'error');
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Eliminar una película
exports.deletePelicula = async (req, res) => {
    try {
        const { idPelicula } = req.params;

        // Verificar si se proporciona el ID de la película
        if (!idPelicula) {
            registrarLog(req, 'deletePelicula', { message: 'ID de la película es requerido para la eliminación' }, 'error');
            return res.status(400).json({ message: 'ID de la película es requerido para la eliminación' });
        }

        // Buscar la película por su ID
        const pelicula = await Pelicula.findByPk(idPelicula);
        if (!pelicula) {
            registrarLog(req, 'deletePelicula', { message: 'Película no encontrada con el ID proporcionado' }, 'warning');
            return res.status(404).json({ message: 'Película no encontrada con el ID proporcionado' });
        }

        // Eliminar la película
        await Pelicula.destroy({ where: { idPelicula } });

        // Responder con éxito
        registrarLog(req, 'deletePelicula', { idPelicula }, 'info');
        res.json({ message: 'Película eliminada exitosamente' });
    } catch (error) {
        registrarLog(req, 'deletePelicula', { error: error.message }, 'error');
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Generar reporte en PDF de las películas
exports.getPeliculasPDF = async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll();

        const doc = new PDFDocument();

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename=peliculas.pdf');

        doc.pipe(res);

        doc.fontSize(20).text('Reporte de Películas - Cine Fox', { align: 'center' });

        peliculas.forEach(pelicula => {
            doc.fontSize(12).text(`ID de la película: ${pelicula.idPelicula}`);
            doc.fontSize(12).text(`Nombre: ${pelicula.nombrePelicula}`);
            //doc.fontSize(12).text(`Descripción: ${pelicula.descripcion}`);
            doc.fontSize(12).text(`Duración: ${pelicula.duracionPelicula} minutos`);
            doc.fontSize(12).text(`Clasificación: ${pelicula.clasificacionPelicula}`);
            doc.fontSize(12).text(`Director: ${pelicula.directorPelicula}`);
            doc.fontSize(12).text(`Precio del Boleto: $${pelicula.precioBoleto}`);
            doc.fontSize(12).text(`ID del Horario: ${pelicula.idHorario}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
