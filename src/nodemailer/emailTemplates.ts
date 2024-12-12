const defaultStyle = (inlineStyle="") => (
`<style>
    body {
      font-family: Arial, sans-serif;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }

    .container {
      max-width: 600px;
      margin: 30px auto 10px auto;
      background: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      border: 1px solid #ddd;
    }

    .header {
      background-color: #4CAF50;
      color: white;
      padding: 20px;
      text-align: center;
      font-size: 26px;
      font-weight: bold;
    }

    .content {
      padding: 25px;
      color: #333;
      line-height: 1.8;
    }

    p {
      font-size: 1rem;
      margin: 0 0 15px;
    }
    .footer {
      background-color: #f4f4f4;
      padding: 15px;
      text-align: center;
      color: #777;
      font-size: 12px;
      border-top: 1px solid #ddd;
    }

    .footer p {
      font-size: 0.9rem;
      margin: 0;
    }

    .p-note {
      color: #555;
      font-size: 14px;
      line-height: 1.4;
      text-align: center;
      font-weight: bold;
      margin: 0;
    }
    ${inlineStyle}
  </style>`
)

export const verifyEmailTemplate = (
  userName: string,
  verificationCode: string,
  COMPANY_NAME: string,
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
  ${defaultStyle(
    `.verification-code {
      display: block;
      margin: 20px 0;
      font-size: 22px;
      color: #4CAF50 !important;
      background: #e8f5e9;
      border: 1px dashed #4CAF50;
      padding: 10px;
      text-align: center;
      border-radius: 5px;
      font-weight: bold;
      letter-spacing: 2px;
    }`
  )}
</head>

<body>
  <div class="container">
    <div class="header">Verify Your Email</div>
    <div class="content">
      <p>Hello, ${userName}</p>
      <p>Thank you for signing up! Please confirm your email address by entering the code below:</p>
      <span class="verification-code">${verificationCode}</span>
      <p class="p-note">If you did not create an account, no further action is required. If you have any questions, feel free to contact our support team.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
    </div>
  </div>
  <div>
    <p style="text-align: center; color: #888; font-size: 0.7rem;">This is an automated message, please do not reply to this email.</p>
  </div>
</body>

</html>
`;

export const passwordResetSuccessfulTemplate = (
  userName: string,
  yourName: string,
  COMPANY_NAME: string,
) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Password Reset Successful</title>
  ${defaultStyle()}
</head>

<body>
  <div class="container">
    <div class="header">Password Reset Successful</div>
    <div class="content">
      <p>Hello, ${userName}</p>
      <p>We're writing to confirm that your password has been successfully reset.</p>
      <div style="text-align: center; margin: 30px 0;">
        <div style="background-color: #4CAF50; color: white; width: 50px; height: 50px; line-height: 50px; border-radius: 50%; display: inline-block; font-size: 30px;">
          ✓
        </div>
      </div>
      <p>If you did not initiate this password reset, please contact our support team immediately.</p>
      <p>Best regards,<br>${yourName}</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
    </div>
  </div>
  <div>
    <p style="text-align: center; color: #888; font-size: 0.7rem;">This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;

export const passwordResetTemplate = (
  userName:string,
  resetLink:string,
  COMPANY_NAME:string
) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset Your Password</title>
  ${defaultStyle(
    `.reset-password {
      display: block;
      font-size: 22px;
      color: #4caf50 !important;
      background: #ccf5ce;
      border: 1px dashed #4CAF50;
      padding: 10px 16px;
      text-align: center;
      border-radius: 5px;
      font-weight: bold;
      letter-spacing: 2px;
      text-decoration: none;
      width: fit-content;
    }`
  )}
</head>

<body>
  <div class="container">
    <div class="header">Password Reset</div>
    <div class="content">
      <p>Hello, ${userName}</p>
      <p>We've got a request from you to reset the password for your account. <br/>Please click on the button below to get a new password.</p>
      <div style="margin: 24px 0;">
        <a href="${resetLink}" class="reset-password">Reset Your Password</a>
      </div>
      <p>This link will expire in 1 hour for security reasons.</p>
      <p class="p-note">If you didn't request a password reset you can safely ignore this email. Only a person with access to your email can reset your account password.</p>
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${COMPANY_NAME}. All rights reserved.</p>
    </div>
  </div>
  <div>
    <p style="text-align: center; color: #888; font-size: 0.7rem;">This is an automated message, please do not reply to this email.</p>
  </div>
</body>
</html>
`;