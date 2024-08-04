const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../middleware/blacklist');
const registrarLog = require('../middleware/logs');
const PDFDocument = require('pdfkit');
const { Op } = require('sequelize');


// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    try {
        const { nombreUsuario, apellidoUsuario, edadUsuario, correoUsuario, telefonoUsuario, contrasenaUsuario, tipoUsuario } = req.body;

        // Validar datos de entrada
        if (!nombreUsuario || typeof nombreUsuario !== 'string' || nombreUsuario.trim() === '') {
            await registrarLog(req, 'Nombre de usuario inválido', 'warn');
            return res.status(400).json({ error: 'El nombre de usuario es requerido y debe ser una cadena no vacía.' });
        }
        if (!apellidoUsuario || typeof apellidoUsuario !== 'string' || apellidoUsuario.trim() === '') {
            await registrarLog(req, 'Apellido de usuario inválido', 'warn');
            return res.status(400).json({ error: 'El apellido de usuario es requerido y debe ser una cadena no vacía.' });
        }
        if (!edadUsuario || typeof edadUsuario !== 'number' || edadUsuario <= 0) {
            await registrarLog(req, 'Edad de usuario inválida', 'warn');
            return res.status(400).json({ error: 'La edad del usuario es requerida y debe ser un número positivo.' });
        }
        if (!correoUsuario || typeof correoUsuario !== 'string' || !correoUsuario.includes('@')) {
            await registrarLog(req, 'Correo de usuario inválido', 'warn');
            return res.status(400).json({ error: 'El correo del usuario es requerido y debe ser una dirección de correo válida.' });
        }
        if (!telefonoUsuario || typeof telefonoUsuario !== 'string' || telefonoUsuario.trim() === '') {
            await registrarLog(req, 'Teléfono de usuario inválido', 'warn');
            return res.status(400).json({ error: 'El teléfono del usuario es requerido y debe ser una cadena no vacía.' });
        }
        if (!contrasenaUsuario || typeof contrasenaUsuario !== 'string' || contrasenaUsuario.length < 6) {
            await registrarLog(req, 'Contraseña de usuario inválida', 'warn');
            return res.status(400).json({ error: 'La contraseña es requerida y debe tener al menos 6 caracteres.' });
        }
        if (!['cliente', 'admin', 'otro'].includes(tipoUsuario)) {
            await registrarLog(req, 'Tipo de usuario inválido', 'warn');
            return res.status(400).json({ error: 'Tipo de usuario inválido. Debe ser uno de los siguientes: cliente, admin, otro.' });
        }

        // Verificar si el usuario ya existe
        const usuarioExistente = await Usuario.findOne({ where: { correoUsuario: correoUsuario } });
        if (usuarioExistente) {
            await registrarLog(req, `Error al crear usuario: El usuario con el correo ${correoUsuario} ya existe.`, 'warn');
            return res.status(400).json({ error: 'El usuario con el correo proporcionado ya existe.' });
        }

        // Cifrar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasenaUsuario, salt);

        // Crear el nuevo usuario
        const usuario = await Usuario.create({
            nombreUsuario,
            apellidoUsuario,
            edadUsuario,
            correoUsuario,
            telefonoUsuario,
            contrasenaUsuario: hashedPassword,
            tipoUsuario
        });

        // Excluir contrasenaUsuario y tipoUsuario de la respuesta
        const { contrasenaUsuario: _, tipoUsuario: __, ...usuarioResponse } = usuario.dataValues;

        // Registrar creación de usuario
        await registrarLog(req, `Usuario creado: ${JSON.stringify(usuarioResponse)}`, 'info');

        res.status(201).json(usuarioResponse);
    } catch (error) {
        if (error.name === 'SequelizeValidationError') {
            await registrarLog(req, `Error de validación al crear usuario: ${error.message}`, 'warn');
            return res.status(400).json({ error: 'Datos de usuario inválidos. Verifica la información proporcionada.' });
        }

        await registrarLog(req, `Error al crear usuario: ${error.message}`, 'error');
        res.status(500).json({ error: 'Error interno del servidor. Por favor, intenta de nuevo más tarde.' });
    }
};

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
    try {
        // Verificar que req.headers está definido
        if (!req.headers) {
            return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
        }

        const usuarios = await Usuario.findAll();

        // Registrar consulta de todos los usuarios
        await registrarLog('getAllUsuarios', req, { usuariosCount: usuarios.length }, 'info');

        res.json(usuarios);
    } catch (error) {
        await registrarLog('getAllUsuarios', req, { error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Buscar usuarios por múltiples criterios
exports.getUsuarios = async (req, res) => {
    try {
        // Verificar que req.headers está definido
        if (!req.headers) {
            return res.status(500).json({ error: 'No se puede registrar el log. Encabezados no disponibles.' });
        }

        const { idUsuario, correoUsuario, tipoUsuario } = req.query;

        const searchCriteria = {};
        if (idUsuario) searchCriteria.idUsuario = idUsuario;
        if (correoUsuario) searchCriteria.correoUsuario = correoUsuario;
        if (tipoUsuario) searchCriteria.tipoUsuario = tipoUsuario;

        const usuarios = await Usuario.findAll({ where: searchCriteria });

        if (usuarios.length > 0) {
            // Registrar búsqueda exitosa
            await registrarLog('getUsuarios', req, { searchCriteria, resultsCount: usuarios.length }, 'info');
            res.json(usuarios);
        } else {
            // Registrar búsqueda sin resultados
            await registrarLog('getUsuarios', req, { searchCriteria }, 'warn');
            res.status(404).json({ message: 'No se encontraron usuarios con los criterios proporcionados' });
        }
    } catch (error) {
        await registrarLog('getUsuarios', req, { error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};


// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
    try {
        const { contrasenaUsuario, tipoUsuario, ...rest } = req.body;
        const { id } = req.params;
        const { tipo: tipoUsuarioAutenticado } = req.usuario; // El rol del usuario autenticado

        // Verificar si se intenta cambiar el tipo de usuario a admin
        if (tipoUsuario && tipoUsuario !== 'admin' && tipoUsuarioAutenticado === 'admin') {
            const adminCount = await Usuario.count({ where: { tipoUsuario: 'admin' } });

            // Verificar si hay más de un administrador en el sistema
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Debe haber al menos un administrador en el sistema.' });
            }
        }

        // Actualizar la contraseña si se proporciona
        if (contrasenaUsuario) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(contrasenaUsuario, salt);
            rest.contrasenaUsuario = hashedPassword;
        }

        const [updated] = await Usuario.update(rest, { where: { idUsuario: id } });
        if (updated) {
            // Registrar actualización exitosa
            await registrarLog(req, `Usuario actualizado: ${id}`, 'info');
            res.json({ message: 'Usuario actualizado' });
        } else {
            // Registrar actualización sin resultados
            await registrarLog(req, `Usuario no encontrado para actualización: ${id}`, 'warn');
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        await registrarLog(req, `Error al actualizar usuario: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioAEliminar = await Usuario.findByPk(id);
        
        if (!usuarioAEliminar) {
            // Registrar intento de eliminación fallido
            await registrarLog(req, `Usuario no encontrado para eliminación: ${id}`, 'warn');
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (usuarioAEliminar.tipoUsuario === 'admin') {
            const adminCount = await Usuario.count({ where: { tipoUsuario: 'admin' } });
            
            // Verificar si queda al menos un administrador
            if (adminCount <= 1) {
                // Registrar intento de eliminación fallido
                await registrarLog(req, `No se puede eliminar el único administrador del sistema: ${id}`, 'warn');
                return res.status(400).json({ message: 'No puedes eliminar el único administrador del sistema.' });
            }
        }

        const deleted = await Usuario.destroy({ where: { idUsuario: id } });
        if (deleted) {
            // Registrar eliminación exitosa
            await registrarLog(req, `Usuario eliminado: ${id}`, 'info');
            res.json({ message: 'Usuario eliminado' });
        } else {
            // Registrar eliminación sin resultados
            await registrarLog(req, `Usuario no encontrado para eliminación: ${id}`, 'warn');
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        await registrarLog(req, `Error al eliminar usuario: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

exports.loginUsuario = async (req, res) => {
    try {
        const { correoUsuario, contrasenaUsuario } = req.body;
        const usuario = await Usuario.findOne({ where: { correoUsuario } });

        if (!usuario) {
            // Registrar intento de login fallido con correo proporcionado
            await registrarLog('loginUsuario', req, { message: 'Intento de inicio de sesión fallido - Usuario no encontrado', usuario: correoUsuario }, 'warn');
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(contrasenaUsuario, usuario.contrasenaUsuario);

        if (!isMatch) {
            // Registrar intento de login fallido con ID de usuario
            await registrarLog('loginUsuario', req, { message: 'Intento de inicio de sesión fallido - Contraseña incorrecta', usuario: usuario.idUsuario }, 'warn');
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const payload = { id: usuario.idUsuario, tipo: usuario.tipoUsuario };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Registrar inicio de sesión exitoso con ID de usuario
        await registrarLog('loginUsuario', req, { message: 'Inicio de sesión exitoso', usuario: usuario.idUsuario }, 'info');

        res.json({ token });
    } catch (error) {
        await registrarLog('loginUsuario', req, { error: error.message }, 'error');
        res.status(500).json({ error: error.message });
    }
};
exports.logoutUsuario = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (token) {
            const tokenWithoutBearer = token.replace('Bearer ', '');
            
            // Suponiendo que la función blacklistToken marca el token como inválido o lo guarda en una lista negra
            blacklistToken(tokenWithoutBearer);

            // Extraer el ID de usuario del token para registrar el logout
            const decoded = jwt.decode(tokenWithoutBearer);
            const usuarioId = decoded ? decoded.id : 'desconocido';

            // Registrar cierre de sesión con ID de usuario
            await registrarLog('logoutUsuario', req, { message: `Cierre de sesión del usuario ${usuarioId}`, usuario: usuarioId }, 'info');

            res.json({ message: 'Sesión cerrada correctamente' });
        } else {
            await registrarLog('logoutUsuario', req, { message: 'Token no proporcionado para el cierre de sesión', usuario: 'desconocido' }, 'warn');
            res.status(400).json({ message: 'Token no proporcionado' });
        }
    } catch (error) {
        await registrarLog('logoutUsuario', req, { error: error.message, usuario: 'desconocido' }, 'error');
        res.status(500).json({ error: error.message });
    }
};


exports.getUsuariosPDF = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();

        if (!usuarios.length) {
            await registrarLog(req, 'No se encontraron usuarios para el reporte PDF', 'warn');
            return res.status(404).json({ message: 'No se encontraron usuarios' });
        }

        // Crear un nuevo documento PDF
        const doc = new PDFDocument();
        let fileName = 'reporte_usuarios.pdf';
        
        // Configurar el encabezado de la respuesta HTTP
        res.setHeader('Content-disposition', `attachment; filename=${fileName}`);
        res.setHeader('Content-type', 'application/pdf');

        doc.pipe(res); // Pasa el PDF directamente a la respuesta HTTP

        // Añadir título
        doc.fontSize(20).text('Reporte Detallado de Usuarios', { align: 'center' });
        doc.moveDown();

        // Agregar los datos de los usuarios al PDF
        usuarios.sort((a, b) => {
            if (a.tipoUsuario === 'admin' && b.tipoUsuario !== 'admin') return -1;
            if (a.tipoUsuario !== 'admin' && b.tipoUsuario === 'admin') return 1;
            return a.nombreUsuario.localeCompare(b.nombreUsuario);
        });

        usuarios.forEach(usuario => {
            doc.fontSize(14).text(`ID: ${usuario.idUsuario}`, { continued: true });
            doc.text(` | Nombre: ${usuario.nombreUsuario} ${usuario.apellidoUsuario}`);
            doc.text(`Edad: ${usuario.edadUsuario}`);
            doc.text(`Correo: ${usuario.correoUsuario}`);
            doc.text(`Teléfono: ${usuario.telefonoUsuario}`);
            doc.text(`Tipo: ${usuario.tipoUsuario}`);
            doc.moveDown();
        });

        doc.end();

        // Registrar generación del reporte
        await registrarLog(req, `Reporte detallado de usuarios generado exitosamente`, 'info');
    } catch (error) {
        await registrarLog(req, `Error al generar el reporte detallado de usuarios: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};