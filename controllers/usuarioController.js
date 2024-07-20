const Usuario = require('../models/Usuario');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const { blacklistToken } = require('../middleware/blacklist');

exports.createUsuario = async (req, res) => {
    try {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.contrasenaUsuario, salt);

        const usuario = await Usuario.create({
            ...req.body,
            contrasenaUsuario: hashedPassword
        });
        res.json(usuario);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.getAllUsuarios = async (req, res) => {
    try {
        const usuarios = await Usuario.findAll();
        res.json(usuarios);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

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

exports.updateUsuario = async (req, res) => {
    try {
        await Usuario.update(req.body, { where: { idUsuario: req.params.id } });
        res.json({ message: 'Usuario actualizado' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.deleteUsuario = async (req, res) => {
    try {
        await Usuario.destroy({ where: { idUsuario: req.params.id } });
        res.json({ message: 'Usuario eliminado' });
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

        console.log('Password from DB:', usuario.contrasenaUsuario);

        const isMatch = await bcrypt.compare(contrasenaUsuario, usuario.contrasenaUsuario);

        console.log('Password Match:', isMatch);

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