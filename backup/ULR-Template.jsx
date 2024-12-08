import { useContext, useEffect, useState } from "react";
import accreditationDetailValidation from "./accreditationDetailValidation";
import { Input, Button, Card } from "react-rainbow-components";
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from '../../../context/auth-context';
import axios from "axios";

const AddUlr = () => {

    const auth = useContext(AuthContext);

    const each_input_group = {
        width: '27%',
        marginBottom: '1rem',
        padding: '1rem'
    };

    const [ULRArray, setULRArray] = useState([]);
    const currentYear = new Date().getFullYear();

    const [accreditationDetail, setAccreditationDetail] = useState({
        accreditationNumber: "",
        currentYear: currentYear % 100,
        location: "",
        runningNumber: "",
        accreditedScope: "",
        effectiveFlag: "",
        effectiveStartDateString: "",
        effectiveEndDateString: "",
        ulrcount: 1
    });

    const [validationError, setValidationError] = useState({});

    useEffect(() => {
        fetchData();
    }, [])

    async function fetchData() {
        await axios.get(config.Calibmaster.URL + "/api/ulr-no-generation/ulr-setup/" + auth.labId)
            .then((response) => {
                if (response.data.prevYearData.length > 0) {
                    setAccreditationDetail((prev) => {
                        return {
                            ...prev,
                            accreditationNumber: response.data.prevYearData[0].accreditationNumber,
                            location: response.data.prevYearData[0].location,
                            accreditedScope: response.data.prevYearData[0].accreditedScope,
                        }
                    })
                }
                if (response.data.currentYearData.length > 0) {
                    setAccreditationDetail((prev) => {
                        return {
                            ...prev,
                            effectiveFlag: response.data.currentYearData[0].effectiveFlag,
                            runningNumber: response.data.currentYearData[0].runningNumber
                        }
                    })
                }
            }).catch((err) => {
                console.log(err);
            })
    }

    function handleChange(event) {
        setAccreditationDetail((prev) => {
            return { ...prev, [event.target.name]: event.target.value }
        })
    }

    async function handleSubmitGetULRNumber(e) {

        let validationError = accreditationDetailValidation(accreditationDetail);
        setValidationError(validationError);

        if (
            validationError.accreditationNumber == "" && validationError.accreditedScope == ""
            && validationError.currentYear == "" && validationError.location == ""
        ) {
            accreditationDetail.lab_id = auth.labId;
            await axios.post(config.Calibmaster.URL + "/api/ulr-no-generation/get-ulr", accreditationDetail)
                .then((res) => {
                    if (res.data.ULRNumber.length == 0) {
                        console.log("There is no data")
                    }
                    setAccreditationDetail((prev) => {
                        return { ...prev, runningNumber: res.data.currentRunningNumber }
                    })
                    setULRArray(res.data.ULRNumber);
                }).catch((err) => {
                    console.log(err);
                })
        }
    }

    async function handleSubmitSave(event) {

        event.preventDefault();

        let validationError = accreditationDetailValidation(accreditationDetail);
        setValidationError(validationError);

        if (
            validationError.ulrcount == "" && validationError.accreditationNumber == "" &&
            validationError.accreditedScope == "" && validationError.currentYear == "" && validationError.location == ""
        ) {
            accreditationDetail.lab_id = auth.labId;
            await axios.post(config.Calibmaster.URL + "/api/ulr-no-generation/ulr-update", accreditationDetail)
                .then((res) => {
                    console.log(res);
                    setAccreditationDetail((prev) => {
                        return {
                            ...prev,
                            runningNumber: res.data[0].runningNumber
                        }
                    })
                }).catch((err) => {
                    console.log(err);
                })
        }
    }

    async function handleSubmitProceedNextYear(e) {

        let validationError = accreditationDetailValidation(accreditationDetail);
        setValidationError(validationError);

        await axios.post(config.Calibmaster.URL + "/api/ulr-no-generation/next-year-ulr", { lab_id: auth.labId })
            .then((res) => {
                console.log(res);
                setAccreditationDetail((prev) => {
                    return {
                        ...prev,
                        currentYear: res.data.currentYear,
                        runningNumber: res.data.runningNumber
                    }
                })
            }).catch((err) => {
                console.log(err);
            })
    }

    return (
        <Card style={{ width: "100%" }}>

            <h3>ULR No. Generate</h3>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
                <div style={each_input_group}>
                    <Input
                        label="Accreditation Number:"
                        placeholder="Accreditation Number"
                        name="accreditationNumber"
                        value={accreditationDetail.accreditationNumber}
                        required
                        onChange={handleChange}
                        maxLength={7}
                        minLength={7}
                    />
                    {validationError.accreditationNumber && <span style={{ color: "red" }}>{validationError.accreditationNumber}</span>}
                </div>
                <div style={each_input_group}>
                    <Input
                        label="Current Year:"
                        placeholder="Current Year"
                        name="currentYear"
                        required
                        onChange={handleChange}
                        maxLength={2}
                        minLength={2}
                        value={accreditationDetail.currentYear}
                    />
                    {validationError.currentYear && <span style={{ color: "red" }}>{validationError.currentYear}</span>}
                </div>
                <div style={each_input_group}>
                    <Input
                        label="Location"
                        placeholder="Location"
                        name="location"
                        value={accreditationDetail.location}
                        required
                        onChange={handleChange}
                        maxLength={1}
                        minLength={1}
                    />
                    {validationError.location && <span style={{ color: "red" }}>{validationError.location}</span>}
                </div>
                <div style={each_input_group}>
                    <Input
                        label="Running Number"
                        name="runningNumber"
                        placeholder="Running Number"
                        value={accreditationDetail.runningNumber}
                        readOnly
                        disabled
                    />
                </div>
                <div style={each_input_group}>
                    <Input
                        label="Accredited Scope:"
                        placeholder="Accredited Scope"
                        required
                        name="accreditedScope"
                        value={accreditationDetail.accreditedScope}
                        onChange={handleChange}
                    />
                    {validationError.accreditedScope && <span style={{ color: "red" }}>{validationError.accreditedScope}</span>}
                </div>
                <div style={each_input_group}>
                    <Input
                        label="Effective Start Date"
                        placeholder="Effective Start Date"
                        required
                        type="date"
                        name="effectiveStartDateString"
                        value={accreditationDetail.effectiveStartDateString}
                        onChange={handleChange}
                    />
                </div>
                <div style={each_input_group}>
                    <Input
                        label="Effective End Date"
                        placeholder="Effective End Date"
                        type="date"
                        name="effectiveEndDateString"
                        value={accreditationDetail.effectiveEndDateString}
                        onChange={handleChange}
                    />
                </div>
                <div style={each_input_group}>
                    <Input
                        label="Effective Flag"
                        placeholder="Effective Flag"
                        name="effectiveFlag"
                        value={accreditationDetail.effectiveFlag}
                        readOnly
                        disabled
                    />
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-evenly" }}>

                {/* <Button
                    shaded
                    label="Button Border Filled"
                    variant="border-filled"
                    className="rainbow-m-around_medium"
                    onClick={handleSubmitGetULRNumber}
                >
                    Get ULR
                </Button> */}

                <Button
                    shaded
                    label="Button Border Filled"
                    variant="success"
                    className="rainbow-m-around_medium"
                    onClick={handleSubmitSave}
                >
                    Save
                </Button>

                <Button
                    shaded
                    label="Button Border Filled"
                    variant="brand"
                    className="rainbow-m-around_medium"
                    onClick={handleSubmitProceedNextYear}
                >
                    Proceed to Next YEAR
                </Button>
            </div>

            <div style={{ marginTop: "40px", listStyle: "none" }}>
                {ULRArray.length > 0 && <h3>ULR Numbers</h3>}
                {ULRArray.map((ULRNumber, index) => { return <li key={index}> {ULRNumber}</li> })}
            </div>
        </Card>
    )
}

export default AddUlr;