import React, { useContext, useEffect, useState } from 'react';
import { Modal, Spinner, Button, Card, Input, DatePicker, Select, Textarea, FileSelector } from "react-rainbow-components";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { getBase64, populateDisciplineData, populateGroupData } from './HelperFunction';
import "./StandardDetails.css";
import { formattedDate } from '../../helpers/Helper';

const EditMaster = (props) => {

    const { fetchMaster } = props;

    const [Discipline, setDiscipline] = useState([]);
    const [Group, setGroup] = useState([]);

    const [disciplineValue, setDisciplineValue] = useState(fetchMaster?.instrument_discipline_id);
    const [groupValue, setGroupValue] = useState(fetchMaster?.instrument_group_id);
    const [enableGroup, setenableGroup] = useState(true);

    const [masterId, setMasterId] = useState(fetchMaster?.master_list_equipment_id);
    const [standardMaintained, setStandardMaintained] = useState(fetchMaster?.standard_maintained);
    const [nameOfEquipment, setNameOfEquipment] = useState(fetchMaster?.name_of_equipment);
    const [uid, setUid] = useState(fetchMaster?.uid);
    const [typeOfFacility, setTypeOfFacility] = useState(fetchMaster?.type_of_facility);
    const [make, setMake] = useState(fetchMaster?.make);
    const [modelType, setModelType] = useState(fetchMaster?.model_type);
    const [yearOfMake, setYearOfMake] = useState(fetchMaster?.year_Of_make);
    const [serialNo, setSerialNo] = useState(fetchMaster?.serial_no);
    const [assetNumber, setAssetNumber] = useState(fetchMaster?.asset_number);
    const [receiptDate, setReceiptDate] = useState(fetchMaster?.receipt_date);
    const [datePlacedInService, setDatePlacedInService] = useState(fetchMaster?.date_placed_in_service);
    const [range, setRange] = useState(fetchMaster?.range);
    const [leastCount, setLeastCount] = useState(fetchMaster?.least_Count);
    const [leastProductTolerance, setLeastProductTolerance] = useState(fetchMaster?.least_product_tolerance);
    const [accuracy, setAccuracy] = useState(fetchMaster?.accuracy);
    const [historyCardNumber, setHistoryCardNumber] = useState(fetchMaster?.history_card_number);
    const [department, setDepartment] = useState(fetchMaster?.department);
    const [dateOfLastCalibrationDate, setDateOfLastCalibrationDate] = useState(fetchMaster?.date_of_last_calibration_date);
    const [calibrationCertificateNo, setCalibrationCertificateNo] = useState(fetchMaster?.calibration_certificate_no);
    const [calibrationFrequency, setCalibrationFrequency] = useState(fetchMaster?.calibration_frequency);
    const [calibrationValidUpto, setCalibrationValidUpto] = useState(fetchMaster?.calibration_valid_upto);
    const [calibrationAgency, setCalibrationAgency] = useState(fetchMaster?.calibration_agency);
    const [calibratedBy, setCalibratedBy] = useState(fetchMaster?.calibrated_by);
    const [equipmentStatus, setEquipmentStatus] = useState([
        { value: '--', label: 'Select' },
        { value: 'Calibrated', label: 'Calibrated' },
        { value: 'Expired', label: 'Expired' },
        { value: 'Sent for Calibration', label: 'Sent for Calibration' },
        { value: 'Under Repair', label: 'Under Repair' },
        { value: 'Retired', label: 'Retired' }
    ]);
    const [equipmentStatusValue, setEquipmentStatusValue] = useState(fetchMaster?.equipment_status);
    const [traceablity, setTraceablity] = useState(fetchMaster?.traceability);
    const [nextCalibrationRemainder, setNextCalibrationRemainder] = useState(fetchMaster?.next_calibration_reminder);
    const [remark, setRemark] = useState(fetchMaster?.remark);
    const [masterCalibration, setMasterCalibration] = useState("");

    const [masterCalibrationErr, setMasterCalibrationErr] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const fetchData = async () => {
        try {

            setLoading(true);
            const disciplineResponse = await fetch(config.Calibmaster.URL + "/api/instrument-discipline/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            }).then((res) => res.json());
            let getDisciplineData = await populateDisciplineData(disciplineResponse.data);
            setDiscipline(getDisciplineData);

            setLoading(false);
        } catch (error) {
            console.log(error);
            const errNotification = {
                title: "Something went wrong",
                description: "",
                icon: "error",
                state: true,
                timeout: 1500,
            };
            dispatch(notificationActions.changenotification(errNotification));
            setLoading(false);
        }
    }

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        if (props.fetchMaster) {
            disciplineHandler(disciplineValue);
        }
    }, [props]);

    // TODO: Handles file uploads
    const handleFileChange = async (files) => {
        const file = files[0];
        if (file) {
            const validTypes = [
                'image/jpeg',
                'image/jpg',
                'image/png',
                'application/pdf'
            ];
            if (!validTypes.includes(file.type)) {
                setMasterCalibrationErr('Please select a JPEG, PNG, or PDF file.');
                return;
            }
            if (file.size > 2 * 1024 * 1024) {
                setMasterCalibrationErr('File size must be less than 2MB.');
            } else {
                try {
                    const base64 = await getBase64(file);
                    setMasterCalibration(base64);
                    setMasterCalibrationErr('');
                } catch (error) {
                    setMasterCalibrationErr('Error While converting file.');
                };
            }
        };
    }

    const disciplineHandler = async (id) => {
        try {
            if (id != "") {
                setLoading(true);
                setDisciplineValue(id);

                const groupResponse = await fetch(config.Calibmaster.URL + `/api/instrument-groups/fetch/${id}`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: "Bearer " + auth.token,
                    },
                }).then((res) => res.json());
                let getGroupData = await populateGroupData(groupResponse.data)

                // console.log(getGroupData.length);

                setGroup(getGroupData);
                setenableGroup(false);
                setLoading(false);
            } else {
                setenableGroup(true);
                setLoading(false);
                return;
            }
        } catch (error) {
            console.log(error);
            const errNotification = {
                title: "Error While Getting Instrument Group!!!",
                icon: "error",
                state: true,
                timeout: 15000,
            };
            dispatch(notificationActions.changenotification(errNotification));
            setError("Error While Getting Instrument Group!!!");
            setLoading(false);
        }
    }

    const editMasterListHandler = async () => {

        if (disciplineValue == "") {
            setError("Select a Discipline");
            return false;
        }
        if (groupValue == "") {
            setError("Select a Group");
            return false;
        }
        if (nameOfEquipment == "") {
            setError("Name of equipment is required");
            return false;
        }
        if (make == "") {
            setError("Make is required");
            return false;
        }
        if (modelType == "") {
            setError("Model type is required");
            return false;
        }
        if (yearOfMake == "") {
            setError("Year Of Make is required");
            return false;
        }
        if (serialNo == "") {
            setError("Serial No is required");
            return false;
        }
        if (receiptDate == "") {
            setError("Receipt Date is required");
            return false;
        }
        if (datePlacedInService == "") {
            setError("Date Placed In Service is required");
            return false;
        }
        if (historyCardNumber == "") {
            setError("History Card Number is required");
            return false;
        }
        if (dateOfLastCalibrationDate == "") {
            setError("Date Of Last Calibration Date is required");
            return false;
        }
        if (calibrationCertificateNo == "") {
            setError("Calibration Certificate No is required");
            return false;
        }
        if (calibrationValidUpto == "") {
            setError("Calibration Valid upto is required");
            return false;
        }
        if (calibrationAgency == "") {
            setError("Calibration Agency is required");
            return false;
        }
        if (equipmentStatusValue == "") {
            setError("Equipment Status is required");
            return false;
        }
        if (nextCalibrationRemainder == "") {
            setError("Next Calibration Remainder is required");
            return false;
        }

        setError("");

        try {

            const requestBody = {

                master_list_equipment_id: masterId,

                lab_id: auth.labId,
                instrument_discipline_id: disciplineValue,
                instrument_group_id: groupValue,

                standard_maintained: standardMaintained,
                name_of_equipment: nameOfEquipment,
                uid: uid,
                type_of_facility: typeOfFacility,

                make: make,
                model_type: modelType,
                year_Of_make: yearOfMake,
                serial_no: serialNo,
                asset_number: assetNumber,

                receipt_date: receiptDate,
                date_placed_in_service: datePlacedInService,
                range: range,
                least_Count: leastCount,
                least_product_tolerance: leastProductTolerance,
                accuracy: accuracy,
                history_card_number: historyCardNumber,
                department: department,

                date_of_last_calibration_date: dateOfLastCalibrationDate,
                calibration_certificate_no: calibrationCertificateNo,
                calibration_frequency: calibrationFrequency,
                calibration_valid_upto: calibrationValidUpto,
                calibration_agency: calibrationAgency,
                calibrated_by: calibratedBy,

                equipment_status: equipmentStatusValue,
                traceability: traceablity,
                next_calibration_reminder: nextCalibrationRemainder,
                remark: remark,
                master_calibration: masterCalibration
            }

            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify(requestBody)
            };

            const response = await fetch(config.Calibmaster.URL + "/api/master-list-equipments/update", requestOptions);
            const data = await response.json();

            if (data?.code == 200) {
                const newNotification = {
                    title: data?.response,
                    icon: "success",
                    state: true,
                    timeout: 10000,
                };
                dispatch(notificationActions.changenotification(newNotification));
                props.onclose();
            } else {
                const newNotification = {
                    title: data?.message,
                    icon: "error",
                    state: true,
                    timeout: 15000,
                };
                dispatch(notificationActions.changenotification(newNotification));
                setError(data?.message);
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
        <div className="view_master_modal_container">
            <Modal
                id="view__srf"
                isOpen={props.isopen}
                onRequestClose={props.onclose}
                title="Edit Master Equipment"
                className="view__master__modal"
                footer={
                    <div className="edit_master_modal_footer">
                        <Button
                            className="rainbow-m-right_large"
                            label="Update"
                            variant="neutral"
                            onClick={editMasterListHandler}
                        />
                        {error && <p style={{ color: "red" }}>{error}</p>}
                    </div>
                }
            >
                <Card className="add__user__card" style={{ width: "90%", margin: "auto" }}>

                    {/* Discipline Drop Down */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Select Discipline"
                                options={Discipline}
                                required={true}
                                value={disciplineValue}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                onChange={(e) => disciplineHandler(e.target.value)}
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
                                value={groupValue}
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                disabled={enableGroup}
                                onChange={(e) => setGroupValue(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Standard Maintained */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Standard Maintained"
                                placeholder="Standard Maintained"
                                type="text"
                                value={standardMaintained}
                                disabled={false}
                                onChange={(e) => setStandardMaintained(e.target.value)}
                            />
                        </div>
                    </div>

                    {/*Name Of Equipment */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Name Of Equipment"
                                placeholder="Name Of Equipment"
                                type="text"
                                value={nameOfEquipment}
                                disabled={false}
                                required={true}
                                onChange={(e) => setNameOfEquipment(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* UID */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Enter UID"
                                placeholder="Enter UID"
                                type="text"
                                value={uid}
                                disabled={false}
                                onChange={(e) => setUid(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Type Of Facility */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Type Of Facility"
                                placeholder="Type Of Facility"
                                type="text"
                                value={typeOfFacility}
                                disabled={false}
                                onChange={(e) => setTypeOfFacility(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Make  */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Make"
                                placeholder="Make"
                                type="text"
                                value={make}
                                disabled={false}
                                required={true}
                                onChange={(e) => setMake(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Model Type */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Model Type"
                                placeholder="Model Type"
                                type="text"
                                value={modelType}
                                disabled={false}
                                required={true}
                                onChange={(e) => setModelType(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Year Of Make */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Year Of Make"
                                placeholder="Year Of Make"
                                type="text"
                                value={yearOfMake}
                                disabled={false}
                                required={true}
                                onChange={(e) => setYearOfMake(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Serial No. */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Serial No."
                                placeholder="Serial No."
                                type="text"
                                value={serialNo}
                                disabled={false}
                                required={true}
                                onChange={(e) => setSerialNo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Asset Number */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Asset Number"
                                placeholder="Asset Number"
                                type="text"
                                value={assetNumber}
                                disabled={false}
                                onChange={(e) => setAssetNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Receipt Date */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <DatePicker
                                value={receiptDate}
                                label="Receipt Date"
                                onChange={(value) => { setReceiptDate(formattedDate(value)) }}
                                disabled={false}
                                required={true}
                            />
                        </div>
                    </div>

                    {/* Date Placed In Service */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <DatePicker
                                value={datePlacedInService}
                                label="Date Placed In Service"
                                onChange={(value) => { setDatePlacedInService(formattedDate(value)) }}
                                disabled={false}
                                required={true}
                            />
                        </div>
                    </div>

                    {/* Range */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Range"
                                placeholder="Range"
                                type="text"
                                value={range}
                                disabled={false}
                                onChange={(e) => setRange(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Least Count */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Least Count"
                                placeholder="Least Count"
                                type="text"
                                value={leastCount}
                                disabled={false}
                                onChange={(e) => setLeastCount(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Least Product Tolerance */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Least Product Tolerance"
                                placeholder="Least Product Tolerance"
                                type="text"
                                value={leastProductTolerance}
                                disabled={false}
                                onChange={(e) => setLeastProductTolerance(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Accuracy */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Accuracy"
                                placeholder="Accuracy"
                                value={accuracy}
                                type="text"
                                disabled={false}
                                onChange={(e) => setAccuracy(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* History Card Number */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="History Card Number"
                                placeholder="History Card Number"
                                type="text"
                                value={historyCardNumber}
                                disabled={false}
                                required={true}
                                onChange={(e) => setHistoryCardNumber(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Department */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Department"
                                placeholder="Department"
                                type="text"
                                value={department}
                                disabled={false}
                                onChange={(e) => setDepartment(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Date Of Last Calibration Date */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <DatePicker
                                value={dateOfLastCalibrationDate}
                                label="Date Of Last Calibration Date"
                                onChange={(value) => { setDateOfLastCalibrationDate(formattedDate(value)) }}
                                disabled={false}
                                required={true}
                            />
                        </div>
                    </div>

                    {/* Calibration Certificate No */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Calibration Certificate No"
                                placeholder="Calibration Certificate No"
                                type="text"
                                value={calibrationCertificateNo}
                                disabled={false}
                                required={true}
                                onChange={(e) => setCalibrationCertificateNo(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Calibration Frequency */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Calibration Frequency"
                                value={calibrationFrequency}
                                options={[
                                    { value: 'Once In Every Year', label: 'Once In Every Year' },
                                    { value: 'Once In 2 Year', label: 'Once In 2 Year' },
                                    { value: 'Once In 6 Months', label: 'Once In 6 Months' }
                                ]}
                                onChange={(e) => setCalibrationFrequency(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Calibration Valid Upto */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <DatePicker
                                value={calibrationValidUpto}
                                label="Calibration Valid Upto"
                                onChange={(value) => { setCalibrationValidUpto(formattedDate(value)) }}
                                disabled={false}
                                required={true}
                            />
                        </div>
                    </div>

                    {/* Calibration Agency */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Calibration Agency"
                                placeholder="Calibration Agency"
                                type="text"
                                value={calibrationAgency}
                                disabled={false}
                                required={true}
                                onChange={(e) => setCalibrationAgency(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Calibrated By */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Calibrated By"
                                placeholder="Calibrated By"
                                type="text"
                                value={calibratedBy}
                                disabled={false}
                                onChange={(e) => setCalibratedBy(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Equipment Status */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Equipment Status"
                                required={true}
                                value={equipmentStatusValue}
                                options={equipmentStatus}
                                onChange={(e) => setEquipmentStatusValue(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Traceablity */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Input
                                label="Traceablity"
                                placeholder="Traceablity"
                                type="text"
                                value={traceablity}
                                disabled={false}
                                onChange={(e) => setTraceablity(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Next Calibration Remainder */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Select
                                label="Next Calibration Remainder"
                                value={nextCalibrationRemainder}
                                options={[
                                    { value: '1 Reminder 7 days before', label: '1 Reminder 7 days before' },
                                    { value: '2 Reminders 15 days before', label: '2 Reminders 15 days before' },
                                ]}
                                onChange={(e) => setNextCalibrationRemainder(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Remark */}
                    <div className="add__user__form">
                        <div className="add__user__item">
                            <Textarea
                                label="Remark"
                                rows={4}
                                placeholder="Remark"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Master Calibration */}
                    <div className="add__user__form">
                        <div className="add__user__item flex-display">
                            <FileSelector
                                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                                style={{
                                    maxWidth: 300,
                                }}
                                label="Master Certificate"
                                placeholder="Select or Drag and Drop file"
                                bottomHelpText={!masterCalibrationErr ? "Select only one jpeg, png, or pdf file. File size should be less than 2MB" : ''}
                                error={masterCalibrationErr}
                                onChange={handleFileChange}
                                variant="multiline"
                                accept="image/jpg, image/jpeg, image/png, application/pdf"
                            />
                        </div>
                    </div>
                </Card>

            </Modal>
        </div>
    )
}

export default EditMaster