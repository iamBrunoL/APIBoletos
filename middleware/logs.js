const uaParser = require('ua-parser-js');
const ipinfo = require('ipinfo');
const Log = require('../models/Log');

async function registrarLog(req, accion) {
    try {
        // Obtener información del usuario
        const agente = uaParser(req.headers['user-agent']);
        const direccionIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        let ubicacion = 'Ubicación desconocida';

        // Obtener ubicación basada en IP
        try {
            const info = await ipinfo(direccionIP);
            ubicacion = `${info.city}, ${info.region}, ${info.country}`;
        } catch (error) {
            console.error('Error obteniendo la ubicación:', error.message);
        }

        // Definir los campos del log
        const logData = {
            usuario: req.usuario?.id || 'Desconocido', // Cambia 'id' por 'correoUsuario' si es necesario
            host: req.headers.host,
            navegador: `${agente.browser.name || 'Desconocido'} ${agente.browser.version || 'Desconocido'}`,
            sistemaOperativo: `${agente.os.name || 'Desconocido'} ${agente.os.version || 'Desconocido'}`,
            tipoDispositivo: agente.device.type || 'Desconocido',
            direccionIP: direccionIP,
            ubicacion: ubicacion,
        };

        // Registrar el log
        await Log.create({ 
            ...logData,
            accion: accion, 
            fechaHora: new Date()
        });
    } catch (error) {
        console.error('Error registrando el log:', error.message);
    }
}

module.exports = registrarLog;
