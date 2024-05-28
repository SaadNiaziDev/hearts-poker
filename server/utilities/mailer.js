const nodemailer = require("nodemailer");
const smtpAuth = require("../config").smtpAuth;

let { emailVerifyTemplate, forgetPasswordTemplate } = require("./emailTemplates");

const setTransporter = () => {
	return nodemailer.createTransport({
		host: "smtp.gmail.com",
		port: 465,
		secure: true,
		auth: smtpAuth,
	});
};

const selectTemplate = (user, body, template) => {
	if (body.verifyEmail) template = emailVerifyTemplate(user);
	else if (body.forgetPassword) template = forgetPasswordTemplate(user);
	return template;
};

const setMessage = (user, subject, template) => {
	return {
		to: user.email,
		from: "Hearts Poker<support@heartspoker.com>",
		subject,
		html: template,
	};
};

const sendEmail = (user, subject, body) => {
	const transporter = setTransporter();

	let template = "";
	template = selectTemplate(user, body, template);
	const msg = setMessage(user, subject, template);

	transporter.sendMail(msg, (err, info) => {
		if (err) console.log(err);
		else console.log("Email sent", info);
	});
};

module.exports = {
	sendEmail,
};
