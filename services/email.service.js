import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
    service:"gmail",
    auth:{
        user:process.env.EMAIL_USER,
        pass:process.env.EMAIL_PASS
    }
})

export const sendBookingEmail = async(email,eventName) => {
    console.log(email,eventName)
    const mailOptions = {
        from:process.env.EMAIL_USER,
        to:email,
        subject:"Booking Confirmation",
        html:`
        <h2>Booking Confirmed</h2>
        <p>Your booking for <strong>${eventName}</strong> has been confirmed</p>
        <p>Thank you for booking with us!</p>
        `
    };

    await transporter.sendMail(mailOptions);
}