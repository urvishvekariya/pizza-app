const sgMail = require('@sendgrid/mail')

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const sendWelcomeEmail = (email, name) => {

    sgMail.send({
        to: email,
        from: 'urvish.adsum@gmail.com',
        subject: 'Thanks for joining in !',
        text: `Welcome to the Skyline pizza app, ${name}. Let me know how you get along with the Skyline pizza. Enjoy your food with us!`
    }).then(() => {
    }).catch((err) => {
        console.log(err)
    })
}

const sendGoodbyeEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: 'urvish.adsum@gmail.com',
        subject: 'Goodbye, Visit again !',
        text: `Goodbye, ${name}.We hope that you have a nice experience. If you okay with replay then tell us your experiance with the app.`
    })
}
const sendResetiLnk = (email, link) => {
    sgMail.send({
        to: email,
        from: 'urvish.adsum@gmail.com',
        subject: 'Reset your password !',
        html: '<div style="margin-left: 2rem;margin-right: 2rem;"><h2>Need To Reset Your Password?</h2><button  style="margin-top: 3rem;background: #FE5F1E;color:white;padding:0.5rem 2rem;border-radius: 9999px;border-color:#FE5F1E"><a href="' + link + '" style="text-decoration:none;color:white;font-weight:600"> Please Click Here To reset the password</a></button></div><br><br>'
    })
}
module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail,
    sendResetiLnk
}