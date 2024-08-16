const Cartelera = require('../models/Cartelera');
const Pelicula = require('../models/Pelicula');
const Horario = require('../models/Horario');
const Sala = require('../models/Sala');
const registrarLog = require('../middleware/logs');

// Crear una nueva entrada en la cartelera para múltiples días
exports.createCartelera = async (req, res) => {
    const { idPelicula, idHorario, idSala, dias } = req.body;

    if (!req.headers) {
        return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
    }

    registrarLog('createCartelera - datos recibidos', req, { idPelicula, idHorario, idSala, dias });

    if (!idPelicula || !idHorario || !idSala || !dias || dias.length === 0) {
        const errorMsg = 'Todos los campos son obligatorios, incluidos los días.';
        registrarLog('createCartelera - error', req, { error: errorMsg });
        return res.status(400).json({ error: errorMsg });
    }

    try {
        // Obtener el horario para la fecha de emisión
        const horario = await Horario.findByPk(idHorario);
        if (!horario) {
            const errorMsg = 'El horario proporcionado no existe.';
            registrarLog('createCartelera - error', req, { error: errorMsg });
            return res.status(404).json({ error: errorMsg });
        }

        const nuevasCarteleras = [];
        for (const dia of dias) {
            const nuevaCartelera = await Cartelera.create({
                idPelicula,
                idHorario,
                idSala,
                nombreDia: dia
            });
            nuevasCarteleras.push(nuevaCartelera);
        }

        registrarLog('createCartelera - éxito', req, { carteleras: nuevasCarteleras });
        res.status(201).json(nuevasCarteleras);
    } catch (error) {
        registrarLog('createCartelera - error', req, { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Ocurrió un error al crear las entradas en la cartelera.' });
    }
};

// Obtener todas las entradas en la cartelera
exports.getAllCarteleras = async (req, res) => {
    try {
        const carteleras = await Cartelera.findAll({
            include: [
                { model: Pelicula, attributes: ['nombrePelicula'] },
                { model: Horario, attributes: ['horaProgramada'] },
                { model: Sala, attributes: ['nombreSala'] }
            ]
        });

        registrarLog('getAllCarteleras', req, { cartelerasCount: carteleras.length });
        res.json(carteleras);
    } catch (error) {
        registrarLog('getAllCarteleras - error', req, { error: error.message });
        res.status(500).json({ error: error.message });
    }
};

// Eliminar una entrada en la cartelera
exports.deleteCartelera = async (req, res) => {
    try {
        const { idCartelera } = req.params;

        if (!idCartelera) {
            registrarLog('deleteCartelera', req, { message: 'ID de la cartelera es requerido para la eliminación' }, 'error');
            return res.status(400).json({ message: 'ID de la cartelera es requerido para la eliminación' });
        }

        const cartelera = await Cartelera.findByPk(idCartelera);
        if (!cartelera) {
            registrarLog('deleteCartelera', req, { message: 'Cartelera no encontrada con el ID proporcionado' }, 'warning');
            return res.status(404).json({ message: 'Cartelera no encontrada con el ID proporcionado' });
        }

        await Cartelera.destroy({ where: { idCartelera } });

        registrarLog('deleteCartelera - éxito', req, { idCartelera });
        res.json({ message: 'Cartelera eliminada exitosamente' });
    } catch (error) {
        registrarLog('deleteCartelera - error', req, { error: error.message });
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
};

// Obtener carteleras por día de la semana
exports.getCarteleraPorDia = async (req, res) => {
    const { dia } = req.query;

    if (!dia) {
        return res.status(400).json({ error: 'El parámetro "dia" es obligatorio.' });
    }

    try {
        const carteleras = await Cartelera.findAll({
            where: { nombreDia: dia },
            include: [
                { model: Pelicula, attributes: ['nombrePelicula', 'imagenPelicula', 'actoresPelicula', 'duracionPelicula', 'directorPelicula', 'clasificacionPelicula', 'precioBoleto'] },
                { model: Horario, attributes: ['horaProgramada'] },
                { model: Sala, attributes: ['nombreSala'] }
            ]
        });

        if (carteleras.length === 0) {
            return res.status(404).json({ message: 'No se encontraron carteleras para el día especificado.' });
        }

        registrarLog('getCarteleraPorDia', req, { cartelerasCount: carteleras.length });
        res.json(carteleras);
    } catch (error) {
        registrarLog('getCarteleraPorDia - error', req, { error: error.message });
        res.status(500).json({ error: 'Error interno del servidor.' });
    }
};