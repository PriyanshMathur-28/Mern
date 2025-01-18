import React, { useContext } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { Context } from "../main";
import Hero from "../components/Hero";
import Instructor from "../components/Instructor";
import Technologies from "../components/Technologies";
import Footer from "../layout/Footer";
import "../styles/Home.css";

const Home = () => {
  const { isAuthenticated, setIsAuthenticated, setUser } = useContext(Context);
  const navigate = useNavigate();

  const logout = async () => {
    try {
      console.log("Starting logout...");
      const response = await axios.post(
        "http://localhost:4000/api/v1/user/logout",
        {},
        {
          withCredentials: true,
          headers: {
            "Content-Type": "application/json",
            // If you're using any auth tokens in headers, add them here
          }
        }
      );
      
      console.log("Logout response:", response);
      toast.success(response.data.message || "Logged out successfully");
      setUser(null);
      setIsAuthenticated(false);
      localStorage.removeItem('isAuthenticated'); // In case you're using localStorage
      navigate('/auth');
    } catch (error) {
      console.log("Full error details:", {
        error: error,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data
      });
      
      const errorMessage = error.response?.data?.message || "Logout failed";
      toast.error(errorMessage);
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/auth" />;
  }

  return (
    <section className="home">
      <Hero />
      <Instructor />
      <Technologies />
      <button 
        onClick={logout}
        className="logout-button" // Add styling as needed
      >
        Logout
      </button>
      <Footer />
    </section>
  );
};

export default Home;  