import React, { useContext, useEffect, useState } from 'react';
import { Card, Spinner, Input, Select, Button } from 'react-rainbow-components';
import "./style.css";
import CustomInput from '../../Inputs/CustomInput';
import CustomButton from '../../Inputs/CustomButton';
import { useDispatch, useSelector } from 'react-redux';
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from '../../../context/auth-context';
import { sidebarActions } from '../../../store/sidebar';
import {
    populateUomData, populateDisciplineData, populateGroupData, populateInstrumentData,
    findInstrumentValue, findUOMValue
} from './HelperFunction';

const EditInstrumentType = () => {

    const [id, setId] = useState("");
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

    const instrumentTypeId = useSelector((state) => state.labIdKey.current);

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

    // *** fetchinstrumentTypeId ***
    async function fetchinstrumentTypeId() {
        try {

            setloading(true);

            const response = await fetch(config.Calibmaster.URL + "/api/instrument-types/fetch/" + id, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            });
            const data = await response.json();
            // console.log(data?.result);

            setInstrumentValue(data?.result?.instrument_id);
            setInstrumentTypeSpec(data?.result?.instrument_type_spec);

            setRangeMinimum(data?.result?.range_minimum);
            setrangeMinimumUOMId(data?.result?.range_minimum_uom_id);

            setRangeMaximum(data?.result?.range_maximum);
            setrangeMaximumUOMId(data?.result?.range_maximum_uom_id);

            setLeastCount(data?.result?.least_count);
            setLeastCountUOMId(data?.result?.least_count_uom_id);

            setSizeSpec(data?.result?.size_spec);
            setSizeSpecUomId(data?.result?.size_spec_uom_id);

            setCustomFullName(data?.result?.instrument_full_name);

            // Set fullName.name
            let getInsName = await findInstrumentValue(data?.result?.instrument_id, instrument);
            setFullName((prevName) => ({
                ...prevName,
                ...{ name: data?.result?.instrument?.instrument_name }
            }));

            // Set fullName.rangeMin
            setFullName(prevName => ({
                ...prevName,
                ...{ rangeMin: data?.result?.range_minimum }
            }));

            // Set fullName.rangeMax
            setFullName(prevName => ({
                ...prevName,
                ...{ rangeMax: data?.result?.range_maximum }
            }));

            // Set fullName.rangeUom
            await findInstrumentValue(data?.result?.range_maximum_uom_id, UOM);
            setFullName(prevName => ({
                ...prevName,
                ...{ rangeUom: data?.result?.range_maximum_uom?.uom_printsysmbol }
            }));

            // Set fullName.lc
            setFullName(prevName => ({
                ...prevName,
                ...{ lc: data?.result?.least_count }
            }));

            // Set fullName.lcUOM
            await findInstrumentValue(data?.result?.least_count_uom_id, UOM);
            setFullName(prevName => ({
                ...prevName,
                ...{ lcUOM: data?.result?.least_count_uom?.uom_printsysmbol }
            }));

            // Set fullName.size
            setFullName(prevName => ({
                ...prevName,
                ...{ size: data?.result?.size_spec }
            }));

            // Set fullName.sizeUom
            let sizeUomName = await findInstrumentValue(data?.result?.size_spec_uom_id, UOM);
            setFullName(prevName => ({
                ...prevName,
                ...{ sizeUom: data?.result?.size_spec_uom?.uom_printsysmbol }
            }));

        } catch (error) {
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

    useEffect(() => {
        if (instrumentTypeId) {
            setId(instrumentTypeId);
            fetchinstrumentTypeId();
        }
    }, [instrumentTypeId, id]);

    const CreateFullNameHandler = () => {

        let createValue = "";

        if (fullName.name) {
            createValue = fullName.name + " ";
        }
        if (fullName.rangeMin && fullName.rangeMax && fullName.rangeUom && fullName.rangeUom != "Select") {
            createValue = createValue + fullName.rangeMin + "-" + fullName.rangeMax + " " + fullName.rangeUom;
        }

        if (fullName.lc && fullName.lcUOM && fullName.lcUOM != "Select") {
            createValue = createValue + " LC " + fullName.lc + " " + fullName.lcUOM;
        }
        if (fullName.size && fullName.sizeUom && fullName.sizeUom != "Select") {
            createValue = createValue + " Size " + fullName.size + " " + fullName.sizeUom;
        }

        return setCustomFullName(createValue);
    }

    const saveInstrumentType = async () => {

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
                instrument_type_id: id,
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
                size_spec_uom_id: sizeSpecUomId
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

            const response = await fetch(config.Calibmaster.URL + "/api/instrument-types/edit", requestOptions);
            const data = await response.json();
            console.log(data);

            setError("");
            setloading(false);

            const newNotification = {
                title: "Instrument Type Updated Successfully",
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
                        <h3>Edit Instrument Variants</h3>
                    </div>

                    {/* Instrument Drop Down Start */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Select Instrument"
                                options={instrument}
                                required={true}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                value={instrumentValue}
                                onChange={async (e) => {
                                    setInstrumentValue(e.target.value);

                                    let index = e.target.selectedIndex;
                                    let thisValue = e.target[index].innerText;
                                    let updatedValue = { name: thisValue };

                                    setFullName((shopCart) => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

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
                                value={instrumentTypeSpec}
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
                                value={rangeMinimum}
                                onChange={(e) => {
                                    setRangeMinimum(e.target.value)

                                    let updatedValue = { rangeMin: e.target.value };
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
                                value={rangeMinimumUOMId}
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
                                value={rangeMaximum}
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
                                value={rangeMaximumUOMId}
                                onChange={(e) => {
                                    setrangeMaximumUOMId(e.target.value);

                                    let index = e.target.selectedIndex;
                                    let thisValue = e.target[index].innerText;
                                    let updatedValue = { rangeUom: thisValue };

                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

                                }}
                            />
                        </div>
                        {/* UOM Drop Down End */}

                    </div>
                    {/* Range Maximum End */}

                    {/* Least Count Start */}
                    <div className="add__user__form add__user__form_devide">

                        <div className="add__user__item">
                            <Input
                                label="Least Count"
                                placeholder="Least Count"
                                type="number"
                                value={leastCount}
                                disabled={false}
                                onChange={(e) => {
                                    setLeastCount(e.target.value);

                                    let updatedValue = { lc: e.target.value };
                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

                                }}
                            />
                        </div>

                        {/* UOM Drop Down Start */}
                        <div className="add__user__item">
                            <Select
                                label="Select UOM"
                                options={UOM}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                value={leastCountUOMId}
                                onChange={(e) => {
                                    setLeastCountUOMId(e.target.value);

                                    let index = e.target.selectedIndex;
                                    let thisValue = e.target[index].innerText;
                                    let updatedValue = { lcUOM: thisValue };

                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

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
                                value={sizeSpec}
                                onChange={(e) => {
                                    setSizeSpec(e.target.value);

                                    let updatedValue = { size: e.target.value };
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
                                value={sizeSpecUomId}
                                onChange={(e) => {
                                    setSizeSpecUomId(e.target.value);

                                    let index = e.target.selectedIndex;
                                    let thisValue = e.target[index].innerText;
                                    let updatedValue = { sizeUom: thisValue };

                                    setFullName(shopCart => ({
                                        ...shopCart,
                                        ...updatedValue
                                    }));

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
                                onChange={(e) => setCustomFullName(e.target.value)}
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
                            label="Save Instrument Type"
                            variant="success"
                            onclick={saveInstrumentType}
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

export default EditInstrumentType;