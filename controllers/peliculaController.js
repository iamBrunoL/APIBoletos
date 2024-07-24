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

exports.getAllPeliculas = async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll();
        res.json(peliculas);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getPeliculaById = async (req, res) => {
    try {
        const pelicula = await Pelicula.findByPk(req.params.id);
        if (pelicula) {
            res.json(pelicula);
        } else {
            res.status(404).json({ message: 'Pelicula no encontrada' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.updatePelicula = async (req, res) => {
    try {
        await Pelicula.update(req.body, { where: { idPelicula: req.params.id } });
        res.json({ message: 'Pelicula actualizada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deletePelicula = async (req, res) => {
    try {
        await Pelicula.destroy({ where: { idPelicula: req.params.id } });
        res.json({ message: 'Pelicula eliminada' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
