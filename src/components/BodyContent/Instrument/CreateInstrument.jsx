import React, { useContext, useEffect, useState } from 'react';
import { Card, Spinner, Select, Input } from 'react-rainbow-components';
import CustomInput from '../../Inputs/CustomInput';
import CustomButton from '../../Inputs/CustomButton';
import { useDispatch } from 'react-redux';
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from '../../../context/auth-context';
import { sidebarActions } from '../../../store/sidebar';
import { populateUomData, populateDisciplineData, populateGroupData } from './HelperFunction';

const CreateInstrument = () => {

    const [name, setName] = useState("");
    const [UOM, setUOM] = useState([]);
    const [Discipline, setDiscipline] = useState([]);
    const [Group, setGroup] = useState([]);

    const [uomValue, setUomValue] = useState("");
    const [disciplineValue, setDisciplineValue] = useState("");
    const [groupValue, setGroupValue] = useState("");

    const [enableGroup, setenableGroup] = useState(true);

    const [loading, setloading] = useState(false);
    const [error, setError] = useState("");

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [nameErr, setNameErr] = useState("");
    const [uomErr, setuomErr] = useState("");
    const [groupErr, setGroupErr] = useState("");

    async function fetchData() {
        setloading(true);

        try {
            const uomResonse = await fetch(config.Calibmaster.URL + "/api/uom/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            }).then((res) => res.json());
            let getUomData = await populateUomData(uomResonse.data);
            setUOM(getUomData);


            const disciplineResponse = await fetch(config.Calibmaster.URL + "/api/instrument-discipline/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            }).then((res) => res.json());
            let getDisciplineData = await populateDisciplineData(disciplineResponse.data);
            setDiscipline(getDisciplineData);

            setloading(false);
        } catch (error) {
            const errNotification = {
                title: "Something went wrong",
                description: "",
                icon: "error",
                state: true,
                timeout: 1500,
            };
            dispatch(notificationActions.changenotification(errNotification));
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    const disciplineHandler = async (id) => {

        try {
            if (id != "") {
                setloading(true);
                setDisciplineValue(id);

                const groupResponse = await fetch(config.Calibmaster.URL + `/api/instrument-groups/fetch/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + auth.token,
                    },
                }).then((res) => res.json());
                let getGroupData = await populateGroupData(groupResponse.data)


                setGroup(getGroupData);
                setenableGroup(false);
                setloading(false);
            } else {
                setDisciplineValue("")
                setGroupValue("");
                setenableGroup(true);
                setloading(false);
                return;
            }
        } catch (error) {
            const errNotification = {
                title: "Error While Getting Instrument Group!!!",
                icon: "error",
                state: true,
                timeout: 15000,
            };
            dispatch(notificationActions.changenotification(errNotification));
            setError("Error While Getting Instrument Group!!!");
            setloading(false);
        }
    }

    const addInstrument = async () => {
        try {
            setloading(true);

            if (name == "") {
                setNameErr("Instrument Name is Required");
                setloading(false);
                return;
            }

            if (uomValue == "") {
                setuomErr("UOM Name is Required");
                setloading(false);
                return;
            }

            if (groupValue == "") {
                setGroupErr("Group Name is Required");
                setloading(false);
                return;
            }

            const newInstrument = {
                instrument_name: name,
                instrument_uom_id: parseInt(uomValue),
                instrument_discipline_id: disciplineValue ? parseInt(disciplineValue) : "",
                instrument_group_id: groupValue ? parseInt(groupValue) : "",
                lab_id: auth.labId,
            };

            const response = await fetch(config.Calibmaster.URL + "/api/instrument/create", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify(newInstrument)
            });
            const data = await response.json();

            if (response.ok) {
                const successNotification = {
                    title: "Instrument Added Successfully",
                    icon: "success",
                    state: true,
                    timeout: 15000,
                };
                dispatch(notificationActions.changenotification(successNotification));
                dispatch(sidebarActions.changesidebar("List-Instrument"));
                setError("");
              } else {
                setError(data?.message);
              }
          
            setloading(false);
        } catch (error) {
            
            const errNotification = {
                title: "Error while Instrument Lab!!",
                icon: "error",
                state: true,
                timeout: 15000,
            };
            dispatch(notificationActions.changenotification(errNotification));
            setError("Error While Instrument Lab!!");
            setloading(false);
        }
    }

    return (
        <div className="masterlist">
            <div className="add__masterlist__container">

                <Card className="add__user__card">

                    <div className="add__user__label">
                        <h3>Add Instrument</h3>
                    </div>

                    {/* Instrument Name Start */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Instrument Name"
                                placeholder="Instrument Name"
                                type="text"
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setNameErr("");
                                }}
                                disabled={false}
                                required={true}
                            />
                            <span className="red">{nameErr}</span>
                        </div>
                    </div>

                    {/* UOM Drop Down Start */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Select UOM"
                                options={UOM}
                                required={true}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                onChange={(e) => {
                                    setUomValue(e.target.value);
                                    setuomErr("");
                                }}
                            />
                            <span className="red">{uomErr}</span>
                        </div>
                    </div>
                    {/* UOM Drop Down End */}

                    {/* Discipline Drop Down */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Select Discipline"
                                options={Discipline}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                onChange={(e) => {
                                    disciplineHandler(e.target.value)
                                    setGroupErr("")}
                                }
                            />
                        </div>
                    </div>

                    {/* Group Drop Down */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Select Group"
                                options={Group}
                                required={true}
                                value={!enableGroup && groupValue}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                disabled={enableGroup}
                                onChange={(e) => {
                                    setGroupValue(e.target.value)
                                    setGroupErr("")
                                }}
                            />
                              <span className="red">{groupErr}</span>
                        </div>
                    </div>

                    <div className="add__user__item">
                        <CustomButton
                            label="Add Instrument"
                            variant="success"
                            onclick={addInstrument}
                        />
                    </div>

                    <p className="red center w100">{error}</p>

                    {(loading) ? <Spinner size="medium" /> : ""}

                </Card>

            </div>
        </div>
    )
}

export default CreateInstrument;