import React, { useContext, useEffect, useState } from 'react';
import { Card, Spinner, Input, Select, Button, Textarea } from 'react-rainbow-components';
import "./style.css";
import CustomInput from '../../Inputs/CustomInput';
import CustomButton from '../../Inputs/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from '../../../context/auth-context';
import { sidebarActions } from '../../../store/sidebar';
import { populateUomData, populateDisciplineData, populateGroupData, populateInstrumentData } from './HelperFunction';
import { instrumentNameActions } from '../../../store/instrumentName';


const CreateInstrumentType = () => {

    const [instrument, setInstrument] = useState([]);
    const [instrumentValue, setInstrumentValue] = useState("");

    const [instrumentTypeSpec, setInstrumentTypeSpec] = useState("");

    const [fullName, setFullName] = useState({
        name: "",
        rangeMin: "",
        rangeMax: "",
        rangeUom: "",
        lc: "",
        lcUOM: "",
        size: "",
        sizeUom: ""
    });

    const [customFullName, setCustomFullName] = useState("");

    const [UOM, setUOM] = useState([]);
    const [uomValue, setUomValue] = useState("");

    const [rangeMinimum, setRangeMinimum] = useState("");
    const [rangeMinimumUOMId, setrangeMinimumUOMId] = useState("");

    const [rangeMaximum, setRangeMaximum] = useState("");
    const [rangeMaximumUOMId, setrangeMaximumUOMId] = useState("");

    const [leastCount, setLeastCount] = useState("");
    const [leastCountUOMId, setLeastCountUOMId] = useState("");

    const [sizeSpec, setSizeSpec] = useState("");
    const [sizeSpecUomId, setSizeSpecUomId] = useState("");

    const [loading, setloading] = useState(false);
    const [error, setError] = useState("");

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [instrumentErr, setInstrumentErr] = useState("");
    const [instrumentFullNameErr, setInstrumentFullNameErr] = useState("");

    async function fetchData() {
        setloading(true);

        try {
            const instrumentResonse = await fetch(config.Calibmaster.URL + "/api/instrument/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ lab_id: auth.labId })
            }).then((res) => res.json());
            let getInstrumentData = await populateInstrumentData(instrumentResonse.data);
            setInstrument(getInstrumentData);

            const uomResonse = await fetch(config.Calibmaster.URL + "/api/uom/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            }).then((res) => res.json());
            let getUomData = await populateUomData(uomResonse.data);
            setUOM(getUomData);

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


    const CreateFullNameHandler = () => {
        let createValue = "";

        if (fullName.name) {
            createValue = fullName.name + " ";
        }
        if (fullName.rangeMin && fullName.rangeMax && fullName.rangeUom && fullName.rangeUom != "Select") {
            createValue = createValue + fullName.rangeMin + "-" + fullName.rangeMax + " " + fullName.rangeUom;
        }
        console.log(createValue);
        if (fullName.lc && fullName.lcUOM && fullName.lcUOM != "Select") {
            createValue = createValue + " LC " + fullName.lc + " " + fullName.lcUOM;
        }
        if (fullName.size && fullName.sizeUom && fullName.sizeUom != "Select") {
            createValue = createValue + " Size " + fullName.size + " " + fullName.sizeUom;
        }

        setCustomFullName(createValue);
        return;
    }

    const addInstrumentType = async () => {

        setloading(true);

        if (!instrumentValue) {
            setInstrumentErr("Please select a Instrument")
            setloading(false);
            return;
        }
        if (!customFullName) {
            setInstrumentFullNameErr("Please Enter Instrument Full Name")
            setloading(false);
            return;
        }

        try {

            const newInstrumentType = {
                instrument_id: instrumentValue,
                instrument_full_name: customFullName,
                instrument_type_spec: instrumentTypeSpec,
                range_minimum: rangeMinimum,
                range_minimum_uom_id: rangeMinimumUOMId,
                range_maximum: rangeMaximum,
                range_maximum_uom_id: rangeMaximumUOMId,
                least_count: leastCount,
                least_count_uom_id: leastCountUOMId,
                size_spec: sizeSpec,
                size_spec_uom_id: sizeSpecUomId,
                lab_id: auth.labId
            }

            console.log(newInstrumentType);

            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify(newInstrumentType)
            };

            const response = await fetch(config.Calibmaster.URL + "/api/instrument-types/create", requestOptions);
            const data = await response.json();
            console.log(data);

            setError("");
            setloading(false);

            const newNotification = {
                title: "Instrument Type Created Successfully",
                description: "",
                icon: "success",
                state: true,
                timeout: 15000,
            };
            dispatch(notificationActions.changenotification(newNotification));
            dispatch(sidebarActions.changesidebar("List-Instrument-Type"));

        } catch (err) {
            const newNotification = {
                title: "Something went wrong",
                description: "",
                icon: "error",
                state: true,
            };
            dispatch(notificationActions.changenotification(newNotification));
            setloading(false);
        }
    }

    return (
        <div className="masterlist">
            <div className="add__masterlist__container">

                <Card className="add__user__card">

                    <div className="add__user__label">
                        <h3>Add Instrument Variants</h3>
                    </div>

                    {/* Instrument Drop Down Start */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Select Instrument"
                                options={instrument}
                                required={true}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                onChange={async (e) => {
                                    setInstrumentValue(e.target.value);

                                    let index = e.target.selectedIndex;
                                    let thisValue = e.target[index].innerText;
                                    let updatedValue = { name: thisValue };

                                    setFullName((shopCart) => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

                                    dispatch(instrumentNameActions.changeInstrumentName(fullName));
                                    setInstrumentErr("");
                                }}
                            />
                            <span className="red">{instrumentErr}</span>
                        </div>
                    </div>
                    {/* Instrument Drop Down Start */}

                    {/* Instrument Type Start */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Instrument Variants"
                                placeholder="Instrument Variants"
                                type="text"
                                onChange={(e) => setInstrumentTypeSpec(e.target.value)}
                                disabled={false}
                            />
                        </div>
                    </div>
                    {/* Instrument Type End */}

                    {/* Range Minimum Start */}
                    <div className="add__user__form add__user__form_devide">

                        <div className="add__user__item">
                            <Input
                                label="Range Minimum"
                                placeholder="Range Minimum"
                                type="number"
                                onChange={(e) => {
                                    setRangeMinimum(e.target.value)

                                    let updatedValue = { rangeMin: e.target.value };
                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));
                                    dispatch(instrumentNameActions.changeInstrumentName(fullName));
                                }}
                                disabled={false}
                            />
                        </div>

                        {/* UOM Drop Down Start */}
                        <div className="add__user__item">
                            <Select
                                label="Select UOM"
                                options={UOM}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                onChange={(e) => { setrangeMinimumUOMId(e.target.value) }}
                            />
                        </div>
                        {/* UOM Drop Down End */}

                    </div>
                    {/* Range Minimum End */}

                    {/* Range Maximum Start */}
                    <div className="add__user__form add__user__form_devide">

                        <div className="add__user__item">
                            <Input
                                label="Range Maximum"
                                placeholder="Range Maximum"
                                type="number"
                                onChange={(e) => {
                                    setRangeMaximum(e.target.value);

                                    let updatedValue = { rangeMax: e.target.value };
                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));
                                }}
                                disabled={false}
                            />
                        </div>

                        {/* UOM Drop Down Start */}
                        <div className="add__user__item">
                            <Select
                                label="Select UOM"
                                options={UOM}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                onChange={(e) => {
                                    setrangeMaximumUOMId(e.target.value);

                                    let index = e.target.selectedIndex;
                                    let thisValue = e.target[index].innerText;
                                    let updatedValue = { rangeUom: thisValue };

                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

                                    dispatch(instrumentNameActions.changeInstrumentName(fullName));
                                }}
                            />
                        </div>
                        {/* UOM Drop Down End */}

                    </div>
                    {/* Range Maximum End */}

                    {/* Least Count Start */}
                    <div className="add__user__form add__user__form_devide">

                        <div className="add__user__item">
                            <label className="custom_lable">Least Count</label>
                            <input
                                type="number"
                                step={0.01}
                                className="least_count"
                                placeholder="Least Count"
                                onChange={(e) => {
                                    setLeastCount(e.target.value);

                                    let updatedValue = { lc: e.target.value };
                                    setFullName(preVal => ({
                                        ...preVal,
                                        ...updatedValue
                                    }));

                                    dispatch(instrumentNameActions.changeInstrumentName(fullName));
                                }}
                            />
                        </div>

                        {/* UOM Drop Down Start */}
                        <div className="add__user__item">
                            <Select
                                label="Select UOM"
                                options={UOM}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                onChange={(e) => {
                                    setLeastCountUOMId(e.target.value);

                                    let index = e.target.selectedIndex;
                                    let thisValue = e.target[index].innerText;
                                    let updatedValue = { lcUOM: thisValue };

                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

                                    dispatch(instrumentNameActions.changeInstrumentName(fullName));
                                }}
                            />
                        </div>
                        {/* UOM Drop Down End */}

                    </div>
                    {/* Least Count End */}

                    {/* Size Spec Start */}
                    <div className="add__user__form add__user__form_devide">

                        <div className="add__user__item">
                            <Input
                                label="Size"
                                placeholder="Size"
                                type="number"
                                onChange={(e) => {
                                    setSizeSpec(e.target.value);

                                    let updatedValue = { size: e.target.value };
                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

                                    dispatch(instrumentNameActions.changeInstrumentName(fullName));
                                }}
                                disabled={false}
                            />
                        </div>

                        {/* UOM Drop Down Start */}
                        <div className="add__user__item">
                            <Select
                                label="Select UOM"
                                options={UOM}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                onChange={(e) => {
                                    setSizeSpecUomId(e.target.value);

                                    let index = e.target.selectedIndex;
                                    let thisValue = e.target[index].innerText;
                                    let updatedValue = { sizeUom: thisValue };

                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

                                    dispatch(instrumentNameActions.changeInstrumentName(fullName));
                                }}
                            />
                        </div>
                        {/* UOM Drop Down End */}

                    </div>
                    {/* Size Spec End */}

                    {/* <pre>{JSON.stringify(fullName, null, 2)}</pre> */}

                    {/* Instrument Full Name End */}
                    <div className="add__user__form add_full_name_area">

                        <div className="add__user__item textarea_area">
                            <Input
                                label="Instrument Full Name"
                                placeholder={"Instrument Full Name"}
                                type="text"
                                disabled={false}
                                required={true}
                                value={customFullName}
                                onChange={(e) => {
                                    setCustomFullName(e.target.value);
                                    setInstrumentFullNameErr("");
                                }}
                                className="rainbow-p-around_medium add__srf__item"
                            />
                            <span className="red">{instrumentFullNameErr}</span>
                        </div>

                        <div className="add__user__item" style={{ marginTop: "15px" }}>
                            <Button
                                label="Generate Name"
                                className="rainbow-m-around_medium"
                                variant="outline-brand"
                                onClick={async () => {
                                    CreateFullNameHandler();
                                }}
                            />
                        </div>

                    </div>
                    {/* Instrument Full Name End */}

                    {/* Submit Button Start */}
                    <div className="add__user__item">
                        <CustomButton
                            label="Add Instrument Type"
                            variant="success"
                            onclick={addInstrumentType}
                        />
                    </div>
                    {/* Submit Button End */}

                    <p className="red center w100">{error}</p>

                    {(loading) ? <Spinner size="medium" /> : ""}

                </Card>

            </div>
        </div>
    )
}

export default CreateInstrumentType;