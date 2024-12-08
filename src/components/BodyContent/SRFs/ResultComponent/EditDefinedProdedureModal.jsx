import React, { useState, useEffect, useContext, useRef } from 'react';
import { Button, Modal, Card, Input, Select, Spinner } from 'react-rainbow-components';
import { notificationActions } from "../../../../store/nofitication";
import { AuthContext } from '../../../../context/auth-context';
import { useDispatch, useSelector } from 'react-redux';
import config from "../../../../utils/config.json";
import AddMasterEquipments from './MasterEquipments/AddMasterEquipments';
import ListMasterEquipments from './MasterEquipments/ListMasterEquipments';
import EditVerticalTable from './Tables/EditVerticalTable';
import EditHorizontalTable from './Tables/EditHorizontalTable';
import UncertaintyBudget from './UncertaintyBudget/UncertaintyBudget';
import { addProcedures } from '../../../../store/procedureSlice';
import { parseFormula } from '../../../helpers/formula_parser';
import ExistResultTable from './Tables/ExistResultTable';
import EditVerticalTableWithoutFormula from './Tables/EditVerticalTableWithoutFormula';
import ExistResultTableWithoutFormula from './Tables/ExistResultTableWithoutFormula';
import { BottomWrapper, ButtonStyled, DataAddedNotification, NotificationText } from './EditDefined'
import { evaluate } from 'mathjs';
import { calc } from 'antd/es/theme/internal';



const EditDefinedProdedureModal = ({ isOpen, onRequestClose, masterId, srf_id, srf_item_id, setSetTitle, parentModalClose }) => {

    // *** Access Virtual DOM ***
    const divOneRef = useRef(null);
    const divTwoRef = useRef(null);
    const [divOneWidth, setDivOneWidth] = useState(0);

    let isTable = [];
    // for eval
    const functionReplacements = {
        'sqrt': 'Math.sqrt',
        'round': 'Math.round',
        'pow': 'Math.pow',
        'abs': 'Math.abs'
    };

    useEffect(() => {
        if (divOneRef.current && divTwoRef.current) {
            const width = divOneRef.current.offsetWidth;
            setDivOneWidth(width);
            divTwoRef.current.style.width = `${width}px`;
        }
    }, [divOneWidth]);

    // ***  State Management Hooks *** 
    const auth = useContext(AuthContext);
    const dispatch = useDispatch();
    const selector = useSelector((state) => state?.procedures);

    // *** State for store values ***
    const [masterDPId, setMasterDPId] = useState("");
    const [calibrationProcedure, setCalibrationProcedure] = useState("");
    const [refStd, setRefStd] = useState("");

    const [validity, setValidity] = useState("");
    const [traceability, setTraceability] = useState("");
    const [temperature, setTemperature] = useState("");
    const [humidity, setHumidity] = useState("");
    const [atmosphericPressure, setAtmosphericPressure] = useState("");

    const [ulrNumber, setUlrNumber] = useState("");
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

    // *** State for Employee List ***
    const [empList, setEmpList] = useState([]);
    const [calibratedByValue, setCalibratedByValue] = useState("");
    const [calibratedByValueErr, setCalibratedByValueErr] = useState("");
    const [approvedByValue, setApprovedByValue] = useState("");
    const [approvedByValueErr, setApprovedByValueErr] = useState("");

    // *** State For Manage DynamicTable Component ***
    const [mainArray, setMainArray] = useState([]);

    // *** State to manage tables ***
    const [tables, setTables] = useState([]);
    const [calTrigger, setCalTrigger] = useState(false);
    const [isCalculated, setCalculated] = useState(false);

    // *** State For Manage Uncertainty Parameters ***
    const [uncertaintyMasterParameters, setUncertaintyMasterParameters] = useState([]);

    //*** Loading  ***/
    const [loading, setloading] = useState(false);

    //*** if Already Exist  ***/
    const [ifExist, setIfExist] = useState(true);

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

    // *** Fetch DefinedProcedures ***
    const fetchDefinedProcedures = async () => {

        try {

            setloading(true);

            const data = await fetch(config.Calibmaster.URL + "/api/design-procedures/fetch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({
                    master_design_procedure_id: masterId,
                    lab_id: auth.labId,
                    srf_id,
                    srf_item_id
                })
            });

            let response = await data.json();
            const { masterTable, tableDesign, uncertainty_master_parameter_query, ifExistResultMasterTable } = response;

            setMasterDPId(masterTable.master_design_procedure_id)
            setCalibrationProcedure(masterTable.calibration_procedure);
            setRefStd(masterTable.ref_std);

            setValidity(masterTable.validity);
            setTraceability(masterTable.traceability);
            setUlrNumber(masterTable?.ulr_number);
            setTemperature(masterTable.temperature);
            setHumidity(masterTable.humidity);
            setAtmosphericPressure(masterTable.atmospheric_pressure);
            setInstrumentValue(masterTable.instrument_type_id);
            setAddEquipmets(masterTable.master_list_equipments)
            setRemarks(masterTable.remarks)

            setCalibratedByValue(masterTable.calibrated_employee_id);
            setApprovedByValue(masterTable.approved_employee_id);

            setTables(tableDesign);

            setIfExist(ifExistResultMasterTable);
            setSetTitle(ifExistResultMasterTable);

            setUncertaintyMasterParameters(uncertainty_master_parameter_query);

            setloading(false);

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
            setloading(false);
        }
    }

    // *** Add Procedure Into Store ***
    async function addProcedureIntoStore() {
        try {
            const procedureArray = [];

            const data = await fetch(config.Calibmaster.URL + "/api/design-procedures/fetch", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({
                    master_design_procedure_id: masterId,
                    lab_id: auth.labId,
                    srf_id,
                    srf_item_id
                })
            });
            let response = await data.json();
            const { tableDesign, ifExistResultMasterTable } = response;

            if (ifExistResultMasterTable) {

                tableDesign.map((item) => {
                    const { cell_texts } = item;
                    procedureArray.push(cell_texts)
                });
                isTable = procedureArray;
                dispatch(addProcedures(procedureArray));
                return;
            }

            tableDesign.map((item) => {
                const { cell_texts } = item;
                const eachBodyArray = Object.values(cell_texts)[0];

                const modifiedBodyArray = eachBodyArray.map((eachRow, rowIndex) => {

                    for (const key in eachRow) {

                        let eachObjectKey = key;
                        let eachObjectValue = eachRow[key];
                        let response = '';

                        if (typeof eachObjectValue === 'object') {
                            // * Do Something Else
                        } else {
                            response = parseFormula(eachObjectKey, eachObjectValue);

                            let columnFormula = eachObjectValue;
                            let constFormula = eachObjectValue;
                            let val = '';
                            let is_Script = false;
                            let is_Value_Of = false; // ! For VALUEOF

                            if (response?.hasOwnProperty("SCRIPT")) {
                                is_Script = true;
                                columnFormula = response.SCRIPT
                                constFormula = response.SCRIPT
                            }
                            if (response?.hasOwnProperty("DEFAULTVALUE")) {
                                val = Number(response?.DEFAULTVALUE || 0);
                            }
                            // ! For VALUEOF
                            if (response?.hasOwnProperty("VALUEOF")) {
                                is_Script = true;
                                is_Value_Of = true;
                                columnFormula = response.VALUEOF
                                constFormula = response.VALUEOF
                            }

                            if (response?.hasOwnProperty("HEADER")) {
                                val = response?.HEADER;
                            }
                            if (response?.hasOwnProperty("BLANK")) {
                                val = '--';
                            }
                            if (response?.hasOwnProperty("TEXT")) {
                                val = response?.TEXT;
                            }

                            eachRow[key] = {
                                columnFormula: columnFormula,
                                constFormula: constFormula,
                                val: val,
                                f_script: is_Script,
                                is_Value_Of: is_Value_Of // ! For VALUEOF
                            }
                        }
                    }
                    return eachRow;
                });
                procedureArray.push(modifiedBodyArray)
            })
            isTable = procedureArray;
            dispatch(addProcedures(procedureArray))
        } catch (error) {
            console.log(error);
        }
    }

    // TODO: Update Value of the cell object Handler
    function updateCellObjectKeyValue(keyName, value) {
        try {
            for (const subArray of isTable) {
                for (let obj of subArray) {
                    if (obj.hasOwnProperty(keyName)) {
                        obj[keyName].val = value;
                        break;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    function findKeyFromSelecotor(queryKey) {
        for (const subArray of isTable) {
            for (const objRow of subArray) {
                for (const key in objRow) {
                    if (key == queryKey) {
                        const { val, columnFormula } = objRow[key];
                        let getDefaultValue = columnFormula.split(/[\(\)]/);
                        if (getDefaultValue.includes('DEFAULTVALUE')) return Number(getDefaultValue[1]);
                        return val;
                    }
                }
            }
        }
    }

    function evaluateExpression(ifExpression) {
        ifExpression = ifExpression
            .replace(/:(?!["'\d])([^:?\d][^\:\?\d]*?)(?=[):])/g, ':"$1"')
            .replace(/\?(?!["'\d])([^:?\d][^\:\?\d]*?)(?=[):])/g, '?"$1"');
        // Replace bitwise operators with Math.pow for exponentiation
        ifExpression = ifExpression
            .replace(/(\d+)\^(\d+)/g, 'pow($1, $2)');

        for (const [key, value] of Object.entries(functionReplacements)) {
            const regex = new RegExp(`${key}\\(([^)]*)\\)`, 'g');
            ifExpression = ifExpression.replace(regex, (match, p1) => `${value}(${p1})`);
        }
        return ifExpression;
    }

    function getValueFromScriptHandler(formula) {
        try {
            // evaluate normal expression e.g (2+3) = 5
            const normalExpression = /^[\d()+*/.-]+$/.test(formula);
            if (normalExpression) return { formula, value: evaluate(formula) };

            //evaluate IF Formulas 
            if (formula.includes('?') && formula.includes(':') && !formula.match(/T\d+[A-Z]\d+/g)) {
                let value;
                try {
                    value = new Function('return ' + evaluateExpression(formula))();
                } catch (error) {
                    value = '';
                }
                return { formula, value };
            }

            // checking formulas have like T1A1 if not have return 0
            const keys = formula.match(/T\d+[A-Z]\d+/g);
            if (!keys) return { formula, value: 0 };

            keys.forEach(key => {
                let replaced = false;
                for (const eachTable of isTable) {
                    for (const obj of eachTable) {
                        if (obj[key]) {
                            const constFormula = obj[key].constFormula;
                            const constval = obj[key].val;
                            // Only replace if the constFormula is a number or a valid expression
                            if (!isNaN(constFormula)) {
                                let numberValue = Number(constFormula);
                                // In this case the number should assign into val key
                                updateCellObjectKeyValue(key, numberValue);
                                formula = formula.replace(key, numberValue);
                            } else {
                                formula = formula.replace(key, (constval === '' ? key : constval));
                            }
                            replaced = true;
                            break;
                        }
                    }
                }
                if (!replaced) {
                    const reduxValue = findKeyFromSelecotor(key);
                    if (reduxValue !== null) {
                        formula = formula.replace(key, reduxValue);
                    }
                }
            });
            // if cell is not have it return undefined to 0
            formula = formula.replace(/\bundefined\b/g, '0');

            // checking formulas have like T1A1 if have return empty
            const iskeys = formula.match(/T\d+[A-Z]\d+/g);
            if (iskeys) return { formula, value: '' };

            //evaluate IF Formulas
            if (formula.includes('?') && formula.includes(':')) {
                let value;
                try {
                    value = new Function('return ' + evaluateExpression(formula))();
                } catch (error) {
                    value = '';
                }
                return { formula, value };
            }
            return { formula, value: evaluate(formula) };

        } catch (error) {
            console.log(error);
        }
    }

    async function getDataFromStore() {
        try {
            let isHaveChanges = false;
            let calculatedTable = await Promise.all(isTable.map(async (eachTable) => {
                return Promise.all(eachTable.map(async (eachRow) => {
                    // Create a new object to avoid mutation
                    const updatedRow = { ...eachRow };
                    for (const key in updatedRow) {
                        let { columnFormula, constFormula, val, f_script } = updatedRow[key];
                        if (f_script) {
                            // Await the result if getValueFromScriptHandler is async
                            const { formula, value } = getValueFromScriptHandler(constFormula);
                            updatedRow[key] = {
                                ...updatedRow[key],
                                columnFormula: formula,
                                val: (value === '' || (Math.abs(value) < 1e-10 && value)) ? '' : value,
                            };
                            if (value === '')
                                isHaveChanges = true;
                        }
                    }

                    return updatedRow;  // Return the updated row
                }));
            }));
            isTable = calculatedTable;
            return isHaveChanges; // Return the final processed data
        } catch (error) {
            console.error("Error processing data:", error);
        }
    }

    useEffect(() => {
        isTable = selector;
    }, [selector])

    const mergeData = (designProcedures, evaluatedCells) => {
        const evaluatedMap = evaluatedCells.reduce((map, row, index) => {
            map[`table-${index + 1}`] = row;
            return map;
        }, {});

        return designProcedures.map(proc => {
            const tableId = `table-${Number(proc.fromId) + 1}`;
            const cellTexts = Array.isArray(proc.cell_texts)
                ? proc.cell_texts
                : proc.cell_texts[tableId] || [];

            return {
                ...proc,
                cell_texts: cellTexts.map((cellText, index) => ({
                    ...cellText,
                    ...(evaluatedMap[tableId] && evaluatedMap[tableId][index] ? evaluatedMap[tableId][index] : {})
                }))
            };
        });
    };


    const handleGlobalCalculate = async () => {
        isTable = selector;
        if (!calTrigger) {
            let calculationStatus = true;
            let loopCount = isTable.length * isTable.length;
            if (isTable.length == 1) {
                loopCount = isTable[0].length;
                while (loopCount) {
                    loopCount -= 1;
                    calculationStatus = await getDataFromStore();
                }
            }
            else {
                while (calculationStatus && loopCount) {
                    loopCount -= 1;
                    calculationStatus = await getDataFromStore();
                }
            }
            dispatch(addProcedures(isTable));
            setMainArray(mergeData(tables, isTable));
            setCalTrigger(true);
            setCalculated(true);
        }
    };

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

    // *** Fetch Employees ***
    const fetchEmployees = async () => {
        try {
            setloading(true);

            const data = await fetch(config.Calibmaster.URL + "/api/employee-master/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ lab_id: auth.labId })
            });

            let response = await data.json();
            let newArray = [{ value: '', label: 'Select' }];

            await response.data.map((item, index) => {
                newArray[index + 1] = {
                    value: item.employee_id,
                    label: `${item.employee_full_name} (${item.employee_role})`
                }
            });
            setEmpList(newArray);

            setloading(false);

            const newNotification = {
                title: response.message,
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

    useEffect(() => {
        fetchinstrumentType();
        fetchDefinedProcedures();
        addProcedureIntoStore();
        fetchMasterLists();
        fetchEmployees();
    }, []);

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

    // TODO: When Click on handleSubmit btn it will be store into 3rd table
    const handleSubmit = async () => {

        try {

            // return console.log(mainArray);

            if (mainArray.length === tables.length && isCalculated) {

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

                if (calibratedByValue == "" || !calibratedByValue) {
                    setCalibratedByValueErr("Please calibrated By Engineering");
                    return;
                }

                if (approvedByValue == "" || !approvedByValue) {
                    setApprovedByValueErr("Please calibrated By Approved");
                    return;
                }

                const bodyData = {
                    master_design_procedure_id: masterId,
                    lab_id: auth.labId,
                    instrument_type_id: instrumentValue,
                    srf_id,
                    srf_item_id,

                    ulr_number: ulrNumber,

                    calibration_procedure: calibrationProcedure,
                    ref_std: refStd,

                    validity: validity,
                    traceability: traceability,

                    temperature: temperature,
                    humidity: humidity,
                    atmospheric_pressure: atmosphericPressure,

                    master_list_equipments: addEquipmets,
                    remarks: remarks,

                    calibrated_employee_id: calibratedByValue,
                    approved_employee_id: approvedByValue,

                    mainArray
                }

                let response = await fetch(config.Calibmaster.URL + "/api/result-tables/create", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": "Bearer " + auth.token,
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
                parentModalClose();
            } else {
                alert("Please Set Table Data");
            }
        } catch (error) {
            const newNotification = {
                title: "Something went wrong",
                description: "",
                icon: "error",
                state: true,
            };
            dispatch(notificationActions.changenotification(newNotification));
        }
    }

    if (loading) return <Spinner size="large" />;

    return (

        <div style={{ marginTop: '1rem' }}>

            {/* Top Input Fields */}
            <div className="card_container_1">

                {/* CALIBRATION PROCEDURE */}
                <div className="input_group">
                    <Input
                        label="CALIBRATION PROCEDURE"
                        placeholder="CALIBRATION PROCEDURE"
                        className="eachInput"
                        required={true}
                        disabled={false}
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
                        disabled={false}
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
                        disabled={false}
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
                        disabled={false}
                        onChange={(e) => {
                            setTraceability(e.target.value);
                            setTraceabilityErr("")
                        }}
                    />
                    {traceabilityErr && <span style={{ color: "red" }}>{traceabilityErr}</span>}
                </div>

                {/* ULR NUMBER */}
                <div className="input_group">
                    <Input
                        label="ULR NUMBER"
                        placeholder="ULR NUMBER"
                        className="eachInput"
                        required={false}
                        value={ulrNumber}
                        disabled={false}
                        onChange={(e) => {
                            setUlrNumber(e.target.value);
                        }}
                    />
                </div>

                {/* TEMPERATURE */}
                <div className="input_group">
                    <Input
                        label="TEMPERATURE (°C)"
                        placeholder="TEMPERATURE (°C)"
                        className="eachInput"
                        required={false}
                        value={temperature}
                        disabled={false}
                        onChange={(e) => {
                            setTemperature(e.target.value);
                        }}
                    />
                </div>

                {/* HUMIDITY */}
                <div className="input_group">
                    <Input
                        label="HUMIDITY (RH %)"
                        placeholder="HUMIDITY (RH %)"
                        className="eachInput"
                        required={false}
                        value={humidity}
                        disabled={false}
                        onChange={(e) => {
                            setHumidity(e.target.value);
                        }}
                    />
                </div>

                {/* Atmospheric Pressure */}
                <div className="input_group">
                    <Input
                        label="Atmospheric Pressure"
                        placeholder="Atmospheric Pressure"
                        className="eachInput"
                        required={false}
                        value={atmosphericPressure}
                        disabled={false}
                        onChange={(e) => {
                            setAtmosphericPressure(e.target.value);
                        }}
                    />
                </div>

                {/* Select Instrument */}
                <div className="input_group">
                    <Select
                        label="Select Instrument"
                        options={instrumentList}
                        required={true}
                        value={instrumentValue}
                        disabled={false}
                        onChange={(e) => {
                            setInstrumentValue(e.target.value);
                            setInstrumentValueErr("");
                        }}
                    />
                    {instrumentValueErr && <span style={{ color: "red" }}>{instrumentValueErr}</span>}
                </div>

            </div>

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
                {masterListError && <span style={{ color: 'red' }}>{masterListError}</span>}

                <ListMasterEquipments
                    addEquipmets={addEquipmets}
                    setAddEquipmets={setAddEquipmets}
                />
            </Card>

            {/* Table Area  */}
            <div className="mondal_container_parent" style={{ minWidth: 1000, maxWidth: 1400 }}>
                {
                    tables.map((item, index) => {
                        return <div key={index} className="each_card" ref={divOneRef} style={{ position: 'relative' }}>
                            {
                                // With formula
                                // (!ifExist)
                                //     ? <EditVerticalTable fromId={index} item={item} setArraydata={setArraydata} ifExist={ifExist} divTwoRef={divTwoRef} />
                                //     : <ExistResultTable fromId={index} item={item} setArraydata={setArraydata} ifExist={ifExist} divTwoRef={divTwoRef} />

                                // Without formula
                                (!ifExist)
                                    ? <EditVerticalTableWithoutFormula fromId={index} item={item} divTwoRef={divTwoRef} calculateTrigger={calTrigger} setCalTrigger={setCalTrigger} setCalculated={setCalculated} />
                                    : <ExistResultTableWithoutFormula fromId={index} item={item} divTwoRef={divTwoRef} calculateTrigger={calTrigger} setCalTrigger={setCalTrigger} setCalculated={setCalculated} />
                            }
                        </div>
                    })
                }
                <BottomWrapper>
                    <ButtonStyled
                        label={isCalculated ? "Data Added" : "Set Data"}
                        variant={`${isCalculated ? "outline-brand" : "border-filled"}`}
                        disabled={isCalculated}
                        className="rainbow-m-around_medium"
                        isSet={isCalculated}
                        onClick={handleGlobalCalculate}
                    />
                    {isCalculated && (
                        <DataAddedNotification>
                            <NotificationText>✅ Data has been successfully added!</NotificationText>
                        </DataAddedNotification>
                    )}
                </BottomWrapper>
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
                        remarks?.map((data, i) => {
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

            <Card className="card_container_1">

                {/* Select Calibrated By */}
                <div className="input_group">
                    <Select
                        label="Calibrated By"
                        options={empList}
                        required={true}
                        value={calibratedByValue}
                        disabled={false}
                        onChange={(e) => {
                            setCalibratedByValue(e.target.value);
                            setCalibratedByValueErr("");
                        }}
                    />
                    {calibratedByValueErr && <span style={{ color: "red" }}>{calibratedByValueErr}</span>}
                </div>

                {/* Select Approved By */}
                <div className="input_group">
                    <Select
                        label="Approved By"
                        options={empList}
                        required={true}
                        value={approvedByValue}
                        disabled={false}
                        onChange={(e) => {
                            setApprovedByValue(e.target.value);
                            setApprovedByValueErr("");
                        }}
                    />
                    {approvedByValueErr && <span style={{ color: "red" }}>{approvedByValueErr}</span>}
                </div>
            </Card>

            <div style={{ display: "flex", justifyContent: "center" }}>
                <Button
                    label={ifExist ? "Update Data" : "Save Data"}
                    onClick={handleSubmit}
                    variant="brand"
                    className="rainbow-m-around_medium"
                />
            </div>
        </div>
    )
}

export default EditDefinedProdedureModal;