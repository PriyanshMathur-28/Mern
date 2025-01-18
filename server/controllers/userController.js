  import ErrorHandler from "../middlewares/error.js";
  import { catchAsyncError } from "../middlewares/catchAsyncError.js";
  import { User } from "../models/userModel.js";
  import { sendEmail } from "../utils/sendEmail.js";
  import twilio from "twilio";
  import sendToken from "../utils/sendToken.js"
import { error } from "console";
import crypto from "crypto"
  const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

  export const register = catchAsyncError(async (req, res, next) => {
    try {
      const { name, email, phone, password, verificationMethod } = req.body;
      if (!name || !email || !phone || !password || !verificationMethod) {
        return next(new ErrorHandler("All fields are required.", 400));
      }
      function validatePhoneNumber(phone) {
        const phoneRegex = /^\+91\d{10}$/;
        return phoneRegex.test(phone);
      }

      if (!validatePhoneNumber(phone)) {
        return next(new ErrorHandler("Invalid phone number.", 400));
      }

      const existingUser = await User.findOne({
        $or: [
          {
            email,
            accountVerified: true,
          },
          {
            phone,
            accountVerified: true,
          },
        ],
      });

      if (existingUser) {
        return next(new ErrorHandler("Phone or Email is already used.", 400));
      }

      const registerationAttemptsByUser = await User.find({
        $or: [
          { phone, accountVerified: false },
          { email, accountVerified: false },
        ],
      });

      if (registerationAttemptsByUser.length > 3) {
        return next(
          new ErrorHandler(
            "You have exceeded the maximum number of attempts (3). Please try again after an hour.",
            400
          )
        );
      }

      const userData = {
        name,
        email,
        phone,
        password,
      };

      const user = await User.create(userData);
      const verificationCode = await user.generateVerificationCode();

      sendVerificationCode(
        verificationMethod,
        verificationCode,
        name,
        email,
        phone,
        res
      );
    
    } catch (error) {
      next(error);
    }
  });

  export default register;

  async function sendVerificationCode(
    verificationMethod,
    verificationCode,
    name,
    email,
    phone,
    res
  ) {
    try {
      if (verificationMethod === "email") {
        const message = generateEmailTemplate(verificationCode);
        sendEmail({ email, subject: "Your Verification Code", message });
        res.status(200).json({
          success: true,
          message: `Verification email successfully sent to ${name}`,
        });
      } else if (verificationMethod === "phone") {
        const verificationCodeWithSpace = verificationCode
          .toString()
          .split("")
          .join(" ");
        await client.calls.create({
          twiml: `<Response><Say>Your verification code is ${verificationCodeWithSpace}. Your verification code is ${verificationCodeWithSpace}.</Say></Response>`,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone,
        });
        res.status(200).json({
          success: true,
          message: `OTP sent.`,
        });
      } else {
        return res.status(500).json({
          success:false,
          message: "Invalid Verification Method"
        })
      }
    } catch (error) {
      return res.status(500).json({
        success:false,
        message: "Verification code failed to send"
      })
    }
  }

  function generateEmailTemplate(verificationCode) {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
        <h2 style="color: #4CAF50; text-align: center;">Verification Code</h2>
        <p style="font-size: 16px; color: #333;">Dear User,</p>
        <p style="font-size: 16px; color: #333;">Your verification code is:</p>
        <div style="text-align: center; margin: 20px 0;">
          <span style="display: inline-block; font-size: 24px; font-weight: bold; color: #4CAF50; padding: 10px 20px; border: 1px solid #4CAF50; border-radius: 5px; background-color: #e8f5e9;">
            ${verificationCode}
          </span>
        </div>
        <p style="font-size: 16px; color: #333;">Please use this code to verify your email address. The code will expire in 5 minutes.</p>
        <p style="font-size: 16px; color: #333;">If you did not request this, please ignore this email.</p>
        <footer style="margin-top: 20px; text-align: center; font-size: 14px; color: #999;">
          <p>Thank you,<br>By Priyansh Mathur</p>
          <p style="font-size: 12px; color: #aaa;">This is an automated message. Please do not reply to this email.</p>
        </footer>
      </div>
    `;
  }


  export const verifyOTP = catchAsyncError(async (req, res, next) => {
    const { email, otp, phone } = req.body;

    // Function to validate phone number
    function validatePhoneNumber(phone) {
      const phoneRegex = /^\+91\d{10}$/;
      return phoneRegex.test(phone);
    }

    // Validate phone number
    if (!validatePhoneNumber(phone)) {
      return next(new ErrorHandler("Invalid phone number.", 400));
    }

    try {
      // Find users by email or phone with account not verified
      const userAllEntries = await User.find({
        $or: [
          {
            email,
            accountVerified: false,
          },
          {
            phone,
            accountVerified: false,
          },
        ],
      }).sort({ createdAt: -1 });

      // Check if no user found
      if (userAllEntries.length === 0) {
        return next(new ErrorHandler("User not Found", 400));
      }

      let user;

      // If there are more than 3 entries, keep the most recent one and delete the rest
      if (userAllEntries.length > 3) {
        user = userAllEntries[0];

        await User.deleteMany({
          _id: { $ne: user._id },
          $or: [
            {
              phone,
              accountVerified: false,
            },
            {
              email,
              accountVerified: false,
            },
          ],
        });
      } else {
        // If 3 or fewer entries, select the first one
        user = userAllEntries[0];
      }

      // Check if OTP matches
      if (user.verificationCode !== Number(otp)) {
        return next(new ErrorHandler("Invalid OTP!", 400));
      }

      const currentTime = Date.now();
      const verificationCodeExpire = new Date(user.verificationCodeExpire).getTime();

      // Check if OTP has expired
      if (currentTime > verificationCodeExpire) {
        return next(new ErrorHandler("OTP expired", 400));
      }

      // Update user account as verified
      user.accountVerified = true;
      user.verificationCode = null;
      user.verificationCodeExpire = null;

      await user.save({ validateModifiedOnly: true });
        sendToken(user,200,"Account Verified",res);
    } catch (error) {
      return next(new ErrorHandler("Internal Server Error", 500));
    }
  });


  export const login=catchAsyncError(async (req,res,next)=>
  {
    const {email,password} = req.body;
    if(!email || !password)
    {
      return next(new ErrorHandler("Email and Password are required", 400));
    }
    const user= await User.findOne({email, accountVerified: true  }).select("+password");
    
    if(!user)
    {
      return next(new ErrorHandler("Invalid email or Password",400));
    }
    const isPasswordMatched=await user.comparePassword(password);

    if(!isPasswordMatched)
    {
      return next(new ErrorHandler("Invalid email or Password",400))
    }
    
    sendToken(user,200,"User logged in successfully", res);
  });



export const logout=catchAsyncError(async (req,res,next)=>
{
  res.status(200).cookie("token", "",{
    expires: new Date(
      Date.now()),
    httponly:true,}).json({
      success:true,
      message: "Logged out successfully"

    });

  });

export const getUser=catchAsyncError(async(req,res,next)=>
{
  const user=req.user;
  res.status(200).json({
    success:true,
    user, 
  })
})
export const forgotPassword = catchAsyncError(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email, accountVerified: true });

  if (!user) {
    return next(new ErrorHandler("User not Found", 404));
  }

  // Generate reset token
  const resetToken = user.generateResetPasswordToken(); // Ensure this returns a valid token

  // Save the user with the reset token and expiry
  await user.save({ validateBeforeSave: false });

  // Construct the reset password URL
  const resetPasswordUrl = `${process.env.FRONTEND_URL}/password/reset/${resetToken}`;

  // Email message with reset link
  const message = `Your reset Password Token is :- \n\n ${resetPasswordUrl} \n\n If you have not requested this email, please ignore it.`;

  try {
    // Send the email with the reset link
    await sendEmail({
      email: user.email,
      subject: "MERN AUTHENTICATION APP RESET PASSWORD",
      message,
    });

    res.status(200).json({
      success: true,
      message: `Email sent to ${user.email} successfully`,
    });
  } catch (error) {
    // Reset the token fields if sending email fails
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorHandler("Cannot send reset password token", 500));
  }
});


export const resetPassword=catchAsyncError(async(req,res,next)=>
{
  const {token}=req.params;
  const resetPasswordToken=crypto.createHash("sha256").update(token).digest("hex");

  const user=await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: {
      $gt: Date.now()
    }})
    if(!user)
    {
      return next(new ErrorHandler("Reset Password token is invalid or has been Expired",400))
    }


  if(req.body.password!= req.body.confirmPassword)
  {
    return next(new ErrorHandler("Password t& Confirm Password does not Match",400))

  }

  user.password= req.body.password;
  user.resetPasswordToken=undefined;
  user.resetPasswordExpire=undefined;
  await user.save();

  sendToken(user, 200, "Reset Password Successfully",res);
});