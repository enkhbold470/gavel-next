import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

export const sendEmail = async (to: string, subject: string, text: string) => {
  const msg = {
    to,
    from: 'inky@deanzahacks.com', // Use your verified SendGrid email
    subject ,
    text,
  };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Email could not be sent');
  }
};
