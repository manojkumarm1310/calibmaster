import React, { useState, useEffect, useContext } from 'react';
import { Button, Modal, Card, Input, Select, ButtonIcon } from 'react-rainbow-components';
import { notificationActions } from '../../../store/nofitication';
import { AuthContext } from '../../../context/auth-context';
import { useDispatch, useSelector } from 'react-redux';
import config from "../../../utils/config.json";
import AddMasterEquipments from './MasterEquipments/AddMasterEquipments';
import ListMasterEquipments from './MasterEquipments/ListMasterEquipments';

import ExistVerticalTable from './Edit_Tables/ExistVerticalTable';

import VerticalTable from './Add_Tables/VerticalTable';

import "./Styles/DefineProcedure.css";
import "./Styles/mega-style.css";

import { umpListActions } from '../../../store/umpItemsList';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClose } from '@fortawesome/free-solid-svg-icons';

const EditDefinedProdedureModal = ({ isOpen, onRequestClose, masterId }) => {

    // ***  State Management Hooks *** 
    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    // *** List Of Uncertainty Parameters from Redux Store ***
    const umpListItems = useSelector((state) => state.umpListItems.list);

    // *** State for store values ***
    const [masterDPId, setMasterDPId] = useState("");
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
    const [remarks, setRemarks] = useState([]);

    // *** State for Master Equipments ***
    const [masterList, setMasterList] = useState([]);
    const [addEquipmets, setAddEquipmets] = useState([]);
    const [masterListError, setMasterListError] = useState("");
    const [loading, setloading] = useState(false);

    // *** State For Master Define Procedure ***
    const [masterDefinedProcedue, setMasterDefinedProcedue] = useState({});

    // *** State For Manage DynamicTable Component ***
    const [mainArray, setMainArray] = useState([]);

    // State to manage tables
    const [tables, setTables] = useState([]);

    // shift each tables from child to mainArray
    function setArraydata(eachBodyData) {

        setMainArray((oldArray) => {

            let isAvailable = false

            oldArray.map((item) => {
                if (item.fromId == eachBodyData.fromId) {
                    isAvailable = true;
                }
            });
            console.log(isAvailable);

            const updateArray = oldArray.map((eachRow) => {
                if (eachRow.fromId == eachBodyData.fromId) {
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

    // Function to delete table from anywhere
    const deleteTable = (unique_id) => {

        setTables((oldArray) => {
            const updateArray = oldArray?.filter((eachArr, index) => eachArr.unique_id != unique_id);
            return updateArray
        });

        setMainArray((oldArray) => {
            const updateArray = oldArray?.map((eachArr, index) => {
                if (eachArr.unique_id == unique_id) {
                    eachArr.delete = true;
                    console.log(eachArr);
                    return eachArr;
                } else {
                    return eachArr;
                }
            });
            return updateArray
        });
    };

    // *** Fetch InstrumentType ***
    const fetchinstrumentType = async () => {
        try {
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

    // *** Fetch Defined Procedures ***
    const fetchDefinedProcedures = async () => {

        try {

            const data = await fetch(config.Calibmaster.URL + "/api/design-procedures/view-defined-procedure", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({
                    master_design_procedure_id: masterId,
                    lab_id: auth.labId
                })
            });

            let response = await data.json();
            const { masterTable, tableDesign, uncertainty_master_parameter_query } = response;
            // console.log(masterTable);

            setMasterDPId(masterTable.master_design_procedure_id)
            setCalibrationProcedure(masterTable.calibration_procedure);
            setRefStd(masterTable.ref_std);

            setValidity(masterTable.validity);
            setTraceability(masterTable.traceability);
            setTemperature(masterTable.temperature);
            setHumidity(masterTable.humidity);
            setAtmosphericPressure(masterTable.atmospheric_pressure);
            setInstrumentValue(masterTable.instrument_type_id);

            setAddEquipmets(masterTable?.master_list_equipments);
            setRemarks(masterTable?.remarks);

            const createDynamicTable = tableDesign.map((item) => {

                const { cell_texts } = item;
                const eachBodyArray = Object.values(cell_texts)[0];

                if (item.table_type === "vertical") {
                    return {
                        eachComponent: <ExistVerticalTable
                            key={item.fromId} fromId={item.fromId} unique_id={item.unique_id}
                            table_type="vertical"
                            setArraydata={setArraydata}
                            masterTableInfo={masterTable}
                            eachItem={item}
                            eachBodyArray={eachBodyArray}
                            deleteTable={deleteTable}
                        />,
                        unique_id: item.unique_id
                    }
                }
            });

            setTables(createDynamicTable);
            setMasterDefinedProcedue(masterTable);

            // *** Add Uncertainty Parameters List Into Redux Store ***
            dispatch(umpListActions.addBulkUMPList(uncertainty_master_parameter_query));

            const newNotification = {
                title: "Defined Procedure Info fetched Successfully",
                description: "",
                icon: "success",
                state: true,
                timeout: 1500,
            };
            return dispatch(notificationActions.changenotification(newNotification));
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
        fetchDefinedProcedures();
        fetchMasterLists();
    }, []);

    // TODO: Function to Add Vertical Table
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

    // Add Remarks
    const addRemarksHandler = () => {
        const newRemarks = [...remarks, []];
        setRemarks(newRemarks);
    }

    // Add Remarks Value
    const remarkChangeHandler = (value, i) => {
        const inputData = [...remarks];
        inputData[i] = value.target.value;
        setRemarks(inputData);
    }

    // Delete Remarks
    const deleteRemarkHandler = (i) => {
        const deleteValue = [...remarks];
        deleteValue.splice(i, 1);
        setRemarks(deleteValue);
    }

    // Handle Submit Function
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

                    // console.log(cell_texts);
                    // console.log(Array.isArray(cell_texts));

                    const copyCellText = [...cell_texts];
                    cell_texts = {};

                    copyCellText.map((row, rowIndex) => {
                        for (const key in row) {
                            if (key.charAt(0) !== 'T') {
                                row[`${TKey}${key}`] = row[key];
                                delete row[key];
                            }
                        }
                    });

                    cell_texts[tableKeyName] = copyCellText;
                    eachTableComponent.cell_texts = cell_texts;
                }
                // console.log(mainArray);
                // return;

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
                    uncertainty_parameters_id_array?.push({ uncertainty_master_parameter_id: item.uncertainty_master_parameter_id });
                });

                const bodyData = {
                    lab_id: auth.labId,
                    instrument_type_id: instrumentValue,
                    master_design_procedure_id: masterDPId,

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
                }

                let response = await fetch(config.Calibmaster.URL + "/api/design-procedures/update", {
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
                    description: "",
                    icon: "success",
                    state: true,
                    timeout: 15000,
                };
                dispatch(notificationActions.changenotification(newNotification));
                dispatch(umpListActions.removeAllUMPItem());
                onRequestClose();
            } else {
                alert("Please set all table from");
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
        <Modal
            isOpen={isOpen}
            hideCloseButton
            title="Edit Defined Procedure"
            className='edit_defined_prodedure_modal'
            footer={
                <div style={{ display: "flex", justifyContent: "center" }}>
                    <Button
                        label="Update Define Procedures"
                        variant="brand"
                        onClick={handleSubmit}
                        className="rainbow-m-around_medium"
                    />
                </div>
            }
        >
            {/* Close Button*/}
            <ButtonIcon variant="base" size="large" className="close-modal" icon={<FontAwesomeIcon icon={faClose} />} onClick={onRequestClose} />
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
                        value={instrumentValue}
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
                    />
                </div>

                <ListMasterEquipments
                    addEquipmets={addEquipmets}
                    setAddEquipmets={setAddEquipmets}
                />
            </Card>

            {/* Table Area  */}
            <div className="card_container_2">

                <h4 className='title' style={{ textAlign: 'left' }}>
                    Calibration Result:
                </h4>

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
                    <div key={index} className="each_card alpha">
                        {table.eachComponent}
                    </div>
                ))}
            </div>

            {/* Select Uncertainty Parameter */}
            {/* <ListUncertaintyParameter /> */}

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
        </Modal>
    )
}

export default EditDefinedProdedureModal;