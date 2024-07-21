const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { blacklistToken } = require('../middleware/blacklist');

// Crear un nuevo usuario
exports.createUsuario = async (req, res) => {
    try {
        // Encriptar la contraseña
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.contrasenaUsuario, salt);

        // Crear el usuario con la contraseña encriptada
        const usuario = await Usuario.create({
            ...req.body,
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
        const [updated] = await Usuario.update(req.body, { where: { idUsuario: req.params.id } });
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

        const payload = { id: usuario.idUsuario, tipo: usuario.tipoUsuario }; // Asegúrate de que 'tipo' esté presente
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
// Cerrar sesión
exports.logoutUsuario = (req, res) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'No se proporcionó token' });
    }

    try {
        const tokenWithoutBearer = token.replace('Bearer ', '');
        // Agregar el token a la lista negra
        blacklistToken(tokenWithoutBearer);

        res.json({ message: 'Sesión cerrada exitosamente' });
    } catch (error) {
        res.status(500).json({ message: 'Error al cerrar sesión', error: error.message });
    }
};
