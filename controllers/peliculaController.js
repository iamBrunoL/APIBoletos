const Pelicula = require('../models/Pelicula');
const Horario = require('../models/Horario');

exports.createPelicula = async (req, res) => {
    try {
        const { idHorario, nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, precioBoleto } = req.body;
        const horario = await Horario.findByPk(idHorario);
        if (!horario) {
            return res.status(404).json({ message: 'Horario no encontrado' });
        }

        const pelicula = await Pelicula.create({ idHorario, nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, precioBoleto });
        res.json(pelicula);
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

// Obtener películas por múltiples criterios
exports.getPeliculas = async (req, res) => {
    try {
        const { idPelicula, nombrePelicula, directorPelicula, clasificacionPelicula } = req.query;
        
        const searchCriteria = {};
        if (idPelicula) searchCriteria.idPelicula = idPelicula;
        if (nombrePelicula) searchCriteria.nombrePelicula = nombrePelicula;
        if (directorPelicula) searchCriteria.directorPelicula = directorPelicula;
        if (clasificacionPelicula) searchCriteria.clasificacionPelicula = clasificacionPelicula;

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

// Actualizar una película
exports.updatePelicula = async (req, res) => {
    try {
        const { idPelicula, nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, precioBoleto } = req.body;

        if (!idPelicula) {
            return res.status(400).json({ message: 'ID de la película es requerido para la actualización' });
        }

        const updateFields = {};
        if (nombrePelicula) updateFields.nombrePelicula = nombrePelicula;
        if (directorPelicula) updateFields.directorPelicula = directorPelicula;
        if (duracionPelicula) updateFields.duracionPelicula = duracionPelicula;
        if (actoresPelicula) updateFields.actoresPelicula = actoresPelicula;
        if (clasificacionPelicula) updateFields.clasificacionPelicula = clasificacionPelicula;
        if (precioBoleto) updateFields.precioBoleto = precioBoleto;

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
