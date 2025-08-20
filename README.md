# 🛠️ OFIU - Plataforma de Servicios Locales  

[![Node.js](https://img.shields.io/badge/Node.js-18.x-green?logo=node.js)](https://nodejs.org/)  
[![Express](https://img.shields.io/badge/Express.js-Backend-lightgrey?logo=express)](https://expressjs.com/)  
[![Firebase](https://img.shields.io/badge/Firebase-Firestore-orange?logo=firebase)](https://firebase.google.com/)  
[![Kotlin](https://img.shields.io/badge/Kotlin-Mobile-blueviolet?logo=kotlin)](https://kotlinlang.org/)  
[![AWS](https://img.shields.io/badge/AWS-EC2-yellow?logo=amazonaws)](https://aws.amazon.com/)  
[![Nginx](https://img.shields.io/badge/Nginx-Reverse%20Proxy-brightgreen?logo=nginx)](https://www.nginx.com/)  
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)  

---

## 🌟 Branding  
**OFIU** es una plataforma que conecta a **usuarios** con **profesionales y trabajadores autónomos**, ofreciendo servicios confiables y accesibles en su comunidad.  

- 💡 **Misión**: Facilitar el acceso a servicios cotidianos y especializados a través de una plataforma digital confiable y cercana.  
- 🎯 **Visión**: Ser la aplicación líder en la contratación de servicios locales en Colombia, iniciando en **El Espinal, Tolima**, y expandiéndose a más ciudades.  
- 🤝 **Valores**:  
  - Confianza  
  - Accesibilidad  
  - Innovación  
  - Comunidad  

---

## ⚙️ Stack Tecnológico  

### 🔹 Backend  
- **Node.js + Express**  
- **Firebase (Firestore, Authentication, Storage)**  
- **PM2** para orquestación de procesos  

### 🔹 Frontend  
- **Handlebars (HBS)** como motor de plantillas  
- **Bootstrap 5.3.3** para UI y notificaciones  
- **Chart.js (CDN)** para visualización de datos  

### 🔹 Mobile  
- **Kotlin (Android App)**  
- Conexión directa con Firebase y APIs de OFIU  

---

## 📊 Dashboard OFIU  

El **Dashboard Web** es la herramienta de gestión y analítica de OFIU, diseñada para que administradores puedan **visualizar el estado de la plataforma en tiempo real**.  

### 🔎 Funcionalidades principales  
- 👥 **Gestión de usuarios**  
  - Listado de clientes y profesionales  
  - Inhabilitación de cuentas con inconsistencias  
  - Exclusión automática de usuarios con rol **admin**  

- 🎟️ **Gestión de tickets**  
  - Control de solicitudes de servicio  
  - Estados: *pendiente, en proceso, completado, cancelado*  

- 📈 **Reportes y analítica**  
  - **Barras** → Tickets por estado / Usuarios por ciudad  
  - **Pastel** → Propuestas aceptadas vs rechazadas  
  - **Líneas de tendencia** → Registros de usuarios y tickets en el tiempo  
  - **Categorías más solicitadas** → análisis de `tags`  

- 📄 **Exportación a PDF**  
  - Reportes descargables desde el dashboard  

---

## ☁️ Infraestructura  

- **AWS EC2**: Servidor principal con Ubuntu  
- **Nginx**: Proxy reverso y balanceo  
- **PM2**: Manejo de procesos en segundo plano  
- **Certificados SSL**: Seguridad y cifrado en producción  
- **Hostinger (DNS)**: Configuración de dominio personalizado  
  - `www.ofiu.online` ✅  
  - `ofiu.online` (configuración adicional pendiente)  

---

