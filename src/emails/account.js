const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'acetdecastro.dev@gmail.com',
    subject: 'Welcome!',
    html: `<h1>Welcome, ${name}!</h1><br>Start your journey now 🚀`,
  };

  sgMail.send(msg);
};

const sendCancelAccountEmail = (email, name) => {
  const msg = {
    to: email,
    from: 'acetdecastro.dev@gmail.com',
    subject: 'Account cancellation',
    html: `<h1>Cancellation of account: ${name}</h1>
          <br>
          <h2>We are sad to see you go. Let us know how can we make things better for you 😏</h2>`,
  };

  sgMail.send(msg);
};

module.exports = {
  sendWelcomeEmail,
  sendCancelAccountEmail,
};
