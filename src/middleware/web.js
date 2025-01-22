// middleware/web.js
const admin = require("firebase-admin");

const verifyToken = async (req, res, next) => {
  
  const token = req.cookies.token;
  req.session = { user: null };

  if (!token) {
    const errorMessage = "Token no válido. Por favor, inicia sesión.";
    return res.redirect(`/administracion?message=${encodeURIComponent(errorMessage)}`);
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);

    // Comprobar si el usuario tiene el rol de admin
    if (decodedToken.admin) {
      req.user = decodedToken; // Adjunta la información del usuario a `req` para usarla en las rutas
      next();
    } else {
       // return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
        const errorMessage = "Acceso denegado. Se requiere rol de administrador.";
    return res.redirect(`/administracion?message=${encodeURIComponent(errorMessage)}`);
       
    }
  } catch (error) {
   
    const errorMessage = "Token inválido.";
    return res.redirect(`/administracion?message=${encodeURIComponent(errorMessage)}`);
  }
};

module.exports = verifyToken;
