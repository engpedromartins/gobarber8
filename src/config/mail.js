export default {
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  secure: false,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  },
  deafult: {
    from: 'TESTANU <noreply@teste.com>'
  }
}

//TIPOS DE SERVICOS QUE DISPARAM EMAIL
// Amazon ses
// Mailgun
// Sparkpost
// gmail

//só em ambiente de dev

// mailtrap (DEV)
