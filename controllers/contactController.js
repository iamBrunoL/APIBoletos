const ContactMessage = require('../models/ContactMessage');

exports.createMessage = async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
    }

    try {
        const newMessage = await ContactMessage.create({
            name,
            email,
            message
        });

        res.status(201).json(newMessage);
    } catch (error) {
        console.error('Error al crear el mensaje de contacto:', error);
        res.status(500).json({ error: 'Error al crear el mensaje de contacto.' });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await ContactMessage.findAll();
        res.status(200).json(messages);
    } catch (error) {
        console.error('Error al obtener los mensajes de contacto:', error);
        res.status(500).json({ error: 'Error al obtener los mensajes de contacto.' });
    }
};

exports.getMessageById = async (req, res) => {
    const { id } = req.params;

    try {
        const message = await ContactMessage.findByPk(id);

        if (!message) {
            return res.status(404).json({ error: 'Mensaje no encontrado.' });
        }

        res.status(200).json(message);
    } catch (error) {
        console.error('Error al obtener el mensaje de contacto:', error);
        res.status(500).json({ error: 'Error al obtener el mensaje de contacto.' });
    }
};

exports.deleteMessage = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedMessage = await ContactMessage.destroy({ where: { id } });

        if (!deletedMessage) {
            return res.status(404).json({ error: 'Mensaje no encontrado.' });
        }

        res.status(200).json({ message: 'Mensaje eliminado correctamente.' });
    } catch (error) {
        console.error('Error al eliminar el mensaje de contacto:', error);
        res.status(500).json({ error: 'Error al eliminar el mensaje de contacto.' });
    }
};
