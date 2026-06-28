import React from "react";
import "../App.css";
import { Link, useNavigate } from "react-router-dom";


export default function LandingPage() {

  const router=useNavigate();

  return (
    <div className="LandingPageContainer">
      <nav>
        <div className="navHeader">
          <h2>MeetHub</h2>
        </div>
        <div className="navList">
          <p onClick={()=>{
            router("/asd23")
          }}>Join as Guest</p>
          <p onClick={()=>{
            router("/auth")
          }}>Register</p>
          <div role="button" onClick={()=>{
            router("/auth")
          }}>
            <p>Login</p>
          </div>
        </div>
      </nav>

      <div className="LandingMainContainer">
        <div>
          <h2>
            <span style={{ color: "#FF9839" }}>Connect</span> with your Loved
            Ones
          </h2>
          <p>Cover a distance by apna video call</p>
          <div role="button">
            <Link to="/auth">Get Started</Link>
          </div>
        </div>
        <div>
          <img src="/mobile.png"></img>
        </div>
      </div>
    </div>
  );
}
