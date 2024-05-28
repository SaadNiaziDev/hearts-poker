const { publicPics, backend, frontend } = require("../config");

const head = `<head>
                <meta content="text/html; charset=utf-8" http-equiv="Content-Type">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link
                    href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap"
                    rel="stylesheet">
                </head>`;

const footer = `
                <div style="text-align: center; margin-top: 40px;">
                    <div style="margin-right: 20px; display: inline-block; width:25px; height:25px"><img
                            style="width: 100%; height:100%; object-fit:cover" src="${publicPics}/instagram.png" alt=""></div>
                    <div style="margin-right: 20px; display: inline-block; width:25px; height:25px"><img
                            style="width: 100%; height:100%; object-fit:cover" src="${publicPics}/twitter.png" alt=""></div>
                    <div style="display: inline-block; width:25px; height:25px"><img
                            style="width: 100%; height:100%; object-fit:cover" src="${publicPics}/facebook.png" alt=""></div>
                </div>`;

const emailVerifyTemplate = (user) => {
	return `
    <!DOCTYPE html>
    <html lang="en">
    ${head}
    <body>
       <div
        style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7;width: 638px;padding: 24px; margin: 0 auto;">
            <div style="width: 150px; height: 60px; margin: 0 auto;">
                <img src="${publicPics}/logo.png" alt="" style="width:100%; height:100%; object-fit:contain;">
            </div>
            <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
                <h1
                    style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
                    Welcome to Hearts Poker!
                </h1>
                <div
                    style="background-color: white; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 32px;width: 208px;height: 208px; margin:auto; padding:10px ">
                    <img src="${publicPics}/Icons-bid.png" style="margin:63px;" alt="">
                </div>
                <p style="text-align:center; font-weight: 400;font-size: 16px; color: #313D5B;">To verify your email
                    address, click the button below:</p>
                <div style="text-align:center ; margin-top: 50px;">
                    <a href="${frontend}/verify/${user?._id}/${user?.mailToken}"
                        style="    background-color: #c72f2c;border-radius: 16px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                        Confirm registration
                    </a>
                </div>
                <p
                    style="margin-bottom: 0; margin-top: 40px; text-align: center; font-style: normal;font-weight: 400;font-size: 16px; color: #313D5B;">
                    If the button does not work, follow the link below:
                </p>
                <div style="text-align: center; margin-top: 5px;">
                    <a href="${frontend}/verify/${user?._id}/${user?.mailToken}"
                        style="text-decoration: none;font-style: normal;font-weight: 400; color: #c72f2c; font-size: 16px;">${frontend}/verify/${user?._id}/${user?.mailToken}</a>
                </div>
            </div>
            ${footer}
        </div>
    </body>

    </html>`;
};

const forgetPasswordTemplate = (user) => {
	return `
    <!DOCTYPE html>
    <html lang="en">
    ${head}
    <body>
       <div
            style="font-family: Arial, Helvetica, sans-serif; background-color: #F0F3F7;width: 638px;height: 766px;padding: 24px; margin: 0 auto;">
            <div style="width: 150px; height: 60px; margin: 0 auto;">
                <img src="${publicPics}/logo.png" alt="" style="width:100%; height:100%; object-fit:contain;">
            </div>
            <div style="background-color: #F8F9FB;border-radius: 24px; padding: 30px 55px;">
                <h1
                    style="font-style: normal;font-weight: 400;font-size: 24px;color: #313D5B;text-align: center; letter-spacing: 0.02em;">
                   Forgot Password </h1>
                <div
                    style="background-color: white; box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;border-radius: 32px;width: 208px;height: 208px; margin: 0 auto; padding:13px;">
                    <img src="${publicPics}/passwordReset.png" alt="" style="margin:40px 30px">
                </div>
                <p
                    style="text-align:center; font-weight: 400;font-size: 16px; color: #313D5B; width:80%; margin: 30px auto;">
                    You recently requested to reset your password for your account.
                </p>
                <div style="text-align:center ; margin-top: 30px;">
                    <a href="${frontend}/reset/${user?._id}/${user?.resetPasswordToken}"
                        style="background-color:#c72f2c; border-radius: 16px;text-decoration: none;padding: 14px 30px;color: #fff;  ">
                        Reset your password
                    </a>
                </div>
                <p
                    style="margin-bottom: 0; margin-top: 40px; text-align: center; font-style: normal;font-weight: 400;font-size: 16px; color: #313D5B;">
                    If you did not request to reset your password, please ignore this mail. This password reset request is
                    only valid for the next 30 minutes.
                </p>
            </div>
            ${footer}
        </div>
    </body>
    </html>
    `;
};

module.exports = {
	emailVerifyTemplate,
	forgetPasswordTemplate,
};
