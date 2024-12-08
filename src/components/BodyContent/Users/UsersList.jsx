import { useContext, useEffect, useState } from "react";
import { TableWithBrowserPagination, Column, Button, Spinner, MenuItem, Input, CheckboxToggle } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faLock, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { usersActions } from "../../../store/users";
import EditUserModal from "./EditUserModal";
import CustomSearch from "../../Inputs/CustomSearch";
import ResetPasswordModal from "./ResetPasswordModal";
import "./UsersList.css";
import ClientUserModal from "./ClientUserModal";


const UsersList = (props) => {

  const [modifiedUsers, setModifiedUsers] = useState();
  const [isLoaded, setIsLoaded] = useState(true);
  const [editUserModal, setEditUserModal] = useState(false);
  const [editId, setEditId] = useState();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [userList, setuserList] = useState([]);

  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const users = useSelector((state) => state.users.list);

  const [resetPasswordModal, setResetPasswordModal] = useState(false);

  const [clientUserId, setclientUserId] = useState("");
  const [clientInfo, setClientInfo] = useState({});
  const [clientViewModal, setclientViewModal] = useState(false);

  // ! *** We do not need that ***
  useEffect(() => {
    if (users) {
      const modifiedusers = users.map((v, i) => ({
        ...v,
        sno: i + 1,
      }));
      setModifiedUsers(modifiedusers);
    }
  }, [users]);

  // *** Fetch Users ***
  function fetchUsers() {

    setIsLoaded(false);

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ labId: auth.labId }),
    };

    const errornotification = {
      title: "Error while Getting Users!!",
      description: "Getting List of Users Failed!!",
      icon: "error",
      state: true,
      timeout: 15000,
    };

    fetch(config.Calibmaster.URL + "/api/users/getall", requestOptions)
      .then(async (response) => {
        let data = await response.json();

        if (data) {
          setIsLoaded(true);
          setuserList(data.data);
          dispatch(usersActions.changeusers(data?.data));
        } else {
          setIsLoaded(true);
          dispatch(notificationActions.changenotification(errornotification));
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoaded(true);
        dispatch(notificationActions.changenotification(errornotification));
      });
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // const userdeleteHandler = async (v) => {
  //   setIsLoaded(false);
  //   const requestOptions = {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //       Authorization: "Bearer " + auth.token,
  //     },
  //     body: JSON.stringify({ userId: v, labId: auth.labId }),
  //   };
  //   const errornotification = {
  //     title: "Error while Deleting User!!",
  //     description: "UserId: " + v,
  //     icon: "error",
  //     state: true,
  //     timeout: 15000,
  //   };
  //   fetch(config.Calibmaster.URL + "/api/users/deleteuser", requestOptions)
  //     .then(async (response) => {
  //       const data = await response.json();
  //       setIsLoaded(true);
  //       console.log(data);
  //       if (data) {
  //         if (data.code === 200) {
  //           const newNotification = {
  //             title: "User Deleted Successfully",
  //             description: "UserId: " + v,
  //             icon: "success",
  //             state: true,
  //             timeout: 15000,
  //           };
  //           //console.log(data);
  //           dispatch(usersActions.changeusers(data.data));
  //           dispatch(notificationActions.changenotification(newNotification));
  //         } else {
  //           dispatch(notificationActions.changenotification(errornotification));
  //         }
  //       } else {
  //         dispatch(notificationActions.changenotification(errornotification));
  //       }
  //     })
  //     .catch((err) => {
  //       dispatch(notificationActions.changenotification(errornotification));
  //     });
  // };

  const userEditHandler = (v) => {
    setEditUserModal(true);
    setEditId(v);
  };

  const editmodalHandler = () => {
    const usereditmodal = editUserModal;
    setEditUserModal(!usereditmodal);
  };

  // const EditUser = ({ value }) => (
  //   <Button
  //     variant="neutral"
  //     label="Edit"
  //     onClick={() => userEditHandler(value)}
  //   />
  // );

  // const DeleteUser = ({ value }) => (
  //   <Button
  //     variant="destructive"
  //     label="Disable"
  //     onClick={() => userdeleteHandler(value)}
  //   />
  // );

  const userDisableHandler = async (v) => {
    setIsLoaded(false);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ userId: v, labId: auth.labId }),
    };
    const errornotification = {
      title: "Error while Deleting User!!",
      description: "UserId: " + v,
      icon: "error",
      state: true,
      timeout: 15000,
    };
    fetch(config.Calibmaster.URL + "/api/users/deleteuser", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setIsLoaded(true);
        if (data) {
          if (data.code === 200) {
            const newNotification = {
              title: "User disabled Successfully",
              description: "UserId: " + v,
              icon: "success",
              state: true,
              timeout: 15000,
            };
            //console.log(data);
            fetchUsers();
            dispatch(usersActions.changeusers(data.data));
            dispatch(notificationActions.changenotification(newNotification));
          } else {
            dispatch(notificationActions.changenotification(errornotification));
          }
        } else {
          dispatch(notificationActions.changenotification(errornotification));
        }
      })
      .catch((err) => {
        dispatch(notificationActions.changenotification(errornotification));
      });
  }

  const userEnableHandler = async (v) => {
    setIsLoaded(false);
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ userId: v, labId: auth.labId }),
    };
    const errornotification = {
      title: "Error while Deleting User!!",
      description: "UserId: " + v,
      icon: "error",
      state: true,
      timeout: 15000,
    };
    fetch(config.Calibmaster.URL + "/api/users/enableuser", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        setIsLoaded(true);
        console.log(data);
        if (data) {
          if (data.code === 200) {
            const newNotification = {
              title: "User Enabled Successfully",
              description: "UserId: " + v,
              icon: "success",
              state: true,
              timeout: 15000,
            };
            //console.log(data);
            fetchUsers();
            dispatch(usersActions.changeusers(data.data));
            dispatch(notificationActions.changenotification(newNotification));
          } else {
            dispatch(notificationActions.changenotification(errornotification));
          }
        } else {
          dispatch(notificationActions.changenotification(errornotification));
        }
      })
      .catch((err) => {
        dispatch(notificationActions.changenotification(errornotification));
      });
  }

  // const DeleteUser = ({ value, row }) => {

  //   const enableDisableUserHandler = () => {
  //     if (row.rstatus == 1) {
  //       userDisableHandler(value);
  //     }
  //     else {
  //       userEnableHandler(value);
  //     }
  //   }

  //   return (
  //     <Button
  //       variant={row.rstatus == 1 ? "destructive" : "success"}
  //       label={row.rstatus == 1 ? "Disable" : "Enable"}
  //       onClick={enableDisableUserHandler}
  //     // disabled={row.rstatus === 1}
  //     />
  //   );
  // }



  const passwordResetHandler = (v) => {
    setResetPasswordModal(true);
    setEditId(v.id);
    setclientUserId(v.calibmaster_client_id);
    setClientInfo(v);
  }

  const resetPassword = ({ row }) => (
    <Button
      variant="outline-brand"
      label="Reset Password"
      onClick={() => {
        passwordResetHandler(row);
      }}
    />
  );

  // *** Search by S.No ***
  const searchSNoHandler = async (query) => {
    if (query !== "") {

      const newArr = [...users];

      const result = newArr.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item.slNo);
      });
      setuserList(result)

    } else {
      setuserList([]);
      fetchUsers();
    }
  }

  // ***Search By Name ***
  const searchNameHandler = async (query) => {
    if (query !== "") {

      const newArr = [...users];

      const result = newArr.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item.name);
      });
      setuserList(result)

    } else {
      setuserList([]);
      fetchUsers();
    }
  }

  // *** Search By Email ***
  const searchEmailHandler = async (query) => {
    if (query !== "") {

      const newArr = [...users];

      const result = newArr.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item.email);
      });
      setuserList(result)

    } else {
      setuserList([]);
      fetchUsers();
    }
  }

  // *** Search By Department ***
  const searchDepartmentHandler = async (query) => {
    if (query !== "") {

      const newArr = [...users];

      const result = newArr.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item.department);
      });
      setuserList(result)

    } else {
      setuserList([]);
      fetchUsers();
    }
  }

  const clientInfoHandler = ({ row }) => {
    if (row.department == "Client") {
      return <Button
        variant="success"
        label="View"
        onClick={() => {
          setclientUserId(row.calibmaster_client_id);
          setclientViewModal(true);
        }}
      />
    } else {
      return <Button
        variant="outline-brand"
        label="Not Client"
        disabled
      />
    }
  }

  const closeClientViewModalHandler = () => {
    setclientViewModal(false);
  }
  const toggleUserStatus = (row) => {
    if (row.rstatus === 1) {
      userDisableHandler(row.id);
    } else {
      userEnableHandler(row.id);
    }
  };

  const renderToggle = ({ row }) => {
    return (
      <CheckboxToggle
        value={row.rstatus}
        onChange={() => toggleUserStatus(row)}
      />
    );
  };

  return (
    <div className="users__container">

      <div className="searchers__container">
        <div className="searchers" style={{ padding: "1rem" }}>
          <Input
            label="Search by S.No"
            type="text"
            disabled={false}
            placeholder="Search by S.No"
            onChange={(e) => searchSNoHandler(e.target.value)}
            icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
            iconPosition="right"
          />
        </div>

        <div className="searchers" style={{ padding: "1rem" }}>
          <Input
            label="Search By Name"
            type="text"
            disabled={false}
            placeholder="Search By Name"
            onChange={(e) => searchNameHandler(e.target.value)}
            icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
            iconPosition="right"
          />
        </div>

        <div className="searchers" style={{ padding: "1rem" }}>
          <Input
            label="Search By Email"
            type="text"
            disabled={false}
            placeholder="Search By Email"
            onChange={(e) => searchEmailHandler(e.target.value)}
            icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
            iconPosition="right"
          />
        </div>

        <div className="searchers" style={{ padding: "1rem", marginTop: "1rem" }}>
          <Input
            label="Search By Department"
            type="text"
            disabled={false}
            placeholder="Search By Department"
            onChange={(e) => searchDepartmentHandler(e.target.value)}
            icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
            iconPosition="right"
          />

          <input type="email" id="Email" style={{ height: 0, width: 0, border: 0 }} />
        </div>
      </div>

      <TableWithBrowserPagination
        className="users__table"
        pageSize={5}
        data={userList}
        keyField="id"
      >
        <Column header="S.No" field="slNo" />
        <Column header="Name" field="name" />
        <Column header="Email" field="email" />
        <Column header="Role" field="department" />
        {/* <Column header="Edit" field="id" component={EditUser} /> */}
        {/* <Column header="Disable" field="id" component={DeleteUser} /> */}
        {/* <Column header="Enable/Disable" field="id" component={DeleteUser} /> */}
        <Column header="Enable/Disable" field="rstatus" component={renderToggle} />
        {/* <Column header="Reset Password" field="id" component={resetPassword} /> */}
        <Column header="Client Info" field="id" component={clientInfoHandler} />
        <Column header="ACTION" type="action">
          <MenuItem label="Edit" icon={<FontAwesomeIcon icon={faEdit} />} iconPosition="left" onClick={(event, data) => userEditHandler(data.id)} />
          <MenuItem label="Reset Password" icon={<FontAwesomeIcon icon={faLock} />} iconPosition="left" onClick={(event, data) => passwordResetHandler(data)} />
        </Column>
      </TableWithBrowserPagination>

      {!isLoaded ? <Spinner size="medium" /> : null}

      {editUserModal ? (
        <EditUserModal
          isopen={editUserModal}
          onclose={editmodalHandler}
          userid={editId}
          fetchUsers={fetchUsers}
        />
      ) : null}

      {resetPasswordModal ? (
        <ResetPasswordModal
          isopen={resetPasswordModal}
          onclose={setResetPasswordModal}
          userid={editId}
          clientUserId={clientUserId}
          clientInfo={clientInfo}
        />
      ) : null}

      {clientViewModal ? (
        <ClientUserModal
          isopen={clientViewModal}
          onclose={closeClientViewModalHandler}
          clientUserId={clientUserId}
        />
      ) : ""}


    </div>
  );
};

export default UsersList;
