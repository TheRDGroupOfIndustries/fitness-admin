import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json({ error: "Email and OTP are required" }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: 'fitnessevolution108@gmail.com',
        pass: 'qzor ahwq efqo mjdl',
      },
    });

    const mailOptions = {
      from: 'fitnessevolution108@gmail.com',
      to: email,
      subject: "Fitness Evolution - Reset Password OTP",
      html: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Secure OTP Verification</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 20px;
        }
        .container {
            background-color: #ffffff;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            max-width: 600px;
            margin: auto;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        .otp-box {
            background-color: #e7f3ff; /* Light blue background */
            border: 1px solid #007bff; /* Corporate color */
            border-radius: 5px;
            padding: 15px;
            text-align: center;
            font-size: 24px;
            font-weight: bold;
            color: #007bff; /* Corporate color */
            margin: 20px 0;
        }
        .footer {
            text-align: center;
            font-size: 12px;
            color: #777;
            margin-top: 20px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="https://fitness-landing-omega.vercel.app/assets/icon-B7GQ4hnE.png" alt="Company Logo" width="150" />
            <h1>Secure OTP Verification</h1>
        </div>
        <p>Dear User,</p>
        <p>Your OTP code is:</p>
        <div class="otp-box">${otp}</div>
        <p>Please use this code to complete your verification process.</p>
        <div class="footer">
            <p>Thank you for choosing Fitness Evolution!</p>
            <p>&copy; 2025 Fitness Evolution</p>
        </div>
    </div>
</body>
</html>

      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: "OTP sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Failed to send OTP" }, { status: 500 });
  }
}
