const Pelicula = require('../models/Pelicula');
const PDFDocument = require('pdfkit');
const registrarLog = require('../middleware/logs');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurarse de que el directorio de uploads existe
if (!fs.existsSync('uploads/')) {
    fs.mkdirSync('uploads/');
}

// Configuración de multer para almacenar imágenes
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/'); // Ruta donde se almacenarán las imágenes
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname)); // Nombre único para cada archivo
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|gif/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes (formatos: .jpeg, .jpg, .png, .gif)'));
    }
};

const upload = multer({ 
    storage: storage, 
    fileFilter: fileFilter 
});

// Crear una nueva película
exports.createPelicula = [
    upload.single('imagenPelicula'),  // Middleware de multer para una sola imagen
    async (req, res) => {
        const { nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, precioBoleto } = req.body;

        // Registrar log solo si user-agent está disponible
        const userAgent = req.headers['user-agent'] || 'unknown';
        registrarLog('createPelicula - datos recibidos', req, { nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, precioBoleto, userAgent });

        if (!nombrePelicula || !directorPelicula || !duracionPelicula || !actoresPelicula || !clasificacionPelicula || !precioBoleto) {
            const errorMsg = 'Todos los campos son obligatorios.';
            registrarLog('createPelicula - error', req, { error: errorMsg });
            return res.status(400).json({ error: errorMsg });
        }

        try {
            const peliculaExistente = await Pelicula.findOne({
                where: {
                    nombrePelicula,
                    directorPelicula,
                    clasificacionPelicula
                }
            });

            if (peliculaExistente) {
                const warningMsg = 'La película ya existe con el mismo nombre y director. Intente cambiando los datos.';
                registrarLog('createPelicula - advertencia', req, { warning: warningMsg });
                return res.status(409).json({ message: warningMsg });
            }

            const imagenPelicula = req.file ? req.file.path : null; // Ruta de la imagen subida

            const pelicula = await Pelicula.create({
                nombrePelicula,
                directorPelicula,
                duracionPelicula,
                actoresPelicula,
                clasificacionPelicula,
                precioBoleto,
                imagenPelicula
            });

            registrarLog('createPelicula - éxito', req, { pelicula });
            res.status(201).json(pelicula);
        } catch (error) {
            registrarLog('createPelicula - error', req, { error: error.message, stack: error.stack });
            res.status(500).json({ error: 'Ocurrió un error al crear la película.' });
        }
    }
];


exports.getAllPeliculas = async (req, res) => {
    try {
        const peliculas = await Pelicula.findAll();
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog('getAllPeliculas', req, { peliculasCount: peliculas.length, userAgent }, 'info');
        res.json(peliculas);
    } catch (error) {
        const userAgent = req.headers ? req.headers['user-agent'] : 'unknown';
        registrarLog('getAllPeliculas', req, { error: error.message, userAgent }, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Actualizar una película existente
exports.updatePelicula = [
    upload.single('imagenPelicula'),  // Middleware de multer para manejar la subida de imágenes
    async (req, res) => {
        const { idPelicula } = req.params;
        const { nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, precioBoleto } = req.body;

        // Verificar que req.headers está definido
        if (!req.headers) {
            return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
        }

        // Registrar la solicitud inicial
        registrarLog('updatePelicula - datos recibidos', req, { idPelicula, nombrePelicula, directorPelicula, duracionPelicula, actoresPelicula, clasificacionPelicula, precioBoleto });

        // Validar los datos requeridos
        if (!idPelicula || !nombrePelicula || !directorPelicula || !duracionPelicula || !actoresPelicula || !clasificacionPelicula || !precioBoleto) {
            const errorMsg = 'Todos los campos son obligatorios.';
            registrarLog('updatePelicula - error', req, { error: errorMsg });
            return res.status(400).json({ error: errorMsg });
        }

        try {
            // Verificar si la película existe
            const pelicula = await Pelicula.findByPk(idPelicula);
            if (!pelicula) {
                const warningMsg = 'Película no encontrada con el ID proporcionado.';
                registrarLog('updatePelicula - advertencia', req, { warning: warningMsg });
                return res.status(404).json({ message: warningMsg });
            }

            // Si se subió una nueva imagen, eliminar la imagen antigua
            if (req.file) {
                if (pelicula.imagenPelicula) {
                    fs.unlinkSync(pelicula.imagenPelicula); // Elimina la imagen antigua
                }
                pelicula.imagenPelicula = req.file.path; // Asignar la nueva imagen
            }

            // Actualizar la película
            await pelicula.update({
                nombrePelicula,
                directorPelicula,
                duracionPelicula,
                actoresPelicula,
                clasificacionPelicula,
                precioBoleto,
                imagenPelicula: pelicula.imagenPelicula // Asegurarse de que la imagen se actualiza
            });

            registrarLog('updatePelicula - éxito', req, { pelicula });
            res.status(200).json(pelicula);
        } catch (error) {
            // Registrar detalles del error
            registrarLog('updatePelicula - error', req, { error: error.message, stack: error.stack });
            res.status(500).json({ error: 'Ocurrió un error al actualizar la película.' });
        }
    }
];

// Eliminar una película
exports.deletePelicula = async (req, res) => {
    try {
        const { idPelicula } = req.params;

        if (!idPelicula) {
            registrarLog('deletePelicula - error', req, { message: 'ID de la película es requerido para la eliminación' }, 'error');
            return res.status(400).json({ message: 'ID de la película es requerido para la eliminación' });
        }

        const pelicula = await Pelicula.findByPk(idPelicula);
        if (!pelicula) {
            registrarLog('deletePelicula - advertencia', req, { message: 'Película no encontrada con el ID proporcionado' }, 'warning');
            return res.status(404).json({ message: 'Película no encontrada con el ID proporcionado' });
        }

        await Pelicula.destroy({ where: { idPelicula } });

        registrarLog('deletePelicula - éxito', req, { idPelicula }, 'info');
        res.json({ message: 'Película eliminada exitosamente' });
    } catch (error) {
        registrarLog('deletePelicula - error', req, { error: error.message }, 'error');
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
            doc.fontSize(12).text(`Duración: ${pelicula.duracionPelicula} minutos`);
            doc.fontSize(12).text(`Clasificación: ${pelicula.clasificacionPelicula}`);
            doc.fontSize(12).text(`Director: ${pelicula.directorPelicula}`);
            doc.fontSize(12).text(`Precio del Boleto: $${pelicula.precioBoleto}`);
            doc.moveDown();
        });

        doc.end();
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
