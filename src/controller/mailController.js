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
exports.notificarTicket= async(req,res, data)=>{
   const {  email,  name } = data;

   if (!email) {
      
      return res.status(400).json({ error: 'No se ha definido un destinatario para el correo.' });
   }

   try {

      // Configuración del correo
      const mailOptions = {
         to: email,
         subject: `Ticket Rechazado`,
         html: `
            
           <html>

<head>
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
   <title>Mailto</title>
   <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700" rel="stylesheet">
   <style type="text/css">
      html {
         -webkit-text-size-adjust: none;
         -ms-text-size-adjust: none;
      }

      @media only screen and (min-device-width: 750px) {
         .table750 {
            width: 750px !important;
         }
      }

      @media only screen and (max-device-width: 750px),
      only screen and (max-width: 750px) {
         table[class="table750"] {
            width: 100% !important;
         }

         .mob_b {
            width: 93% !important;
            max-width: 93% !important;
            min-width: 93% !important;
         }

         .mob_b1 {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
         }

         .mob_left {
            text-align: left !important;
         }

         .mob_soc {
            width: 50% !important;
            max-width: 50% !important;
            min-width: 50% !important;
         }

         .mob_menu {
            width: 50% !important;
            max-width: 50% !important;
            min-width: 50% !important;
            box-shadow: inset -1px -1px 0 0 rgba(255, 255, 255, 0.2);
         }

         .mob_center {
            text-align: center !important;
         }

         .top_pad {
            height: 15px !important;
            max-height: 15px !important;
            min-height: 15px !important;
         }

         .mob_pad {
            width: 15px !important;
            max-width: 15px !important;
            min-width: 15px !important;
         }

         .mob_div {
            display: block !important;
         }
      }

      @media only screen and (max-device-width: 550px),
      only screen and (max-width: 550px) {
         .mod_div {
            display: block !important;
         }
      }

      .table750 {
         width: 750px;
      }
   </style>
</head>

<body style="margin: 0; padding: 0;">

   <table cellpadding="0" cellspacing="0" border="0" width="100%"
      style="background: #f3f3f3; min-width: 350px; font-size: 1px; line-height: normal;">
      <tr>
         <td align="center" valign="top">
            <table cellpadding="0" cellspacing="0" border="0" width="750" class="table750"
               style="width: 100%; max-width: 750px; min-width: 350px; background: #f3f3f3;">
               <tr>
                  <td class="mob_pad" width="25" style="width: 25px; max-width: 25px; min-width: 25px;">&nbsp;</td>
                  <td align="center" valign="top" style="background: #ffffff;">

                     <table cellpadding="0" cellspacing="0" border="0" width="100%"
                        style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f3f3f3;">
                        <tr>
                           <td align="right" valign="top">
                              <div class="top_pad" style="height: 25px; line-height: 25px; font-size: 23px;">&nbsp;
                              </div>
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="88%"
                        style="width: 88% !important; min-width: 88%; max-width: 88%;">
                        <tr>
                           <td align="left" valign="top">
                              <div style="height: 39px; line-height: 39px; font-size: 37px;">&nbsp;</div>
                              <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                 style="font-size: 52px; line-height: 60px; font-weight: 700; letter-spacing: -1.5px; color: #0000FF;">
                                 <span
                                    style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; font-size: 52px; line-height: 60px; font-weight: 700; color: #867be7; letter-spacing: -1.5px;">
                                    OFIU
                                 </span>
                              </font>
                              <div style="height: 73px; line-height: 73px; font-size: 71px;">&nbsp;</div>
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="88%"
                        style="width: 88% !important; min-width: 88%; max-width: 88%;">
                        <tr>
                           <td align="left" valign="top">
                              <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                 style="font-size: 52px; line-height: 60px; font-weight: 300; letter-spacing: -1.5px;">
                                 <span
                                    style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 52px; line-height: 60px; font-weight: 300; letter-spacing: -1.5px;">Hey
                                    ${name} ,</span>
                              </font>
                              <div style="height: 33px; line-height: 33px; font-size: 31px;">&nbsp;</div>
                              <div style="height: 20px; line-height: 20px; font-size: 18px;">&nbsp;</div>
                              <font face="'Source Sans Pro', sans-serif" color="#585858"
                                 style="font-size: 24px; line-height: 32px;">
                                 <span
                                    style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #585858; font-size: 24px; line-height: 32px;"> 
                                    Tu ticket ha sido finalizado inmediatamente por el motivo de:  <br/>
                                    Contenido inadecuado

                                 </span>
                              </font>
                              
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="90%"
                        style="width: 90% !important; min-width: 90%; max-width: 90%; border-width: 1px; border-style: solid; border-color: #e8e8e8; border-bottom: none; border-left: none; border-right: none;">
                        <tr>
                           <td align="left" valign="top">
                              <div style="height: 15px; line-height: 15px; font-size: 13px;">&nbsp;</div>
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="88%"
                        style="width: 88% !important; min-width: 88%; max-width: 88%;">
                        <tr>
                           <td align="center" valign="top">

                              <div class="mob_div"
                                 style="display: inline-block; vertical-align: top; width: 62%; min-width: 260px;">
                                 <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                    style="width: 100% !important; min-width: 100%; max-width: 100%;">
                                    <tr>
                                       <td width="18" style="width: 18px; max-width: 18px; min-width: 18px;">&nbsp;</td>
                                       <td class="mob_center" align="left" valign="top">
                                          <div style="height: 13px; line-height: 13px; font-size: 11px;">&nbsp;</div>

                                          <div style="height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</div>
                                          <font face="'Source Sans Pro', sans-serif" color="#7f7f7f"
                                             style="font-size: 19px; line-height: 23px;">
                                             <span
                                                style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #7f7f7f; font-size: 19px; line-height: 23px;">Para apelar esta decision por favor contacta con soporte</span>
                                          </font>
                                       </td>
                                       <td width="18" style="width: 18px; max-width: 18px; min-width: 18px;">&nbsp;</td>
                                    </tr>
                                 </table>
                              </div>

                              <div style="height: 30px; line-height: 30px; font-size: 28px;">&nbsp;</div>
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="100%"
                        style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f3f3f3;">
                        <tr>
                           <td align="center" valign="top">
                              <div style="height: 34px; line-height: 34px; font-size: 32px;">&nbsp;</div>
                              <table cellpadding="0" cellspacing="0" border="0" width="88%"
                                 style="width: 88% !important; min-width: 88%; max-width: 88%;">
                                 <tr>
                                    <td align="center" valign="top">
                                       <table cellpadding="0" cellspacing="0" border="0" width="78%"
                                          style="min-width: 300px;">
                                          <tr>
                                             <td align="center" valign="top" width="23%">
                                                <a href="" target="_blank"
                                                   style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
                                                   <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                                      style="font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
                                                      <span
                                                         style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">CENTRO
                                                         DE &nbsp;AYUDA</span>
                                                   </font>
                                                </a>
                                             </td>
                                             <td align="center" valign="top" width="10%">
                                                <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                                   style="font-size: 17px; line-height: 17px; font-weight: bold;">
                                                   <span
                                                      style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 17px; font-weight: bold;">&bull;</span>
                                                </font>
                                             </td>
                                             <td align="center" valign="top" width="23%">
                                                <a href="#" target="_blank"
                                                   style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
                                                   <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                                      style="font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
                                                      <span
                                                         style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">SOPORTE&nbsp;24/7</span>
                                                   </font>
                                                </a>
                                             </td>

                                          </tr>
                                       </table>
                                       <div style="height: 34px; line-height: 34px; font-size: 32px;">&nbsp;</div>
                                       <font face="'Source Sans Pro', sans-serif" color="#868686"
                                          style="font-size: 17px; line-height: 20px;">
                                          <span
                                             style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #868686; font-size: 17px; line-height: 20px;">Copyright
                                             &copy; 2024 Ofiu. All&nbsp;Rights&nbsp;Reserved.
                                             Nosotros&nbsp;te&nbsp;apreciamos!</span>
                                       </font>
                                       <div style="height: 3px; line-height: 3px; font-size: 1px;">&nbsp;</div>
                                       <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                          style="font-size: 17px; line-height: 20px;">
                                          <span
                                             style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 20px;"><a
                                                href="#" target="_blank"
                                                style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 20px; text-decoration: none;">oficialofiu@gmail.com</a>
                                             &nbsp;&nbsp;|&nbsp;&nbsp; <a href="#" target="_blank"
                                                style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 20px; text-decoration: none;"></a>
                                             &nbsp;&nbsp;&nbsp;&nbsp;</span>
                                       </font>
                                       <div style="height: 35px; line-height: 35px; font-size: 33px;">&nbsp;</div>
                                       
                                    </td>
                                 </tr>
                              </table>
                           </td>
                        </tr>
                     </table>

                  </td>
                  <td class="mob_pad" width="25" style="width: 25px; max-width: 25px; min-width: 25px;">&nbsp;</td>
               </tr>
            </table>
          
         </td>
      </tr>
   </table>
</body>

</html> 


            `
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

      return res.status(200);
   } catch (error) {
      console.error('Error al cambiar el estado del usuario:', error);
      return res.status(500).json({ error: 'Error al cambiar el estado del usuario' });
   }

}



// Controlador para enviar correo de habilitar/inhabilitar usuarios
exports.toggleUserStatus = async (req, res) => {

   const { uid, action, email, motivo, name } = req.body;
      // Verificar si se ha proporcionado un email
   if (!email) {
      
      return res.status(400).json({ error: 'No se ha definido un destinatario para el correo.' });
   }

   
   try {

      // Habilitar o inhabilitar el usuario según la acción
      if (action === 'enable') {
         await auth.updateUser(uid, { disabled: false });
      } else {
         await auth.updateUser(uid, { disabled: true });
      }
      // Configuración del correo
      const mailOptions = {
         to: email,
         subject: `Usuario ${action === 'enable' ? 'habilitado' : 'inhabilitado'}`,
         html: `
            
           <html>

<head>
   <meta http-equiv="Content-Type" content="text/html; charset=utf-8">
   <title>Mailto</title>
   <link href="https://fonts.googleapis.com/css?family=Source+Sans+Pro:300,400,600,700" rel="stylesheet">
   <style type="text/css">
      html {
         -webkit-text-size-adjust: none;
         -ms-text-size-adjust: none;
      }

      @media only screen and (min-device-width: 750px) {
         .table750 {
            width: 750px !important;
         }
      }

      @media only screen and (max-device-width: 750px),
      only screen and (max-width: 750px) {
         table[class="table750"] {
            width: 100% !important;
         }

         .mob_b {
            width: 93% !important;
            max-width: 93% !important;
            min-width: 93% !important;
         }

         .mob_b1 {
            width: 100% !important;
            max-width: 100% !important;
            min-width: 100% !important;
         }

         .mob_left {
            text-align: left !important;
         }

         .mob_soc {
            width: 50% !important;
            max-width: 50% !important;
            min-width: 50% !important;
         }

         .mob_menu {
            width: 50% !important;
            max-width: 50% !important;
            min-width: 50% !important;
            box-shadow: inset -1px -1px 0 0 rgba(255, 255, 255, 0.2);
         }

         .mob_center {
            text-align: center !important;
         }

         .top_pad {
            height: 15px !important;
            max-height: 15px !important;
            min-height: 15px !important;
         }

         .mob_pad {
            width: 15px !important;
            max-width: 15px !important;
            min-width: 15px !important;
         }

         .mob_div {
            display: block !important;
         }
      }

      @media only screen and (max-device-width: 550px),
      only screen and (max-width: 550px) {
         .mod_div {
            display: block !important;
         }
      }

      .table750 {
         width: 750px;
      }
   </style>
</head>

<body style="margin: 0; padding: 0;">

   <table cellpadding="0" cellspacing="0" border="0" width="100%"
      style="background: #f3f3f3; min-width: 350px; font-size: 1px; line-height: normal;">
      <tr>
         <td align="center" valign="top">
            <table cellpadding="0" cellspacing="0" border="0" width="750" class="table750"
               style="width: 100%; max-width: 750px; min-width: 350px; background: #f3f3f3;">
               <tr>
                  <td class="mob_pad" width="25" style="width: 25px; max-width: 25px; min-width: 25px;">&nbsp;</td>
                  <td align="center" valign="top" style="background: #ffffff;">

                     <table cellpadding="0" cellspacing="0" border="0" width="100%"
                        style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f3f3f3;">
                        <tr>
                           <td align="right" valign="top">
                              <div class="top_pad" style="height: 25px; line-height: 25px; font-size: 23px;">&nbsp;
                              </div>
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="88%"
                        style="width: 88% !important; min-width: 88%; max-width: 88%;">
                        <tr>
                           <td align="left" valign="top">
                              <div style="height: 39px; line-height: 39px; font-size: 37px;">&nbsp;</div>
                              <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                 style="font-size: 52px; line-height: 60px; font-weight: 700; letter-spacing: -1.5px; color: #0000FF;">
                                 <span
                                    style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; font-size: 52px; line-height: 60px; font-weight: 700; color: #867be7; letter-spacing: -1.5px;">
                                    OFIU
                                 </span>
                              </font>
                              <div style="height: 73px; line-height: 73px; font-size: 71px;">&nbsp;</div>
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="88%"
                        style="width: 88% !important; min-width: 88%; max-width: 88%;">
                        <tr>
                           <td align="left" valign="top">
                              <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                 style="font-size: 52px; line-height: 60px; font-weight: 300; letter-spacing: -1.5px;">
                                 <span
                                    style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 52px; line-height: 60px; font-weight: 300; letter-spacing: -1.5px;">Hey
                                    ${name} ,</span>
                              </font>
                              <div style="height: 33px; line-height: 33px; font-size: 31px;">&nbsp;</div>
                              <div style="height: 20px; line-height: 20px; font-size: 18px;">&nbsp;</div>
                              <font face="'Source Sans Pro', sans-serif" color="#585858"
                                 style="font-size: 24px; line-height: 32px;">
                                 <span
                                    style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #585858; font-size: 24px; line-height: 32px;"> 
                                    Tu cuenta ha sido ${action === 'enable' ? 'habilitado' : 'inhabilitado'}  por el siguiente motivo:  <br/>
                                    ${motivo}

                                 </span>
                              </font>
                              
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="90%"
                        style="width: 90% !important; min-width: 90%; max-width: 90%; border-width: 1px; border-style: solid; border-color: #e8e8e8; border-bottom: none; border-left: none; border-right: none;">
                        <tr>
                           <td align="left" valign="top">
                              <div style="height: 15px; line-height: 15px; font-size: 13px;">&nbsp;</div>
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="88%"
                        style="width: 88% !important; min-width: 88%; max-width: 88%;">
                        <tr>
                           <td align="center" valign="top">

                              <div class="mob_div"
                                 style="display: inline-block; vertical-align: top; width: 62%; min-width: 260px;">
                                 <table cellpadding="0" cellspacing="0" border="0" width="100%"
                                    style="width: 100% !important; min-width: 100%; max-width: 100%;">
                                    <tr>
                                       <td width="18" style="width: 18px; max-width: 18px; min-width: 18px;">&nbsp;</td>
                                       <td class="mob_center" align="left" valign="top">
                                          <div style="height: 13px; line-height: 13px; font-size: 11px;">&nbsp;</div>

                                          <div style="height: 1px; line-height: 1px; font-size: 1px;">&nbsp;</div>
                                          <font face="'Source Sans Pro', sans-serif" color="#7f7f7f"
                                             style="font-size: 19px; line-height: 23px;">
                                             <span
                                                style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #7f7f7f; font-size: 19px; line-height: 23px;">Para apelar esta decision por favor contacta con soporte</span>
                                          </font>
                                       </td>
                                       <td width="18" style="width: 18px; max-width: 18px; min-width: 18px;">&nbsp;</td>
                                    </tr>
                                 </table>
                              </div>

                              <div style="height: 30px; line-height: 30px; font-size: 28px;">&nbsp;</div>
                           </td>
                        </tr>
                     </table>

                     <table cellpadding="0" cellspacing="0" border="0" width="100%"
                        style="width: 100% !important; min-width: 100%; max-width: 100%; background: #f3f3f3;">
                        <tr>
                           <td align="center" valign="top">
                              <div style="height: 34px; line-height: 34px; font-size: 32px;">&nbsp;</div>
                              <table cellpadding="0" cellspacing="0" border="0" width="88%"
                                 style="width: 88% !important; min-width: 88%; max-width: 88%;">
                                 <tr>
                                    <td align="center" valign="top">
                                       <table cellpadding="0" cellspacing="0" border="0" width="78%"
                                          style="min-width: 300px;">
                                          <tr>
                                             <td align="center" valign="top" width="23%">
                                                <a href="" target="_blank"
                                                   style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
                                                   <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                                      style="font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
                                                      <span
                                                         style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">CENTRO
                                                         DE &nbsp;AYUDA</span>
                                                   </font>
                                                </a>
                                             </td>
                                             <td align="center" valign="top" width="10%">
                                                <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                                   style="font-size: 17px; line-height: 17px; font-weight: bold;">
                                                   <span
                                                      style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 17px; font-weight: bold;">&bull;</span>
                                                </font>
                                             </td>
                                             <td align="center" valign="top" width="23%">
                                                <a href="#" target="_blank"
                                                   style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
                                                   <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                                      style="font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">
                                                      <span
                                                         style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 14px; line-height: 20px; text-decoration: none; white-space: nowrap; font-weight: bold;">SOPORTE&nbsp;24/7</span>
                                                   </font>
                                                </a>
                                             </td>

                                          </tr>
                                       </table>
                                       <div style="height: 34px; line-height: 34px; font-size: 32px;">&nbsp;</div>
                                       <font face="'Source Sans Pro', sans-serif" color="#868686"
                                          style="font-size: 17px; line-height: 20px;">
                                          <span
                                             style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #868686; font-size: 17px; line-height: 20px;">Copyright
                                             &copy; 2024 Ofiu. All&nbsp;Rights&nbsp;Reserved.
                                             Nosotros&nbsp;te&nbsp;apreciamos!</span>
                                       </font>
                                       <div style="height: 3px; line-height: 3px; font-size: 1px;">&nbsp;</div>
                                       <font face="'Source Sans Pro', sans-serif" color="#1a1a1a"
                                          style="font-size: 17px; line-height: 20px;">
                                          <span
                                             style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 20px;"><a
                                                href="#" target="_blank"
                                                style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 20px; text-decoration: none;">oficialofiu@gmail.com</a>
                                             &nbsp;&nbsp;|&nbsp;&nbsp; <a href="#" target="_blank"
                                                style="font-family: 'Source Sans Pro', Arial, Tahoma, Geneva, sans-serif; color: #1a1a1a; font-size: 17px; line-height: 20px; text-decoration: none;"></a>
                                             &nbsp;&nbsp;&nbsp;&nbsp;</span>
                                       </font>
                                       <div style="height: 35px; line-height: 35px; font-size: 33px;">&nbsp;</div>
                                       
                                    </td>
                                 </tr>
                              </table>
                           </td>
                        </tr>
                     </table>

                  </td>
                  <td class="mob_pad" width="25" style="width: 25px; max-width: 25px; min-width: 25px;">&nbsp;</td>
               </tr>
            </table>
          
         </td>
      </tr>
   </table>
</body>

</html> 


            `
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


async function validarcorreo(correo){
   try {
      // Realiza una consulta en la colección "users" donde el campo "email" sea igual al correo proporcionado
      const usersRef = db.collection('users');
      const snapshot = await usersRef.where('email', '==', correo).get();

      // Si hay al menos un documento, el correo existe
      if (!snapshot.empty) {
          return true; // El correo existe
      } else {
          return false; // El correo no existe
      }
  } catch (error) {
      console.error("Error al validar el correo:", error);
      throw error; // Lanza el error para manejarlo en una capa superior
  }
}
// Función para enviar el reporte
exports.sendReport = async (req, res) => {
   const { reporterEmail, reportedUser, reportDescription } = req.body;
   
   if(validarcorreo(reporterEmail)){
      const errorMessage = "Correo no valido";
      return res.redirect(`/reports/?message=${encodeURIComponent(errorMessage)}`);
   }

   // Configura el contenido del correo
   let mailOptions = {
      from: "oficialofiu@gmail.com",
      to: "oficialofiu@gmail.com", // Cambia a tu dirección de correo
      subject: "Nuevo Reporte de Usuario",
      text: `Detalles del reporte:
Correo del reportante: ${reporterEmail}
Usuario reportado: ${reportedUser}
Descripción: ${reportDescription}`,
   };

  

   // Enviar el correo
   // Enviar el correo
   try {
      await transporter.sendMail(mailOptions);
      
      const errorMessage = "Reporte enviado correctamente.";
      return res.redirect(`/reports/?message=${encodeURIComponent(errorMessage)}`);
   } catch (error) {
      const errorMessage = "Error al enviar el reporte.";
      return res.redirect(`/reports/?message=${encodeURIComponent(errorMessage)}`);
   }
};


// Función para enviar el reporte
exports.sendSupport = async (req, res) => {
   const { supportEmail, supportUser, supportDescription } = req.body;
   if(validarcorreo(reporterEmail)){
      const errorMessage = "Correo no valido";
      return res.redirect(`/reports/?message=${encodeURIComponent(errorMessage)}`);
   }
   // Configura el contenido del correo
   let mailOptions = {
      from: "oficialofiu@gmail.com",
      to: "oficialofiu@gmail.com", // Cambia a tu dirección de correo
      subject: "Nuevo soporte de Usuario",
      text: `Detalles del soporte:
Correo del usuario: ${supportEmail}
Usuario : ${supportUser}
Descripción: ${supportDescription}`,
   };

  

   // Enviar el correo
   try {
      await transporter.sendMail(mailOptions);
      
      const errorMessage = "Soporte enviado correctamente.";
      return res.redirect(`/support/?message=${encodeURIComponent(errorMessage)}`);
   } catch (error) {
      const errorMessage = "Error al enviar el soporte.";
      return res.redirect(`/support/?message=${encodeURIComponent(errorMessage)}`);
   }
};


// Función para enviar el reporte
exports.sendUnsubscribe = async (req, res) => {
   const { unsubscribeName, unsubscribeEmail, unsubscribeDescription } = req.body;
   if(validarcorreo(reporterEmail)){
      const errorMessage = "Correo no valido";
      return res.redirect(`/reports/?message=${encodeURIComponent(errorMessage)}`);
   }
   // Configura el contenido del correo
   let mailOptions = {
      from: "oficialofiu@gmail.com",
      to: "oficialofiu@gmail.com", // Cambia a tu dirección de correo
      subject: "Nueva solicitud de eliminacion de cuenta ",
      text: `Detalles de la solicitud:
Nombre usuario: ${unsubscribeName}
Correo del usuario : ${unsubscribeEmail}
Descripción: ${unsubscribeDescription}`,
   };

  

   // Enviar el correo
   try {
      await transporter.sendMail(mailOptions);
      
      const errorMessage = "Soporte enviado correctamente.";
      return res.redirect(`/support/?message=${encodeURIComponent(errorMessage)}`);
   } catch (error) {
      const errorMessage = "Error al enviar el soporte.";
      return res.redirect(`/support/?message=${encodeURIComponent(errorMessage)}`);
   }
};
