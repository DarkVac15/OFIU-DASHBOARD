const cookieParser = require("cookie-parser");
const { db, auth } = require("../config/firebase");
const express = require('express');
const router = express.Router();

router.get('/', async (req, res) => {
    const excludedUID = req.user.uid; // UID del usuario que deseas omitir
    //  console.log(excludedUID);
    const usersList = [];

    const listAllUsers = async (nextPageToken) => {
        const listUsersResult = await auth.listUsers(1000, nextPageToken);
        listUsersResult.users.forEach((userRecord) => {
            usersList.push(userRecord.toJSON());
        });

        if (listUsersResult.pageToken) {
            await listAllUsers(listUsersResult.pageToken);
        }
    };

    try {
        await listAllUsers();

        // Filtrar para excluir el usuario con el UID especificado
        const filteredUsers = usersList.filter(user => user.uid !== excludedUID);

        res.render('usermanagement', {
            title: 'Gestión de usuarios',
            usersList: filteredUsers,
            layout: 'main',
            showNavbar: true
        });

    } catch (error) {
        res.status(500).json({ message: 'Error listando usuarios', error });
    }
});

// Ruta para habilitar usuario
router.post('/enable-user', async (req, res) => {
    const { uid } = req.body;

    if (!uid) {
        return res.status(400).json({ message: 'UID es requerido' });
    }

    try {
        // Actualiza el estado del usuario a habilitado
        await auth.updateUser(uid, { disabled: false });
        res.status(200).json({ message: `Usuario con UID: ${uid} ha sido habilitado` });
    } catch (error) {
        console.error('Error al habilitar usuario:', error);
        res.status(500).json({ message: 'Error al habilitar usuario', error });
    }
});




router.post('/disable-user', async (req, res) => {
    const { uid } = req.body; // Se espera que el UID venga en el cuerpo de la solicitud

    if (!uid) {
        return res.status(400).json({ message: 'UID es requerido' });
    }

    try {
        // Actualiza el estado del usuario a inhabilitado
        await auth.updateUser(uid, { disabled: true });
        res.status(200).json({ message: `Usuario con UID: ${uid} ha sido inhabilitado` });

    } catch (error) {

        console.error('Error al inhabilitar usuario:', error);
        res.status(500).json({ message: 'Error al inhabilitar usuario', error });
    }
});

module.exports = router; 