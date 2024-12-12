import nodemailer from "nodemailer";


const GMAIL_SECRET = process.env.GMAIL_SECRET?.split('|');
const GMAIL_USERNAME = `${GMAIL_SECRET?.[0]}@gmail.com`;
const GMAIL_PASSWORD = GMAIL_SECRET?.[1];

export const sender = {
	email: "veasnawp@gmail.com",
	name: "Veasna WP",
};

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: GMAIL_USERNAME,
    pass: GMAIL_PASSWORD as string,
  },
});