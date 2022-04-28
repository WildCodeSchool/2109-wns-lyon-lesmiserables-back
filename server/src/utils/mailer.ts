const nodemailer = require("nodemailer");
const config = require("./config.json");

let transporter = nodemailer.createTransport(config.smtpOptions);

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
