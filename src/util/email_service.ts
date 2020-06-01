var nodemailer = require('nodemailer')

var transporter = nodemailer.createTransport({
    service: 'smtp.mailtrap.io',
    port: '2525',
    auth: {
      user: '15dcb0e2063157',
      pass: `b65d271f1b5e4d`
    }
  });
  
  export const sendMail = (mail, subject, message) =>{
    let mailOptions = {
        from: 'admin@bcl.lk',
        to: mail,
        subject: subject,
        text: message
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });
  } 

  // async..await is not allowed in global scope, must use a wrapper
async function main(mail, subject, body) {
    // Generate test SMTP service account from ethereal.email
    // Only needed if you don't have a real mail account for testing
    let testAccount = await nodemailer.createTestAccount();
  
    // create reusable transporter object using the default SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });
  
    // send mail with defined transport object
    let info = await transporter.sendMail({
      from: `admin@bcl.lk`, // sender address
      to: `${mail}`, // list of receivers
      subject: subject, // Subject line
      text: body, // plain text body
    });
  
    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
  
    // Preview only available when sending through an Ethereal account
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
}
  

export const sendEmail = (mail, subject, body) => {
    main(mail, subject, body).catch(console.error)
}