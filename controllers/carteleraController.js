const Cartelera = require('../models/Cartelera');
const Pelicula = require('../models/Pelicula');
const Horario = require('../models/Horario');
const Sala = require('../models/Sala');
const registrarLog = require('../middleware/logs');

// Función para obtener el nombre del día
const obtenerNombreDia = (fecha) => {
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const fechaObj = new Date(fecha);
    return diasSemana[fechaObj.getUTCDay()];
};

// Crear una nueva entrada en la cartelera
exports.createCartelera = async (req, res) => {
    const { idPelicula, idHorario, idSala } = req.body;

    if (!req.headers) {
        return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
    }

    registrarLog('createCartelera - datos recibidos', req, { idPelicula, idHorario, idSala });

    if (!idPelicula || !idHorario || !idSala) {
        const errorMsg = 'Todos los campos son obligatorios.';
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

        // Obtener el nombre del día a partir de la fecha de emisión
        const nombreDia = obtenerNombreDia(horario.fechaDeEmision);

        const nuevaCartelera = await Cartelera.create({
            idPelicula,
            idHorario,
            idSala,
            nombreDia
        });

        registrarLog('createCartelera - éxito', req, { cartelera: nuevaCartelera });
        res.status(201).json(nuevaCartelera);
    } catch (error) {
        registrarLog('createCartelera - error', req, { error: error.message, stack: error.stack });
        res.status(500).json({ error: 'Ocurrió un error al crear la entrada en la cartelera.' });
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
