// middleware/web.js
const admin = require("firebase-admin");
//const { token } = require("morgan");

const verifyToken = async (req, res, next) => {
    const token = req.cookies.token;
    req.session = { user: null }
    try{

        const decodedToken  = await  admin.auth().verifyIdToken(token);
      
         // Comprobar si el usuario tiene el rol de admin
         if (decodedToken.admin) {
           

            req.user = decodedToken; // Puedes adjuntar la información del usuario a `req` para usarla en las rutas
          
            next();
        } else {
            return res.status(403).json({ message: 'Acceso denegado. Se requiere rol de administrador' });
        }
      
    }catch(error){
        console.error("Error al verificar token:", error);
        return res.status(403).json({ message: "Token inválido" });

    }


};

module.exports = verifyToken;
