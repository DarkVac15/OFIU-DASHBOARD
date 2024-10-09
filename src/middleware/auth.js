
const { db, auth } = require("../config/firebase");
const authMiddleware = async (req, res, next) => {
try {
  // Capturar el token del cuerpo o del encabezado Authorization
  const idToken = req.body.token || req.headers.authorization.split(' ')[1];

  if (!idToken) {
    console.log('1')
      return res.status(401).json({ message: 'No se proporcionó un token' });
  }

  // Verificar el token con Firebase Admin
  console.log('1')
  const decodedToken = await auth.verifyIdToken(idToken);
  console.log('Token verificado:', decodedToken);

  // Si el token es válido, redirigir al dashboard o realizar otra acción
  res.status(200).json({ message: 'Token verificado, login exitoso', user: decodedToken });
} catch (error) {
  console.error('Error al verificar el token:', error);
  res.status(401).json({ message: 'Token inválido o expirado' });
}    
};

module.exports = authMiddleware;