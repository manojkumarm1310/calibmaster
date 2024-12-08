import React, { useContext, useState } from 'react';
import { Button, Card, FileSelector, Input, Modal, Select } from 'react-rainbow-components';
import { useDispatch } from 'react-redux';
import { AuthContext } from '../../../context/auth-context';
import config from "../../../utils/config.json";
import { notificationActions } from '../../../store/nofitication';
import "./employee.css";

const EditEmployee = ({ isOpen, onRequestClose, empData }) => {

    // ***  State Management Hooks *** 
    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    // *** State for input fields ***
    const [empId, setEmpId] = useState(empData?.employee_id);
    const [empTitle, setEmpTitle] = useState(empData?.employee_title);
    const [empFullName, setEmpFullName] = useState(empData?.employee_full_name);
    const [empRole, setEmpRole] = useState(empData?.employee_role);
    const [empEnable, setempEnable] = useState(empData?.employee_enable);
    const [files, setFiles] = useState(null);

    // *** State for input fields ***
    const [empTitleError, setEmpTitleError] = useState("");
    const [empFullNameError, setEmpFullNameError] = useState("");
    const [empRoleError, setEmpRoleError] = useState("");
    const [fileError, setFileError] = useState("");

    const handleSubmit = async () => {

        try {

            if (empTitle == "") {
                setEmpTitleError("Employee Title is required.");
                return;
            }
            if (empFullName == "") {
                setEmpFullNameError("Employee Full Name is required.");
                return;
            }
            if (empRole == "") {
                setEmpRoleError("Employee Role is required.");
                return;
            }

            const data = new FormData();
            data.append("employee_id", empId);
            data.append("lab_id", auth.labId);
            data.append("employee_title", empTitle);
            data.append("employee_full_name", empFullName);
            data.append("employee_role", empRole);
            data.append("employee_enable", empEnable);

            if (files?.length == 1) {
                data.append("employee_signature", files[0]);
            }

            const requestOptions = {
                method: "POST",
                headers: {
                    Authorization: "Bearer " + auth.token,
                },
                body: data,
            };

            let response = await fetch(config.Calibmaster.URL + "/api/employee-master/update-emplyee", requestOptions);
            response = await response.json();
            console.log(response);

            const newNotification = {
                title: response?.response,
                description: "",
                icon: "success",
                state: true,
                timeout: 15000,
            };
            dispatch(notificationActions.changenotification(newNotification));
            onRequestClose();
        } catch (error) {
            console.log(error);
            const newNotification = {
                title: "Something went wrong",
                description: "",
                icon: "error",
                state: true,
                timeout: 1500,
            };
            dispatch(notificationActions.changenotification(newNotification));
        }
    }

    return (
        <Modal
            id="modal-2"
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            style={{ width: "90%" }}
            title="Edit Employee"
            footer={
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button label="Update" variant="brand" onClick={handleSubmit} />
                </div>
            }
        >
            <div className="main_container">

                {/* Top Input Fields */}
                <Card className="card_container_1">

                    <h3 className='title'>Create Employee</h3>

                    {/* Employee Title */}
                    <div className="input_group">
                        <Input
                            label="Employee Title"
                            placeholder="Employee Title"
                            className="eachInput"
                            required={true}
                            value={empTitle}
                            onChange={(e) => {
                                setEmpTitle(e.target.value);
                            }}
                        />
                        {empTitleError && <span className='err'>{empTitleError}</span>}
                    </div>

                    {/* Employee Full Name */}
                    <div className="input_group">
                        <Input
                            label="Employee Full Name"
                            placeholder="Employee Full Name"
                            className="eachInput"
                            required={true}
                            value={empFullName}
                            onChange={(e) => {
                                setEmpFullName(e.target.value);
                            }}
                        />
                        {empFullNameError && <span className='err'>{empFullNameError}</span>}
                    </div>

                    {/* Employee Role */}
                    <div className="input_group">
                        <Input
                            label="Employee Role"
                            placeholder="Employee Role"
                            className="eachInput"
                            required={true}
                            value={empRole}
                            onChange={(e) => {
                                setEmpRole(e.target.value)
                            }}
                        />
                        {empRoleError && <span className='err'>{empRoleError}</span>}
                    </div>

                    {/* Employee Enable */}
                    <div className="input_group">
                        <Select
                            label="Employee Enable"
                            options={[
                                { value: 'YES', label: 'YES' },
                                { value: 'NO', label: 'NO' }
                            ]}
                            onChange={(e) => {
                                console.log(e.target.value)
                            }}
                        />
                    </div>

                    {/* employee Signature */}
                    <div className="input_group">
                        <FileSelector
                            className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto file_selector_width"
                            label="File selector"
                            placeholder="Drag & Drop or Click to Browse"
                            bottomHelpText="Select only one file"
                            onChange={(e) => {
                                console.log(e);
                                setFiles(e);
                            }}
                        />
                        {fileError && <span className='err'>{fileError}</span>}
                    </div>

                </Card>

            </div>
        </Modal>
    )
}

export default EditEmployee;