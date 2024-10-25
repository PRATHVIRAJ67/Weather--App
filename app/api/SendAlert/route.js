import nodemailer from 'nodemailer';
import { NextResponse } from 'next/server';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export async function POST(req) {
  try {
    const body = await req.json();
    const { temperature, city, email } = body;

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('Missing email configuration in environment variables');
    }

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for port 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    let mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Temperature Alert!',
      text: `Warning: The current temperature in ${city} is ${temperature}°C, which exceeds the limit of 25°C.`,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', result.messageId);
    return NextResponse.json({ message: 'Email sent successfully' }, { status: 200 });

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json({ message: 'Error sending email', error: error.message }, { status: 500 });
  }
}
