const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../middleware/blacklist');

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

        res.json(usuarioResponse);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Obtener todos los usuarios
exports.getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
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
            res.json(usuarios);
        } else {
            res.status(404).json({ message: 'No se encontraron usuarios con los criterios proporcionados' });
        }
    } catch (error) {
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
            res.json({ message: 'Usuario actualizado' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Eliminar un usuario
exports.deleteUsuario = async (req, res) => {
    try {
        const { id } = req.params;
        const usuarioAEliminar = await Usuario.findByPk(id);
        
        if (!usuarioAEliminar) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        if (usuarioAEliminar.tipoUsuario === 'admin') {
            const adminCount = await Usuario.count({ where: { tipoUsuario: 'admin' } });
            
            // Verificar si queda al menos un administrador
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'No puedes eliminar el único administrador del sistema.' });
            }
        }

        const deleted = await Usuario.destroy({ where: { idUsuario: id } });
        if (deleted) {
            res.json({ message: 'Usuario eliminado' });
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Iniciar sesión
exports.loginUsuario = async (req, res) => {
    try {
        const { correoUsuario, contrasenaUsuario } = req.body;
        const usuario = await Usuario.findOne({ where: { correoUsuario } });

        if (!usuario) {
            return res.status(404).json({ message: 'Usuario no encontrado' });
        }

        const isMatch = await bcrypt.compare(contrasenaUsuario, usuario.contrasenaUsuario);

        if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña incorrecta' });
        }

        const payload = { id: usuario.idUsuario, tipo: usuario.tipoUsuario };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Cerrar sesión
exports.logoutUsuario = async (req, res) => {
    try {
        const token = req.headers['authorization'];
        if (token) {
            blacklistToken(token);
            res.json({ message: 'Sesión cerrada correctamente' });
        } else {
            res.status(400).json({ message: 'Token no proporcionado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
