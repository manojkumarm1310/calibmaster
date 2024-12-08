import React, { useContext, useEffect, useState } from 'react';
import { Card, Button, CheckboxToggle, Select } from 'react-rainbow-components';
import { useDispatch } from 'react-redux';
import config from "../../../../utils/config.json";
import { notificationActions } from "../../../../store/nofitication";
import { AuthContext } from '../../../../context/auth-context';
import { sidebarActions } from '../../../../store/sidebar';
import '../Styles/common.css';

const CreateCertificateConfig = () => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [labs, setLabs] = useState([]);
    const [formDiv, setFormDiv] = useState([]);

    const fetchConfig = async () => {

        try {
            let response = await fetch(config.Calibmaster.URL + "/api/cms-setting/fetch-cms-certificate", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            });

            response = await response.json();
            console.log(response);

            if (response?.result?.length > 0) {

                const { result, labList } = response;
                setFormDiv(result);

                let newArray = [{ value: '', label: 'Select' }];

                await labList.map((item, index) => {
                    newArray[index + 1] = {
                        value: item.lab_id,
                        label: item.lab_name
                    }
                })
                setLabs(newArray);

                const newNotification = {
                    title: "CMS Certificate Settings fetched successfully.",
                    description: "",
                    icon: "success",
                    state: true,
                    timeout: 1500,
                };
                return dispatch(notificationActions.changenotification(newNotification));
            } else {
                const newNotification = {
                    title: "Something went wrong",
                    description: "",
                    icon: "error",
                    state: true,
                    timeout: 1500,
                };
                dispatch(notificationActions.changenotification(newNotification));
            }
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

    useEffect(() => {
        fetchConfig();
    }, []);

    return (
        <div className="masterlist">
            <div className="add__masterlist__container">
                {
                    formDiv.map((item, index) => {
                        return <EachForm
                            key={index} labs={labs} configInfo={item} auth={auth}
                            dispatch={dispatch} notificationActions={notificationActions}
                        />
                    })
                }
            </div>
        </div>
    )
}

export default CreateCertificateConfig;

const EachForm = ({ labs, configInfo, auth, dispatch, notificationActions }) => {

    const [labId, setLabId] = useState("");
    const [enable, setEnable] = useState(false);

    const [labError, setLabError] = useState("");
    const [enableError, setEnableError] = useState("");

    const createConfigHandler = async () => {

        try {

            if (labId == "") {
                setLabError("Please Select a Lab.");
                return false;
            }

            const { setting_name, setting_lable, setting_description, setting_value } = configInfo;

            const bodyData = {
                lab_id: labId,
                setting_name: setting_name,
                setting_lable: setting_lable,
                setting_description: setting_description,
                setting_value: enable ? "YES" : "NO",
                is_enable: enable
            };

            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify(bodyData)
            };

            const response = await fetch(config.Calibmaster.URL + "/api/cms-permissions-setting/create", requestOptions);
            const data = await response.json();
            console.log(data);

            const newNotification = {
                title: "Configuration enabled Successfully",
                description: "",
                icon: "success",
                state: true,
                timeout: 15000,
            };
            dispatch(notificationActions.changenotification(newNotification));
        } catch (err) {
            const newNotification = {
                title: "Something went wrong",
                description: "",
                icon: "error",
                state: true,
            };
            dispatch(notificationActions.changenotification(newNotification));
        }
    }

    return <>
        <Card className='card_style'>

            <div className="label_header">
                <h3>{configInfo.setting_lable}</h3>
            </div>

            <div className="form_container">
                <div className="each_form">
                    <Select
                        label="Select Lab"
                        options={labs}
                        style={{ maxWidth: 200, margin: 'auto' }}
                        onChange={(e) => {
                            setLabId(e.target.value); setLabError("");
                        }}
                    />
                    {labError && <span className="red">{labError}</span>}
                </div>

                <div className="each_form" style={{
                    display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center'
                }}>
                    <CheckboxToggle
                        label="Enable Configuration"
                        value={enable}
                        onChange={() => {
                            setEnable(!enable); setEnableError("");
                        }}
                    />
                    {enableError && <span className="red">{enableError}</span>}
                </div>

                <div className="each_form">
                    <Button
                        label="Enable Or Update"
                        variant="success"
                        className="rainbow-m-around_medium"
                        onClick={createConfigHandler}
                    />
                </div>
            </div>

        </Card>
    </>
}