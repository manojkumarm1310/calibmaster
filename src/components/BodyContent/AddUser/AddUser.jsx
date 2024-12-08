import { useContext, useEffect, useState } from "react";
import { Card, Spinner } from "react-rainbow-components";
import CustomInput from "../../Inputs/CustomInput";
import CustomSelect from "../../Inputs/CustomSelect";
import CustomButton from "../../Inputs/CustomButton";
import CustomLookup from "../../Inputs/CustomLookup";
import CustomTextArea from "../../Inputs/CustomTextArea";
import "./AddUser.css";
import { userSchema } from "../../../Schemas/user";
import { useDispatch, useSelector } from "react-redux";
import { notificationActions } from "../../../store/nofitication";
import config from "../../../utils/config.json";
import { AuthContext } from "../../../context/auth-context";
import { sidebarActions } from "../../../store/sidebar";
import { companiesActions } from "../../../store/companies";

const AddUser = (props) => {

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [department, setDepartment] = useState("CSD");
  const [isLoaded, setIsLoaded] = useState(true);
  const [error, setError] = useState("");
  const [company, setCompany] = useState();
  const companies = useSelector((state) => state.companies.list);
  const [askcompany, setAskcompany] = useState(false);

  const dispatch = useDispatch();
  const auth = useContext(AuthContext);

  useEffect(() => {
    setError();
  }, [name, email, password, department]);

  const departments = [
    { label: "CSD", value: "CSD" },
    { label: "Calibration", value: "Calibration" },
    { label: "Accounts", value: "Accounts" },
    { label: "Client", value: "Client" },
    { label: "Manager", value: "Manager" },
  ];

  useEffect(() => {
    if (department === "Client") {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ labId: auth.labId }),
      };
      const errornotification = {
        title: "Error while getting Companies!!",
        description: "Getting list of companies from server failed!!",
        icon: "error",
        state: true,
        timeout: 15000,
      };
      fetch(config.Calibmaster.URL + "/api/customers/list", requestOptions)
        .then(async (response) => {
          const data = await response.json();

          if (data) {
            if (data.code === 200) {
              //console.log(data);
              dispatch(companiesActions.changecompanies(data.data));
            } else {
              dispatch(
                notificationActions.changenotification(errornotification)
              );
            }
          } else {
            dispatch(notificationActions.changenotification(errornotification));
          }
        })
        .catch((err) => {
          dispatch(notificationActions.changenotification(errornotification));
        });
      setAskcompany(true);
    } else {
      setAskcompany(false);
    }
  }, [department]);

  const adduserHandler = async () => {
    setIsLoaded(false);
    let newuser;

    if (department == "Client") {
      if (company && company.customer_id) {
        newuser = {
          name,
          email,
          password,
          department,
          companyId: company.customer_id,
          labId: auth.labId,
        };
      } else {
        setError("Company must be selected in order to register Client User!!");
      }
    } else {
      newuser = {
        name,
        email,
        password,
        department,
        labId: auth.labId,
      };
    }

    const isValid = await userSchema.isValid(newuser);
    // return console.log(newuser, isValid);

    if (!isValid) {
      if (password.length < 8 && name && email)
        setError("Password must be minimum 8 characters and above");
      else setError("Input Validation Failed!!");
      setIsLoaded(true);
      return;
    }

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify(newuser),
    };

    const errornotification = {
      title: "Error while Adding User!!",
      description: name,
      icon: "error",
      state: true,
      timeout: 15000,
    };
    fetch(config.Calibmaster.URL + "/api/users/adduser", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setIsLoaded(true);
        //console.log(data);
        if (data) {
          if (data.code === 200) {
            const newNotification = {
              title: "User Added Successfully",
              description: name,
              icon: "success",
              state: true,
              timeout: 15000,
            };
            dispatch(notificationActions.changenotification(newNotification));
            setName();
            setEmail();
            setPassword();
            setDepartment("CSD");
            dispatch(sidebarActions.changesidebar("Users"));
          } else {
            dispatch(notificationActions.changenotification(errornotification));
            setError(data.message);
          }
        } else {
          dispatch(notificationActions.changenotification(errornotification));
          setError("Error while Adding User");
        }
      })
      .catch((err) => {
        dispatch(notificationActions.changenotification(errornotification));
        setError("Error while Adding User");
      });
  };

  return (
    <div className="add__user__container">
      <Card className="add__user__card">

        <div className="add__user__label">
          <h3>Add User</h3>
        </div>

        <div className="add__user__form">

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

            <input
              type="email"
              id="Email"
              value={email}
              style={{
                height: 0, width: 0, border: 0
              }}
            />

          </div>

          <div className="add__user__item">
            <input
              type="password"
              id="password"
              value={password}
              style={{
                height: 0, width: 0, border: 0
              }}
            />
            <CustomInput
              label="Password"
              type="password"
              value={password}
              onchange={(v) => setPassword(v)}
              disabled={false}
              required={true}
            />
            <input
              type="password"
              id="password"
              value={password}
              style={{
                height: 0, width: 0, border: 0
              }}
            />
          </div>

          <div className="add__user__item">
            <CustomSelect
              label="Role"
              options={departments}
              required={true}
              value={department}
              onselect={(v) => setDepartment(v)}
            />
          </div>

          <p className="red center">{error}</p>

          {!isLoaded ? <Spinner size="medium" /> : null}

          {askcompany ? (
            <div className="add__user__item">
              <CustomLookup
                options={companies}
                onselect={(v) => setCompany(v)}
                label={"Customer"}
                required={true}
              />
            </div>
          ) : null}

          {askcompany ? (
            <div className="add__user__item">
              <CustomTextArea
                label="Customer Address"
                value={
                  company
                    ? company.address1 +
                    ", " +
                    company.address2 +
                    ", " +
                    company.address3
                    : ""
                }
                rows={5}
                required={true}
                disabled={true}
              />
            </div>
          ) : null}

          <div className="add__user__item">
            <CustomButton
              label="Add User"
              variant="success"
              onclick={adduserHandler}
            />
          </div>

        </div>
      </Card>
    </div>
  );
};

export default AddUser;
