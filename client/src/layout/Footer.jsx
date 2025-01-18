import React from "react";
import "../styles/Footer.css";
import { Link } from "react-router-dom";
import insta from "../assets/th.jpeg";
import yt from "../assets/yt.png";
import git from "../assets/git.png";
import linkedin from "../assets/linkedin.png";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>MERN Authentication</h2>
        </div>
        <div className="footer-social">
          <h3>Follow Me</h3>
          <div className="social-icons">
           
        
            <Link
              to="https://www.linkedin.com/in/priyanshmathur28/"
              target="_blank"
              className="social-link"
            >
              <img src={linkedin} alt="LinkedIn" />
            </Link>
            <Link
              to="https://github.com/PriyanshMathur-28"
              target="_blank"
              className="social-link"
            >
              <img src={git} alt="GitHub" />
            </Link>
            <Link
              to="https://www.instagram.com/craftedbypriyansh/"
              target="_blank"
              className="social-link"
            >
              <img src={insta} alt="GitHub" />
            </Link>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2024 MERN Authentication. All Rights Reserved.</p>
        <p>Designed by Priyansh Mathur</p>
      </div>
    </footer>
  );
};

export default Footer;
