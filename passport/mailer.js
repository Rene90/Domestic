const nodemailer = require("nodemailer")
const transport = nodemailer.createTransport({

  service:"outlook",
  auth:{
    user:"domestic-online@outlook.com",
    pass:"Domestic1"
  }
})
function welcomeMail(email, message){
  transport.sendMail({
    to:email,
    subject: "Solicitud de servicio",
    from:"domestic-online@outlook.com",
    html: `
        <h1>Domestic Online</h1>
       <p>${message}</p>
       <a href="http://localhost:3000/">Ve al sitio de tu perfil para ver mas detalles</a>
       
       
       
       `
  })
  .then(res=>{
    console.log(res)
  }).catch(e=>{
    console.log(e)
  })
}
module.exports = {welcomeMail}