
const { db, auth } = require("../config/firebase");
const express = require('express');
const userController = require('../controller/mailController');
const router = express.Router();

router.get('/', async (req, res) => {
    const excludedUID = "on6T6LHnz7OppfvsAQNPCXT8mGK2"// req.user.uid; // UID del usuario que deseas omitir
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
            showNavbar: true,

            isDashboard: false,
            isUser: true,
            isTags: false
        });

    } catch (error) {
        res.status(500).json({ message: 'Error listando usuarios', error });
    }
});

// Ruta para habilitar usuario

router.post('/toggle-user-status', userController.toggleUserStatus);




module.exports = router; 