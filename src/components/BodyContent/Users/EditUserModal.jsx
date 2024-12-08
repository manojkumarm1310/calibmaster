import { useContext, useEffect, useState } from "react";
import "./EditUserModal.css";
import { Modal, Spinner, Button } from "react-rainbow-components";
import CustomInput from "../../Inputs/CustomInput";
import CustomSelect from "../../Inputs/CustomSelect";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch } from "react-redux";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { userSchema } from "../../../Schemas/user";
import { userwopassSchema } from "../../../Schemas/userwopass";
import { usersActions } from "../../../store/users";

const EditUserModal = (props) => {

  const [error, setError] = useState();
  const [isLoaded, setIsLoaded] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("CSD");
  const dispatch = useDispatch();
  const auth = useContext(AuthContext);

  useEffect(() => {
    setError();
  }, [name, email, password, department]);

  const updateUserHandler = async () => {
    const newuser = {
      name,
      email,
      password,
      department,
      labId: auth.labId,
    };

    if (password) {
      const isValid = await userSchema.isValid(newuser);
      if (!isValid) {
        setError("Input Validation Failed!!");
        setIsLoaded(true);
        return;
      }
    }

    const isValid = await userwopassSchema.isValid(newuser);
    if (!isValid) {
      if (password.length < 8 && name && email)
        setError("Password must be minimum 8 characters and above");
      else setError("Input Validation Failed!!");
      setIsLoaded(true);
      return;
    }

    newuser.userId = props.userid;

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify(newuser),
    };

    const errornotification = {
      title: "Error while Updating User!!",
      description: name,
      icon: "error",
      state: true,
      timeout: 15000,
    };
    fetch(config.Calibmaster.URL + "/api/users/updateuser", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setIsLoaded(true);
        //console.log(data);
        if (data) {
          if (data.code === 200) {
            const newNotification = {
              title: "User Updated Successfully",
              description: name,
              icon: "success",
              state: true,
              timeout: 15000,
            };
            //console.log(data);
            props.fetchUsers();
            props.onclose();
            dispatch(usersActions.changeusers(data.data));
            dispatch(notificationActions.changenotification(newNotification));
          } else {
            dispatch(notificationActions.changenotification(errornotification));
            setError(data.message);
          }
        } else {
          dispatch(notificationActions.changenotification(errornotification));
          setError("Error while Updating User");
        }
      })
      .catch((err) => {
        dispatch(notificationActions.changenotification(errornotification));
        setError("Error while Updating User");
      });
  };

  const departments = [
    { label: "CSD", value: "CSD" },
    { label: "Calibration", value: "Calibration" },
    { label: "Accounts", value: "Accounts" },
  ];

  useEffect(() => {
    //console.log(props.userid);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ userId: props.userid }),
    };

    const errornotification = {
      title: "Error while Getting User!!",
      description: "Error while Getting User Details!!",
      icon: "error",
      state: true,
      timeout: 15000,
    };

    fetch(config.Calibmaster.URL + "/api/users/getuserbyid", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setIsLoaded(true);

        if (data) {
          if (data.code === 200) {
            const resdata = data.data;
            setName(resdata.name);
            setEmail(resdata.email);
            setDepartment(resdata.department);
          } else {
            dispatch(notificationActions.changenotification(errornotification));
            setError(data.message);
          }
        } else {
          dispatch(notificationActions.changenotification(errornotification));
          setError("Error while Getting User");
        }
      })
      .catch((err) => {
        dispatch(notificationActions.changenotification(errornotification));
        setError("Error while Getting User");
      });
  }, [props.userid]);

  return (
    <div className="edit__user__modal">
      <Modal
        id="edit__user"
        isOpen={props.isopen}
        onRequestClose={props.onclose}
        title="Edit User"
        footer={
          <div className="rainbow-flex center">
            <p className="red">{error}</p>
            {!isLoaded ? <Spinner size="medium" /> : null}
            <Button
              label="Update User"
              variant="brand"
              onClick={updateUserHandler}
            />
          </div>
        }
      >
        <div className="add__user__item">
          <CustomInput
            label="Name"
            type="text"
            value={name}
            onchange={(v) => setName(v)}
            disabled={false}
            required={true}
          />
        </div>

        <div className="add__user__item">
          <CustomInput
            label="Email"
            type="text"
            value={email}
            onchange={(v) => setEmail(v)}
            disabled={false}
            required={true}
          />
        </div>

        <div className="add__user__item">
          <CustomInput
            label="Password"
            type="password"
            value={password}
            onchange={(v) => setPassword(v)}
            disabled={false}
            required={true}
          />
        </div>

        <div className="add__user__item">
          <CustomSelect
            label="Department"
            options={departments}
            required={true}
            value={department}
            onselect={(v) => setDepartment(v)}
          />
        </div>
        {/* <p className="red center">{error}</p> */}
        {!isLoaded ? <Spinner size="medium" /> : null}
      </Modal>
    </div>
  );
};

export default EditUserModal;
