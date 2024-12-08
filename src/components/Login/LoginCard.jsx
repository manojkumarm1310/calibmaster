import "./LoginCard.css";
import React, { useState, useContext } from "react";
import styled from "styled-components";
import { AuthContext } from "../../context/auth-context";
import { Avatar, Input, Button, Card } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import logo from "../../images/CalibMaster_Logo2.png";
import { Buffer } from "buffer";
import validator from 'validator';
import { useDispatch } from "react-redux";
import { isloadingActions } from "../../store/isloadingslice";
import { apiloginHandler } from "../../utils/api";

const avatarLarge = { width: 110, height: 110 };

const inputStyles = {
  width: 200,
};

const StyledCard = styled(Card)`
  width: 300px;
  height: 363px;
  opacity: 0.9;
`;

const LoginCard = (props) => {

  const [email, setEmail] = useState({ value: '', error: '' });
  const [password, setPassword] = useState({ value: '', error: '' });
  const [error, setError] = useState();
  const auth = useContext(AuthContext);
  const [isError, setIsError] = useState(false);

  const [emailErr, setEmailErr] = useState("");
  const [passwordErr, setPasswordErr] = useState("");

  const dispatch = useDispatch();

  const emailHandler = (e) => {
    const { value } = e.target;
    setEmail({ value: value, error: '' });
    setError();
    setEmailErr("");
    setIsError(false);
  };

  const passwordHandler = (e) => {
    const { value } = e.target;
    setPassword({ value: value, error: '' });
    setError();
    setPasswordErr("");
    setIsError(false);
  };

  const validatePassword = (password) => {
    // Check if password is at least 8 characters and contains at least one uppercase, one lowercase, and one digit
    const isLengthValid = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);

    return isLengthValid && hasUppercase && hasLowercase && hasNumber;
  };

  const loginHandler = async () => {

    dispatch(isloadingActions.changeisloading(true));

    if (!email.value) {
      setEmailErr("Plesae enter your email address");
      dispatch(isloadingActions.changeisloading(false));
      return;
    }

    if (!password.value) {
      setPasswordErr("Plesae enter your password");
      dispatch(isloadingActions.changeisloading(false));
      return;
    }

    const requestBody = {
      email: email.value,
      password: password.value,
    };

    const { data, error } = await apiloginHandler("/api/users/login", requestBody);

    dispatch(isloadingActions.changeisloading(false));

    if (data) {
      if (data.code === 200) {

        const data1 = data.data;
        if (data1.email != "root@iviewsense.com") {
          const prefix = "data:" + data1.imgtype + ";base64,";
          const base64data = new Buffer(data.data.image).toString("base64");
          // localStorage.setItem("logo", prefix + base64data);
          localStorage.setItem("logo", data.data.filename);
        }

        auth.login(
          data1.userId,
          data1.token,
          data1.name,
          data1.email,
          data1.department,
          data1.labId
        );
        setError();
        props.redirect(true);
      } else {
        setError(data.message);
      }
    } else {
      setError(error);
      dispatch(isloadingActions.changeisloading(false));
    }
  };

  return (
    <div className="centered">
      <StyledCard
        className="rainbow-flex
        rainbow-flex_column 
        rainbow-align_center 
        rainbow-justify_space-around 
        rainbow-p-vertical_small 
        rainbow-m-around_small flex-center login__card"
        style={isError ? { minHeight: '500px' } : null}
      >
        <div className="flex-center">
          <Avatar
            style={avatarLarge}
            src={logo}
            assistiveText="logo"
            title="logo"
          />
          <div className="topgap">

            <Input
              label="Email"
              placeholder="Email"
              type="email"
              className="rainbow-p-around_medium"
              value={email.value}
              error={email.error}
              onChange={emailHandler}
            />
            <p className="red" style={{ marginTop: 0 }}>{emailErr}</p>

            <Input
              label="Password"
              placeholder="**********"
              type="password"
              className="rainbow-p-around_medium"
              value={password.value}
              error={password.error}
              onChange={passwordHandler}
            />
            <p className="red" style={{ marginTop: 0 }}>{passwordErr}</p>

          </div>
          <div className="topgap">
            <Button
              variant="brand"
              className="rainbow-m-around_medium"
              onClick={loginHandler}
            >
              Login &nbsp;
              <FontAwesomeIcon
                icon={faArrowRight}
                className="rainbow-m-left_medium"
              />
            </Button>
          </div>
        </div>

        <p className="redcolor">{error}</p>
      </StyledCard>
    </div>
  );
};

export default LoginCard;
