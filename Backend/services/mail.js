import nodemailer from "nodemailer";

function MailTransport() {
    const transporter = nodemailer.createTransport(
        {
            service: 'gmail',
            auth: {
                user: 'govindpurdiet@gmail.com',
                pass: 'cdthktayvmmerkcq'
            }
        }
    );
    return transporter;
}


export default MailTransport;