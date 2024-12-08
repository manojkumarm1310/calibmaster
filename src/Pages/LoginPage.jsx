import React, { useState } from "react";
import { Redirect } from "react-router-dom";

import "./LoginPage.css";
import background from "../images/calibration.jpg";
import LoginCard from "../components/Login/LoginCard";

const LoginPage = (props) => {

  const [redirect, setRedirect] = useState(false);

  const redirectHandler = (state) => {
    setRedirect(state);
  };

  if (redirect) {
    return <Redirect to="/dashboard" />;
  } else {
    return (
      <div
        className="background"
        style={{ backgroundImage: `url(${background})` }}
      >
        <LoginCard redirect={redirectHandler} />
      </div>
    );
  }
};

export default LoginPage;
