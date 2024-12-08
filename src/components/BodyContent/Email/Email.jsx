import "./Email.css";
import { Card, Spinner, CheckboxToggle } from "react-rainbow-components";
import { useState, useEffect, useContext } from "react";
import CustomInput from "../../Inputs/CustomInput";
import CustomButton from "../../Inputs/CustomButton";
import { AuthContext } from "../../../context/auth-context";
import { useDispatch } from "react-redux";
import { notificationActions } from "../../../store/nofitication";
import config from "../../../utils/config.json";
import { emailconfigSchema } from "../../../Schemas/emailconfig";

const Email = () => {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [host, setHost] = useState("");
  const [port, setPort] = useState(0);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(true);
  const [testmailFlag, setTestMailFlag] = useState(false);
  const [remail, setREmail] = useState("");

  const auth = useContext(AuthContext);
  const dispatch = useDispatch();

  const fetchLabSMTPConfig = async () => {

    try {

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ labId: auth.labId }),
      };

      let response = await fetch(config.Calibmaster.URL + "/api/lab/fetch-lab-smtp-config", requestOptions);
      response = await response.json();
      // console.log(response);

      const { email_smtp_server_host, email_smtp_server_port, sender_email, sender_password } = response?.data;

      setEmail(sender_email);
      setPassword(sender_password);
      setHost(email_smtp_server_host);
      setPort(email_smtp_server_port);

    } catch (error) {
      console.log(error);
      const errornotification = {
        title: "Email Configuration not Found",
        icon: "error",
        state: true,
        timeout: 15000,
      };
      dispatch(notificationActions.changenotification(errornotification));
    }
  }

  useEffect(() => {
    fetchLabSMTPConfig();
  }, []);

  useEffect(() => {
    setError();
  }, [email, password, host, port]);

  const testmailFlagHandler = () => {
    const testmailflag = testmailFlag;
    setTestMailFlag(!testmailflag);
  };

  /** Update SMTP Config */
  const updateEmailHandler = async () => {
    try {

      if (host == "") {
        setError("Please Enter SMTP Host"); return;
      }
      if (port == "") {
        setError("Please Enter SMTP Port Number"); return;
      }
      if (email == "") {
        setError("Please Enter SMTP Sender Email Address"); return;
      }
      if (password == "") {
        setError("Please Enter SMTP Sender Email Password"); return;
      }

      setIsLoaded(false);

      const body = {
        lab_id: auth.labId,
        email_smtp_server_host: host,
        email_smtp_server_port: parseInt(port),
        sender_email: email,
        sender_password: password,
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify(body),
      };

      let response = await fetch(config.Calibmaster.URL + "/api/lab/update-lab-smtp-config", requestOptions);
      response = await response.json();
      console.log(response);

      if (response?.success) {
        const newNotification = {
          title: response?.msg,
          description: "",
          icon: "success",
          state: true,
          timeout: 15000,
        };
        dispatch(notificationActions.changenotification(newNotification));
        setIsLoaded(true);
        fetchLabSMTPConfig();
      } else {
        const errornotification = {
          title: "Something went wrong !!!",
          description: "",
          icon: "error",
          state: true,
          timeout: 15000,
        };
        dispatch(notificationActions.changenotification(errornotification));
      }
    } catch (error) {
      console.log(error);
      const errornotification = {
        title: "Something went wrong !!!",
        description: "",
        icon: "error",
        state: true,
        timeout: 15000,
      };
      dispatch(notificationActions.changenotification(errornotification));
    }
  };

  const testMailHandler = async () => {
    setIsLoaded(false);
    const portn = parseInt(port);
    const emailconfig = {
      email,
      password,
      host,
      port: portn,
      remail,
    };
    const isValid = await emailconfigSchema.isValid(emailconfig);
    if (!isValid) {
      setError("Input Validation Failed!! Please Check!!");
      setIsLoaded(true);
      return;
    }
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ emailconfig, labId: auth.labId }),
    };
    //console.log(requestOptions);

    const errornotification = {
      title: "Error While Sending Test Email!!",
      description: "Please check the Entered Parameters!!",
      icon: "error",
      state: true,
      timeout: 15000,
    };

    fetch(config.Calibmaster.URL + "/api/lab/testmail", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setIsLoaded(true);
        //console.log(data);
        if (data) {
          if (data.code === 200) {
            const newNotification = {
              title: "Test Email Sent Successfully!!",
              description: "Please check Receiver Inbox!!",
              icon: "success",
              state: true,
              timeout: 15000,
            };
            dispatch(notificationActions.changenotification(newNotification));
          } else {
            setError(data.message);

            dispatch(notificationActions.changenotification(errornotification));
          }
        } else {
          setError("Error While Sending Test Email!!");
          dispatch(notificationActions.changenotification(errornotification));
        }
      })
      .catch((err) => {
        setIsLoaded(true);
        setError("Error While Sending Test Email!!");
        dispatch(notificationActions.changenotification(errornotification));
      });
  };

  return (
    <div className="email__page">
      <Card className="email__page__card">
        <div className="email__page__label">
          <h3>Email Configuration</h3>
        </div>
        <div className="email__page__form">

          {/* Sender Email Address */}
          <div className="email__page__item">
            <CustomInput
              label="Sender Email Address"
              type="text"
              value={email}
              onchange={(v) => setEmail(v)}
              disabled={false}
              required={true}
            />
          </div>

          {/* Sender Email's Password */}
          <div className="email__page__item">
            <CustomInput
              label="Sender Email's Password"
              type="password"
              value={password}
              onchange={(v) => setPassword(v)}
              disabled={false}
              required={true}
            />
          </div>

          {/* Email SMTP Server Host */}
          <div className="email__page__item">
            <CustomInput
              label="Email SMTP Server Host"
              type="text"
              value={host}
              onchange={(v) => setHost(v)}
              disabled={false}
              required={true}
            />
          </div>

          {/* Email SMTP Server Port */}
          <div className="email__page__item">
            <CustomInput
              label="Email SMTP Server Port"
              type="number"
              value={port}
              min={1}
              onchange={(v) => setPort(v)}
              disabled={false}
              required={true}
            />
          </div>

          {/* Send a Test Mail Toggle */}
          <div className="email__page__item__special">
            <CheckboxToggle
              label="Send a Test Mail"
              value={testmailFlag}
              onChange={testmailFlagHandler}
            />
          </div>

          {testmailFlag ? (
            <div className="email__page__item">
              <CustomInput
                label="Receiver Email Address"
                type="text"
                value={remail}
                onchange={(v) => setREmail(v)}
                disabled={false}
                required={false}
              />
            </div>
          ) : null}
          {testmailFlag ? (
            <div className="email__page__item__special">
              <CustomButton
                label="Send Test Mail"
                variant="brand"
                onclick={testMailHandler}
              />
            </div>
          ) : null}

          {error && <p className="red center w100" style={{ margin: 0 }}>{error}</p>}

          {!isLoaded ? <Spinner size="medium" /> : null}

          <div className="email__page__btn">
            <CustomButton
              label="Update SMTP Configuration"
              variant="success"
              onclick={updateEmailHandler}
            />
          </div>

        </div>
      </Card>
    </div>
  );
};

export default Email;
