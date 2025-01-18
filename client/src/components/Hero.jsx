import React, { useContext } from "react";
import "../styles/Hero.css";
import { Context } from "../main";

const Hero = () => {
  const { user } = useContext(Context);
  return (
    <>
      <div className="hero-section">
        <h4>Hello, {user ? user.name : "Developer"}</h4>
        <h1>Welcome to MERN Authentication Project</h1>
        <p>
        I have built a complete authentication system using the MERN stack, incorporating features like OTP verification with Twilio and Nodemailer..
        </p>
      </div>
    </>
  );
};

export default Hero;
