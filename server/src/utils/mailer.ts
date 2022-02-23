const nodemailer = require("nodemailer");
const config = require("./config.json");

let transporter = nodemailer.createTransport(config.smtpOptions);

// let mailOptions = {
//   from: "contact.mastermine@gmail.com",
//   to: "preahugo@gmail.com", //userToSave.email,
//   subject: "Hello ✔", // Subject line
//   text: "Hello world?", // plain text body
//   html: `<div><a>pppppp</a></div>`, // html body
// };

module.exports = {
  sendEmail(from, to, subject, html) {
    return new Promise((resolve, reject) => {
      transporter.sendMail({ from, to, subject, html }, (err, info) => {
        if (err) reject(err);

        resolve(info);
      });
    });
  },
};
