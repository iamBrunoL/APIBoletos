const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../middleware/blacklist');

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    try {
        const { contrasenaUsuario, ...rest } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(contrasenaUsuario, salt);

        const usuario = await Usuario.create({
            ...rest,
            contrasenaUsuario: hashedPassword
        });
        res.json(usuario);
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

// Obtener un usuario por ID
exports.getUsuarioById = async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.params.id);
        if (usuario) {
            res.json(usuario);
        } else {
            res.status(404).json({ message: 'Usuario no encontrado' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Actualizar un usuario
exports.updateUsuario = async (req, res) => {
    try {
        const { contrasenaUsuario, ...rest } = req.body;
        if (contrasenaUsuario) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(contrasenaUsuario, salt);
            rest.contrasenaUsuario = hashedPassword;
        }
        const [updated] = await Usuario.update(rest, { where: { idUsuario: req.params.id } });
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
        const deleted = await Usuario.destroy({ where: { idUsuario: req.params.id } });
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
