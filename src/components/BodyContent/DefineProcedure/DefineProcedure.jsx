import React, { useContext, useEffect, useState } from 'react';
import { Card, Input, Button, Select, TableWithBrowserPagination, Column, } from 'react-rainbow-components';
import { notificationActions } from '../../../store/nofitication';
import { AuthContext } from '../../../context/auth-context';
import { useDispatch, useSelector } from 'react-redux';
import config from "../../../utils/config.json";
import { sidebarActions } from '../../../store/sidebar';
import AddMasterEquipments from './MasterEquipments/AddMasterEquipments';
import ListMasterEquipments from './MasterEquipments/ListMasterEquipments';
import VerticalTable from './Add_Tables/VerticalTable';

import "./Styles/DefineProcedure.css";
import "./Styles/mega-style.css";

import { umpListActions } from '../../../store/umpItemsList';

// *** Temp. Import
// import VerticalTable1 from "./Micrometer_Tables/VerticalTable1";
// import VerticalTable2 from "./Micrometer_Tables/VerticalTable2";

const DefineProcedure = () => {

    // *** State Management Hooks *** 
    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    // *** List Of Uncertainty Parameters from Redux Store ***
    const umpListItems = useSelector((state) => state.umpListItems.list);

    // *** State for store values ***
    const [calibrationProcedure, setCalibrationProcedure] = useState("");
    const [refStd, setRefStd] = useState("");

    const [validity, setValidity] = useState("");
    const [traceability, setTraceability] = useState("");
    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const [atmosphericPressure, setAtmosphericPressure] = useState("");

    const [instrumentList, setInstrumentList] = useState([]);
    const [instrumentValue, setInstrumentValue] = useState("");

    // *** State for handle errors ***
    const [calibrationProcedureErr, setCalibrationProcedureErr] = useState("");
    const [refStdErr, setRefStdErr] = useState("");

    const [validityErr, setValidityErr] = useState("");
    const [traceabilityErr, setTraceabilityErr] = useState("");
    const [temperatureErr, setTemperatureErr] = useState("");
    const [humidityErr, setHumidityErr] = useState("");
    const [atmosphericPressureErr, setAtmosphericPressureErr] = useState("");
    const [instrumentValueErr, setInstrumentValueErr] = useState("");

    // *** State for remarks ***
    const [remarks, setRemarks] = useState(["", ""]);

    // *** State for Master Equipments ***
    const [masterList, setMasterList] = useState([]);
    const [addEquipmets, setAddEquipmets] = useState([]);
    const [masterListError, setMasterListError] = useState("");
    const [loading, setloading] = useState(false);

    // *** State For Manage VerticalTable Component ***
    const [mainArray, setMainArray] = useState([]);
    const [uniqueTableID, setUniqueTableID] = useState(new Date().getTime());

    // *** State For Manage Uncertainty Parameters ***
    const [selectedUMPList, setSelectedUMPList] = useState([]);

    // *** shift each tables from child to mainArray *** 
    function setArraydata(eachBodyData) {

        setMainArray((oldArray) => {

            let isAvailable = false

            oldArray.map((item) => {
                if (item.unique_id == eachBodyData.unique_id) {
                    isAvailable = true;
                }
            });
            console.log(isAvailable);

            const updateArray = oldArray.map((eachRow) => {
                if (eachRow.unique_id == eachBodyData.unique_id) {
                    return {
                        ...eachBodyData
                    }
                } else {
                    return eachRow;
                }
            });

            if (isAvailable) {
                return updateArray;
            } else {
                return [...oldArray, eachBodyData];
            }
        })
    }

    // *** Function to delete table from anywhere ***
    const deleteTable = (unique_id) => {

        setTables((oldArray) => {
            const updateArray = oldArray?.filter((eachArr, index) => eachArr.unique_id != unique_id);
            return updateArray
        })

        setMainArray((oldArray) => {
            const updateArray = oldArray?.filter((eachArr, index) => {
                return eachArr.unique_id !== unique_id;
            });
            return updateArray
        })
    };

    const [tables, setTables] = useState([
        {
            eachComponent: <VerticalTable
                key={0}
                fromId={0}
                table_type="vertical"
                mainArray={mainArray}
                setMainArray={setMainArray}
                setArraydata={setArraydata}
                deleteTable={deleteTable}
                unique_id={uniqueTableID}
            />,
            unique_id: uniqueTableID
        }
    ]);

    // *** Fetch InstrumentType ***
    const fetchinstrumentType = async () => {

        try {
            setloading(true);

            const getResponse = await fetch(config.Calibmaster.URL + "/api/instrument-types/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ lab_id: auth.labId })
            });

            let response = await getResponse.json();
            const { data } = response

            let newArray = [{ value: '', label: 'Select' }];

            await data.map((item, index) => {
                newArray[index + 1] = {
                    value: item.instrument_type_id,
                    label: item.instrument_full_name
                }
            });
            setInstrumentList(newArray);

            setloading(false);

            const newNotification = {
                title: "Instrument Type List fetched Successfully",
                description: "",
                icon: "success",
                state: true,
                timeout: 1500,
            };
            dispatch(notificationActions.changenotification(newNotification));
        } catch (error) {
            console.log(error);

            setloading(false);

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

    // *** Fetch MasterLists ***
    const fetchMasterLists = async () => {
        try {

            setloading(true);

            const data = await fetch(config.Calibmaster.URL + "/api/master-list-equipments/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ lab_id: auth.labId })
            });

            let response = await data.json();
            // console.log(response);

            if (response?.code == 200) {
                setMasterList(response?.data);

                setloading(false);
                const newNotification = {
                    title: response?.message,
                    icon: "success",
                    state: true,
                    timeout: 1500,
                };
                return dispatch(notificationActions.changenotification(newNotification));
            } else {
                setloading(false);
                const newNotification = {
                    title: "Failed to fetch master list",
                    icon: "error",
                    state: true,
                    timeout: 1500,
                };
                return dispatch(notificationActions.changenotification(newNotification));
            }
        } catch (error) {
            console.log(error);
            const newNotification = {
                title: "Something went wrong",
                icon: "error",
                state: true,
                timeout: 1500,
            };
            dispatch(notificationActions.changenotification(newNotification));
        }
    }

    useEffect(() => {
        fetchinstrumentType();
        fetchMasterLists();
    }, []);

    // *** Function for add table ***
    const addVerticalTable = () => {
        const newKey = tables.length;
        const unique_id = new Date().getTime()
        if (tables.length < 50) {
            setTables([
                ...tables,
                {
                    eachComponent: <VerticalTable
                        key={newKey}
                        fromId={newKey}
                        table_type="vertical"
                        mainArray={mainArray}
                        setMainArray={setMainArray}
                        setArraydata={setArraydata}
                        deleteTable={deleteTable}
                        unique_id={unique_id}
                    />,
                    unique_id: unique_id
                }
            ]);
        } else {
            alert("Max 50 table you can add");
        }
    };

    // *** Add Remarks ***
    const addRemarksHandler = () => {
        const newRemarks = [...remarks, ""];
        setRemarks(newRemarks);
    }

    // *** Add Remarks Value ***
    const remarkChangeHandler = (value, i) => {
        const inputData = [...remarks];
        inputData[i] = value.target.value;
        setRemarks(inputData);
    }

    // *** Delete Remarks ***
    const deleteRemarkHandler = (i) => {
        const deleteValue = [...remarks];
        deleteValue.splice(i, 1);
        setRemarks(deleteValue);
    }

    // *** Add Procedure Handler ***
    const handleSubmit = async () => {

        try {

            if (mainArray.length >= 1 && mainArray.length == tables.length) {

                // sorting by fromId
                mainArray.sort((currentItem,nextItem)=>Number(currentItem.fromId)-Number(nextItem.fromId));   

                for (let i = 0; i < mainArray.length; i++) {
                    const tableKeyName = `table-${i + 1}`;
                    let TKey = `T${i + 1}`;

                    const eachTableComponent = mainArray[i];
                    let { cell_texts } = mainArray[i];

                    if (Array.isArray(cell_texts)) {
                        const copyCellText = [...cell_texts];
                        cell_texts = {};


                        copyCellText.map((row, rowIndex) => {
                            for (const key in row) {
                                row[TKey + key] = row[key]
                                delete row[key];
                            }
                        });

                        cell_texts[tableKeyName] = copyCellText;
                        eachTableComponent.cell_texts = cell_texts;
                    }
                }
                // return console.log(mainArray);

                if (calibrationProcedure == "") {
                    setCalibrationProcedureErr("Please enter Calibration Procedure");
                    return;
                }

                if (refStd == "") {
                    setRefStdErr("Please enter REF STD");
                    return;
                }

                if (validity == "") {
                    setValidityErr("Please enter validity");
                    return;
                }

                if (traceability == "") {
                    setTraceabilityErr("Please enter traceability");
                    return;
                }

                if (instrumentValue == "") {
                    setInstrumentValueErr("Please enter a Instrument");
                    return;
                }

                if (addEquipmets.length == 0) {
                    setMasterListError("Please select a Master Equipment.");
                    return;
                }

                const uncertainty_parameters_id_array = [];

                umpListItems.map((item) => {
                    uncertainty_parameters_id_array.push({ uncertainty_master_parameter_id: item.uncertainty_master_parameter_id });
                });

                const bodyData = {
                    lab_id: auth.labId,
                    instrument_type_id: instrumentValue,
                    calibration_procedure: calibrationProcedure,
                    ref_std: refStd,

                    validity: validity,
                    traceability: traceability,

                    temperature: temperature,
                    humidity: humidity,
                    atmospheric_pressure: atmosphericPressure,

                    mainArray,
                    master_list_equipments: addEquipmets,
                    remarks,
                    uncertainty_master_parameters: uncertainty_parameters_id_array
                };

                let response = await fetch(config.Calibmaster.URL + "/api/design-procedures/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(bodyData)
                });
                response = await response.json();
                // return console.log(response);

                const newNotification = {
                    title: "Defined Procedure added Successfully",
                    icon: "success",
                    state: true,
                    timeout: 15000,
                };
                dispatch(notificationActions.changenotification(newNotification));
                dispatch(umpListActions.removeAllUMPItem());
                dispatch(sidebarActions.changesidebar("List-Defined-Procedure"));
            } else {
                alert("Please Set Minimum One Table From.");
            }
        } catch (error) {
            console.log(error);
            const newNotification = {
                title: "Something went wrong",
                description: "",
                icon: "error",
                state: true,
            };
            dispatch(notificationActions.changenotification(newNotification));
        }
    }

    return (
        <div className="main_container">

            {/* Top Input Fields */}
            <Card className="card_container_1">

                <h3 className='title'>Define Procedure</h3>

                {/* CALIBRATION PROCEDURE */}
                <div className="input_group">
                    <Input
                        label="CALIBRATION PROCEDURE"
                        placeholder="CALIBRATION PROCEDURE"
                        className="eachInput"
                        required={true}
                        value={calibrationProcedure}
                        onChange={(e) => {
                            setCalibrationProcedure(e.target.value);
                            setCalibrationProcedureErr("")
                        }}
                    />
                    {calibrationProcedureErr && <span style={{ color: "red" }}>{calibrationProcedureErr}</span>}
                </div>

                {/* REF.STD */}
                <div className="input_group">
                    <Input
                        label="REF.STD"
                        placeholder="REF.STD"
                        className="eachInput"
                        required={true}
                        value={refStd}
                        onChange={(e) => {
                            setRefStd(e.target.value);
                            setRefStdErr("")
                        }}
                    />
                    {refStdErr && <span style={{ color: "red" }}>{refStdErr}</span>}
                </div>

                {/* VALIDITY */}
                <div className="input_group">
                    <Input
                        label="VALIDITY"
                        placeholder="VALIDITY"
                        className="eachInput"
                        required={true}
                        value={validity}
                        onChange={(e) => {
                            setValidity(e.target.value);
                            setValidityErr("");
                        }}
                    />
                    {validityErr && <span style={{ color: "red" }}>{validityErr}</span>}
                </div>

                {/* TRACEABILITY */}
                <div className="input_group">
                    <Input
                        label="TRACEABILITY"
                        placeholder="TRACEABILITY"
                        className="eachInput"
                        required={true}
                        value={traceability}
                        onChange={(e) => {
                            setTraceability(e.target.value);
                            setTraceabilityErr("")
                        }}
                    />
                    {traceabilityErr && <span style={{ color: "red" }}>{traceabilityErr}</span>}
                </div>

                {/* TEMPERATURE */}
                <div className="input_group">
                    <Input
                        label="TEMPERATURE (°C)"
                        placeholder="TEMPERATURE (°C)"
                        className="eachInput"
                        required={false}
                        value={temperature}
                        onChange={(e) => {
                            setTemperature(e.target.value);
                            setTemperatureErr("")
                        }}
                    />
                    {temperatureErr && <span style={{ color: "red" }}>{temperatureErr}</span>}
                </div>

                {/* HUMIDITY */}
                <div className="input_group">
                    <Input
                        label="HUMIDITY (RH %)"
                        placeholder="HUMIDITY (RH %)"
                        className="eachInput"
                        required={false}
                        value={humidity}
                        onChange={(e) => {
                            setHumidity(e.target.value);
                            setHumidityErr("")
                        }}
                    />
                    {humidityErr && <span style={{ color: "red" }}>{humidityErr}</span>}
                </div>

                {/* Atmospheric Pressure */}
                <div className="input_group">
                    <Input
                        label="Atmospheric Pressure"
                        placeholder="Atmospheric Pressure"
                        className="eachInput"
                        required={false}
                        value={atmosphericPressure}
                        onChange={(e) => {
                            setAtmosphericPressure(e.target.value);
                            setAtmosphericPressureErr("")
                        }}
                    />
                    {atmosphericPressureErr && <span style={{ color: "red" }}>{atmosphericPressureErr}</span>}
                </div>

                {/* Select Instrument */}
                <div className="input_group">
                    <Select
                        label="Select Instrument"
                        options={instrumentList}
                        required={true}
                        className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                        onChange={(e) => {
                            setInstrumentValue(e.target.value);
                            setInstrumentValueErr("");
                        }}
                    />
                    {instrumentValueErr && <span style={{ color: "red" }}>{instrumentValueErr}</span>}
                </div>

            </Card>

            {/* Add Master Equipments */}
            <Card className="card_container_1">

                <h3 className='title'>Add Master Equipments</h3>

                {/* CALIBRATION PROCEDURE */}
                <div className="input_group">
                    <AddMasterEquipments
                        masterList={masterList}
                        addEquipmets={addEquipmets}
                        setAddEquipmets={setAddEquipmets}
                        setMasterListError={setMasterListError}
                    />
                </div>
                {masterListError && <span style={{ color: 'red' }}>{masterListError}</span>}

                <ListMasterEquipments
                    addEquipmets={addEquipmets}
                    setAddEquipmets={setAddEquipmets}
                />
            </Card>

            {/* Table Area  */}
            <div className="card_container_2" style={{ padding: 0 }}>

                <h4 className='title' style={{ textAlign: 'left' }}>Calibration Result:</h4>

                <div className="main_controller_btn_area">
                    <Button
                        label="Add Vertical Table"
                        variant="success"
                        className="rainbow-m-around_medium"
                        onClick={addVerticalTable}
                    />
                </div>

                {/* Render all tables */}
                {tables.map((table, index) => (
                    <div key={index} className="each_card">
                        {table.eachComponent}
                    </div>
                ))}
            </div>

            {/* Remarks Card */}
            <Card className="card_container_1">

                <h3 className='title'>Add Remarks</h3>

                <Button
                    label="Add Remarks"
                    onClick={() => addRemarksHandler()}
                    variant="success"
                    className="rainbow-m-around_medium"
                />

                <section className='remarks_section'>
                    {
                        remarks.map((data, i) => {
                            return (
                                <div key={i} style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
                                    <Input
                                        placeholder="Enter Remarks"
                                        style={{ width: "30rem" }}
                                        value={data}
                                        onChange={(e) => remarkChangeHandler(e, i)}
                                    />
                                    <Button
                                        label="Delete"
                                        variant="destructive"
                                        onClick={() => deleteRemarkHandler(i)}
                                    />
                                </div>
                            )
                        })
                    }
                </section>
            </Card>

            <Button
                label="Create"
                onClick={handleSubmit}
                variant="brand"
                className="rainbow-m-around_medium"
            />
        </div>
    )
};

export default DefineProcedure;