const Pelicula = require('../models/Pelicula');
const PDFDocument = require('pdfkit');
const Horario = require('../models/Horario');

// Crear una nueva película
exports.createPelicula = async (req, res) => {
    const { nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, idHorario, precioBoleto } = req.body;

    // Imprimir los datos recibidos para depuración
    //console.log('Datos recibidos:', req.body);

    // Definir las clasificaciones permitidas
    const clasificacionesPermitidas = ['G', 'PG', 'PG-13', 'R', 'NC-17'];

    // Validar los datos requeridos
    if (!nombrePelicula) {
        return res.status(400).json({ error: 'El campo nombrePelicula es requerido.' });
    }
    if (!directorPelicula) {
        return res.status(400).json({ error: 'El campo directorPelicula es requerido.' });
    }
    if (!duracionPelicula) {
        return res.status(400).json({ error: 'El campo duracionPelicula es requerido.' });
    }
    if (!actoresPelicula) {
        return res.status(400).json({ error: 'El campo actoresPelicula es requerido.' });
    }
    if (!clasificacionPelicula) {
        return res.status(400).json({ error: 'El campo clasificacionPelicula es requerido.' });
    }
    // Validar que la clasificación esté en las permitidas
    if (!clasificacionesPermitidas.includes(clasificacionPelicula)) {
        return res.status(400).json({ error: `El campo clasificacionPelicula debe ser uno de los siguientes: ${clasificacionesPermitidas.join(', ')}.` });
    }
    if (!idHorario) {
        return res.status(400).json({ error: 'El campo idHorario es requerido.' });
    }
    if (!precioBoleto) {
        return res.status(400).json({ error: 'El campo precioBoleto es requerido.' });
    }

    try {
        const pelicula = await Pelicula.create({
            nombrePelicula,
            directorPelicula,
            duracionPelicula,
            actoresPelicula,
            clasificacionPelicula,
            idHorario,
            precioBoleto
        });

        res.status(201).json(pelicula);
    } catch (error) {
        // Manejar errores específicos de Sequelize
        if (error.name === 'SequelizeForeignKeyConstraintError') {
            return res.status(400).json({ error: 'El idHorario proporcionado no existe.' });
        }
        if (error.name === 'SequelizeValidationError') {
            const errors = error.errors.map(e => e.message);
            return res.status(400).json({ error: errors.join(', ') });
        }
        res.status(500).json({ error: 'Ocurrió un error al crear la película.' });
    }
};

// Obtener todas las películas
exports.getAllPeliculas = async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll();
        res.json(peliculas);
    } catch (error) {
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
            res.json(peliculas);
        } else {
            res.status(404).json({ message: 'No se encontraron películas con los criterios proporcionados' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar películas por múltiples criterios
exports.updatePeliculas = async (req, res) => {
    try {
        const { idPelicula, nombrePelicula, descripcion, duracionPelicula, genero, directorPelicula, actoresPelicula, clasificacionPelicula, precioBoleto, idHorario } = req.body;

        if (!idPelicula) {
            return res.status(400).json({ message: 'ID de la película es requerido para la actualización' });
        }

        // Validar clasificacionPelicula
        const validClasificaciones = ['G', 'PG', 'PG-13', 'R', 'NC-17'];
        if (clasificacionPelicula && !validClasificaciones.includes(clasificacionPelicula)) {
            return res.status(400).json({ message: 'Clasificación de película no válida' });
        }

        const updateFields = {};
        if (nombrePelicula) {
            if (nombrePelicula.trim() === '') {
                return res.status(400).json({ message: 'Nombre de la película no puede estar vacío' });
            }
            updateFields.nombrePelicula = nombrePelicula;
        }
        if (descripcion) updateFields.descripcion = descripcion;
        if (duracionPelicula) {
            if (duracionPelicula <= 0) {
                return res.status(400).json({ message: 'Duración de la película debe ser un número positivo' });
            }
            updateFields.duracionPelicula = duracionPelicula;
        }
        if (genero) updateFields.genero = genero;
        if (directorPelicula) updateFields.directorPelicula = directorPelicula;
        if (actoresPelicula) {
            if (actoresPelicula.trim() === '') {
                return res.status(400).json({ message: 'Actores de la película no puede estar vacío' });
            }
            updateFields.actoresPelicula = actoresPelicula;
        }
        if (clasificacionPelicula) updateFields.clasificacionPelicula = clasificacionPelicula;
        if (precioBoleto) {
            if (precioBoleto <= 0) {
                return res.status(400).json({ message: 'Precio del boleto debe ser un número positivo' });
            }
            updateFields.precioBoleto = precioBoleto;
        }
        if (idHorario) updateFields.idHorario = idHorario;

        const [updated] = await Pelicula.update(updateFields, { where: { idPelicula } });

        if (updated) {
            res.json({ message: 'Película actualizada exitosamente' });
        } else {
            res.status(404).json({ message: 'Película no encontrada con el ID proporcionado' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};


// Eliminar una película
exports.deletePelicula = async (req, res) => {
    try {
        const { idPelicula } = req.params;

        // Verificar si se proporciona el ID de la película
        if (!idPelicula) {
            return res.status(400).json({ message: 'ID de la película es requerido para la eliminación' });
        }

        // Buscar la película por su ID
        const pelicula = await Pelicula.findByPk(idPelicula);
        if (!pelicula) {
            return res.status(404).json({ message: 'Película no encontrada con el ID proporcionado' });
        }

        // Eliminar la película
        await Pelicula.destroy({ where: { idPelicula } });

        // Responder con éxito
        res.json({ message: 'Película eliminada exitosamente' });
    } catch (error) {
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
