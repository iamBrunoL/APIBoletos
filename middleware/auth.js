// middleware/auth.js

const jwt = require('jsonwebtoken');
const { isTokenBlacklisted } = require('./blacklist'); // Asegúrate de importar la función

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');

    if (!token) {
        return res.status(401).json({ message: 'Acceso denegado' });
    }

    try {
        const tokenWithoutBearer = token.replace('Bearer ', '');

        if (isTokenBlacklisted(tokenWithoutBearer)) {
            return res.status(403).json({ message: 'Token revocado' });
        }

        const verified = jwt.verify(tokenWithoutBearer, process.env.JWT_SECRET);
        req.usuario = verified;
        next();
    } catch (error) {
        res.status(400).json({ message: 'Token inválido' });
    }
};

module.exports = verifyToken;
