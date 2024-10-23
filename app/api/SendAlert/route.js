import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

// I HAVE USED NODEMAILER FOR ALERT SYSTEM
dotenv.config();

export async function POST(req) {
  try {
    const body = await req.json();
    const { temperature, city, email } = body; 

    
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,  
        pass: process.env.EMAIL_PASS,  
      },
    });

   
    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Temperature Alert!',
      text: `Warning: The current temperature in ${city} is ${temperature}°C, which exceeds the limit of 30°C.`,
    };

    await transporter.sendMail(mailOptions);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error.message);
    return NextResponse.json({ message: 'Error sending email' }, { status: 500 });
  }
}
