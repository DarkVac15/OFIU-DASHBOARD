const nodemailer = require('nodemailer');
const { db, auth } = require("../config/firebase");

// Configuración del transportador de Nodemailer
const transporter = nodemailer.createTransport({
    service: 'Gmail', // Cambia esto por el servicio que prefieras
    auth: {
        user: 'oficialofiu@gmail.com', // Tu dirección de correo
        pass: 'jllw tvzq gkcy cxcc' // Tu contraseña
    }
});

// Controlador para habilitar/inhabilitar usuarios
exports.toggleUserStatus = async (req, res) => {
    const { uid, action, email } = req.body;
console.log(req.body)
    // Verificar si se ha proporcionado un email
  if (!email) {
       console.log('Error: No se ha definido un destinatario.');
       return res.status(400).json({ error: 'No se ha definido un destinatario para el correo.' });
    }

    try {
        // Aquí agregas la lógica para habilitar o inhabilitar al usuario en tu base de datos
      //  await auth.updateUserStatus(uid, action); // Lógica para actualizar el estado del usuario
        
            // Habilitar o inhabilitar el usuario según la acción
            if (action === 'enable') {
                await auth.updateUser(uid, { disabled: false });
                // Envía correo aquí
            } else {
                await auth.updateUser(uid, { disabled: true });
                // Envía correo aquí
            }
        
        
        // Configuración del correo
        const mailOptions = {
            from: 'oficialofiu@gmail.com',
            to: email,
            subject: action === 'enable' ? 'Cuenta Habilitada' : 'Cuenta Inhabilitada',
            text: `Tu cuenta ha sido ${action === 'enable' ? 'habilitada' : 'inhabilitada'}.`
        };

        // Enviar el correo
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.log('Error al enviar el correo:', error);
                return res.status(500).json({ error: 'Error al enviar el correo' });
            } else {
                console.log('Correo enviado:', info.response);
            }
        });

        return res.status(200).json({ message: `Usuario ${uid} ha sido ${action === 'enable' ? 'habilitado' : 'inhabilitado'} con éxito` });
    } catch (error) {
        console.error('Error al cambiar el estado del usuario:', error);
        return res.status(500).json({ error: 'Error al cambiar el estado del usuario' });
    }
};
