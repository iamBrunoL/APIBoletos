const jwt = require('jsonwebtoken');

// Asegúrate de que dotenv esté cargado
require('dotenv').config();

const { JWT_SECRET } = process.env; // Obtén la clave secreta del archivo .env

const checkRole = (roles) => {
    return (req, res, next) => {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: 'Acceso denegado' });
        }

        try {
            const tokenWithoutBearer = token.replace('Bearer ', '');
            const decoded = jwt.verify(tokenWithoutBearer, JWT_SECRET); // Verifica el token usando JWT_SECRET
            const userRole = decoded.tipo;

            console.log('Decoded Role:', userRole); // Verifica el rol decodificado

            if (!roles.includes(userRole)) {
                return res.status(403).json({ message: 'Permiso denegado' });
            }

            req.usuario = decoded; // Añade el payload al request
            next();
        } catch (error) {
            res.status(400).json({ message: 'Token inválido', error: error.message });
        }
    };
};

module.exports = checkRole;
