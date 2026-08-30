import nodemailer from "nodemailer";

function MailTransport() {
    const transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: 'govindpurdiet@gmail.com',
                pass: ''
            }
        }
    );
    return transporter;
}


export default MailTransport;
