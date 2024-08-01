const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../middleware/blacklist');
const registrarLog = require('../middleware/logs');
const PDFDocument = require('pdfkit');

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    try {
        const { contrasenaUsuario, tipoUsuario, ...rest } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasenaUsuario, salt);

        const usuario = await Usuario.create({
            ...rest,
            contrasenaUsuario: hashedPassword
        });

        // Excluir contrasenaUsuario y tipoUsuario de la respuesta
        const { contrasenaUsuario: _, tipoUsuario: __, ...usuarioResponse } = usuario.dataValues;

        // Registrar creación de usuario
        await registrarLog(req, `Usuario creado: ${JSON.stringify(usuarioResponse)}`, 'info');

        res.json(usuarioResponse);
    } catch (error) {
        await registrarLog(req, `Error al crear usuario: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();

        // Registrar consulta de todos los usuarios
        await registrarLog(req, `Usuarios obtenidos: ${usuarios.length} usuarios`, 'info');

        res.json(usuarios);
    } catch (error) {
        await registrarLog(req, `Error al obtener usuarios: ${error.message}`, 'error');
        res.status(500).json({ error: error.message });
    }
};

// Buscar usuarios por múltiples criterios
exports.getUsuarios = async (req, res) => {
    try {
        const { idUsuario, correoUsuario, tipoUsuario } = req.query;

        const searchCriteria = {};
        if (idUsuario) searchCriteria.idUsuario = idUsuario;
        if (correoUsuario) searchCriteria.correoUsuario = correoUsuario;
        if (tipoUsuario) searchCriteria.tipoUsuario = tipoUsuario;

        const usuarios = await Usuario.findAll({ where: searchCriteria });

        if (usuarios.length > 0) {
            // Registrar búsqueda exitosa
            await registrarLog(req, `Usuarios encontrados por criterios: ${JSON.stringify(searchCriteria)}`, 'info');
            res.json(usuarios);
        } else {
            // Registrar búsqueda sin resultados
            await registrarLog(req, `No se encontraron usuarios con los criterios: ${JSON.stringify(searchCriteria)}`, 'warn');
            res.status(404).json({ message: 'No se encontraron usuarios con los criterios proporcionados' });
        }
    } catch (error) {
        await registrarLog(req, `Error al buscar usuarios: ${error.message}`, 'error');
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
            // Registrar intento de login fallido
            await registrarLog(req, 'Intento de inicio de sesión fallido - Usuario no encontrado');
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(contrasenaUsuario, usuario.contrasenaUsuario);

        if (!isMatch) {
            // Registrar intento de login fallido
            await registrarLog(req, 'Intento de inicio de sesión fallido - Contraseña incorrecta');
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const payload = { id: usuario.idUsuario, tipo: usuario.tipoUsuario };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Registrar inicio de sesión exitoso
        await registrarLog(req, 'Inicio de sesión exitoso');

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.logoutUsuario = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (token) {
            // Suponiendo que la función blacklistToken marca el token como inválido o lo guarda en una lista negra
            blacklistToken(token);

            // Extraer el ID de usuario del token para registrar el logout
            const decoded = jwt.decode(token);
            const usuario = decoded ? decoded.id : 'desconocido';

            // Registrar cierre de sesión
            await registrarLog(req, `Cierre de sesión del usuario ${usuario}`);

            res.json({ message: 'Sesión cerrada correctamente' });
        } else {
            res.status(400).json({ message: 'Token no proporcionado' });
        }
    } catch (error) {
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