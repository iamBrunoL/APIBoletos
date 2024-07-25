const Pelicula = require('../models/Pelicula');
const PDFDocument = require('pdfkit');

// Crear una nueva película
exports.createPelicula = async (req, res) => {
    const { nombrePelicula, descripcion, duracion, genero, director, precioBoleto, idHorario } = req.body;

    try {
        const pelicula = await Pelicula.create({
            nombrePelicula,
            descripcion,
            duracion,
            genero,
            director,
            precioBoleto,
            idHorario
        });

        res.status(201).json(pelicula);
    } catch (error) {
        res.status(500).json({ error: error.message });
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
        const { idPelicula, nombrePelicula, genero, director } = req.query;
        const searchCriteria = {};
        if (idPelicula) searchCriteria.idPelicula = idPelicula;
        if (nombrePelicula) searchCriteria.nombrePelicula = nombrePelicula;
        if (genero) searchCriteria.genero = genero;
        if (director) searchCriteria.director = director;

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
        const { idPelicula, nombrePelicula, descripcion, duracion, genero, director, precioBoleto, idHorario } = req.body;

        if (!idPelicula) {
            return res.status(400).json({ message: 'ID de la película es requerido para la actualización' });
        }

        const updateFields = {};
        if (nombrePelicula) updateFields.nombrePelicula = nombrePelicula;
        if (descripcion) updateFields.descripcion = descripcion;
        if (duracion) updateFields.duracion = duracion;
        if (genero) updateFields.genero = genero;
        if (director) updateFields.director = director;
        if (precioBoleto) updateFields.precioBoleto = precioBoleto;
        if (idHorario) updateFields.idHorario = idHorario;

        const [updated] = await Pelicula.update(updateFields, { where: { idPelicula } });

        if (updated) {
            res.json({ message: 'Película actualizada exitosamente' });
        } else {
            res.status(404).json({ message: 'Película no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una película
exports.deletePelicula = async (req, res) => {
    try {
        const { idPelicula } = req.params;

        if (!idPelicula) {
            return res.status(400).json({ message: 'ID de la película es requerido para la eliminación' });
        }

        const pelicula = await Pelicula.findByPk(idPelicula);
        if (!pelicula) {
            return res.status(404).json({ message: 'Película no encontrada' });
        }

        await Pelicula.destroy({ where: { idPelicula } });

        res.json({ message: 'Película eliminada exitosamente' });
    } catch (error) {
        res.status(500).json({ error: error.message });
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

        doc.fontSize(20).text('Reporte de Películas', { align: 'center' });

        peliculas.forEach(pelicula => {
            doc.fontSize(12).text(`ID: ${pelicula.idPelicula}`);
            doc.fontSize(12).text(`Nombre: ${pelicula.nombrePelicula}`);
            doc.fontSize(12).text(`Descripción: ${pelicula.descripcion}`);
            doc.fontSize(12).text(`Duración: ${pelicula.duracion} minutos`);
            doc.fontSize(12).text(`Género: ${pelicula.genero}`);
            doc.fontSize(12).text(`Director: ${pelicula.director}`);
            doc.fontSize(12).text(`Precio del Boleto: $${pelicula.precioBoleto}`);
            doc.fontSize(12).text(`ID del Horario: ${pelicula.idHorario}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
