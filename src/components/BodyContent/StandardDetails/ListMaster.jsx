import React, { useContext, useState, useEffect } from 'react';
import { Card, Button, Input, TableWithBrowserPagination, Column, Spinner } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from '../../../context/auth-context';
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch, useSelector } from 'react-redux';
import EditMaster from './EditMaster';
import DataTable from 'react-data-table-component';
import moment from "moment";
import { masterlistActions } from '../../../store/masterlist';
import "./table.css";

const ListMaster = () => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [masterList, setMasterList] = useState([]);

    const [fetchMaster, setFetchMaster] = useState("");
    const [loading, setloading] = useState(false);
    const [editModalOpen, setEditModalOpen] = useState(false);

    const masterListStore = useSelector((state) => state.masterlist.list);

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

                dispatch(masterlistActions.changeitems(response?.data));

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
        fetchMasterLists();
    }, []);


    // *** Create Date Format ***
    const createDateFormat = (dynamicDate) => {
        let formatedDate = "";

        if (dynamicDate !== "") {
            const date = new Date(dynamicDate);
            const currentDate = String(date.getDate()).padStart(2, "0");
            const month = date.toLocaleString("default", { month: "short" });
            const fullYear = date.getFullYear();
            formatedDate = currentDate + "-" + month + "-" + fullYear;
        }
        return formatedDate;
    };

    const columns = [
        {
            name: 'S. No',
            selector: row => row.id,
        },
        {
            name: 'Standard Maintained',
            selector: row => row.standard_maintained,
        },
        {
            name: 'Name Of Equipment',
            selector: row => row.name_of_equipment,
        },
        {
            name: 'UID',
            selector: row => row.uid,
        },
        {
            name: 'Type Of Facility',
            selector: row => row.type_of_facility,
        },
        {
            name: 'make',
            selector: row => row.make,
        },
        {
            name: 'Model Type',
            selector: row => row.model_type,
        },

        {
            name: 'Active',
            selector: row => <>
                <Button
                    label="Edit"
                    onClick={() => MasterViewHandler(row)}
                    variant="brand"
                    size='small'
                    className="rainbow-m-around_medium"
                />
            </>,
        },
        {
            name: 'Master Certificate',
            selector: row => <>
                <Button
                    label="View"
                    onClick={() => masterCertificateHandler(row)}
                    disabled={!row.mastercertificate_filename}
                />
            </>,
        },
    ];

    const ExpandedComponent = ({ data }) => {
        return <div className="dataContainer">

            <div className="customerInfo">
                <b>Year Of Make: </b>
                <span> {data.year_Of_make}</span>
            </div>
            <div className="customerInfo">
                <b>Serial No: </b>
                <span> {data.serial_no}</span>
            </div>
            <div className="customerInfo">
                <b>Asset Number: </b>
                <span> {data.asset_number}</span>
            </div>
            <div className="customerInfo">
                <b>Receipt Date: </b>
                <span> {(data.receipt_date) ? createDateFormat(data.receipt_date) : '--'}</span>
            </div>

            <div className="customerInfo">
                <b>Date Placed In Service: </b>
                <span> {(data.date_placed_in_service) ? createDateFormat(data.date_placed_in_service) : '--'}</span>
            </div>
            <div className="customerInfo">
                <b>Range: </b>
                <span> {data.range}</span>
            </div>
            <div className="customerInfo">
                <b>Least Count: </b>
                <span> {data.least_Count}</span>
            </div>
            <div className="customerInfo">
                <b>Least Product Tolerance: </b>
                <span> {data.least_product_tolerance}</span>
            </div>

            <div className="customerInfo">
                <b>Accuracy: </b>
                <span> {data.accuracy}</span>
            </div>
            <div className="customerInfo">
                <b>History Card number: </b>
                <span> {data.history_card_number}</span>
            </div>
            <div className="customerInfo">
                <b>Department: </b>
                <span> {data.department}</span>
            </div>
            <div className="customerInfo">
                <b>Date Of Last Calibration: </b>
                <span> {(data.date_of_last_calibration_date) ? createDateFormat(data.date_of_last_calibration_date) : '--'}</span>
            </div>

            <div className="customerInfo">
                <b>Calibration Certificate No: </b>
                <span> {data.calibration_certificate_no}</span>
            </div>
            <div className="customerInfo">
                <b>Calibration Frequency: </b>
                <span> {data.calibration_frequency}</span>
            </div>
            <div className="customerInfo">
                <b>Calibration Agency: </b>
                <span> {data.calibration_agency}</span>
            </div>
            <div className="customerInfo">
                <b>Calibrated By: </b>
                <span> {data.calibrated_by}</span>
            </div>

            <div className="customerInfo">
                <b>Equipment Status: </b>
                <span> {data.equipment_status}</span>
            </div>
            <div className="customerInfo">
                <b>Traceability: </b>
                <span> {data.traceability}</span>
            </div>
            <div className="customerInfo">
                <b>Remark: </b>
                <span> {data.remark}</span>
            </div>
            <div className="customerInfo">
                <b>Next Calibration Reminder: </b>
                <span> {data.next_calibration_reminder}</span>
            </div>

            <div className="customerInfo">
                <b>Calibration valid Upto: </b>
                <span> {(data.calibration_valid_upto) ? createDateFormat(data.calibration_valid_upto) : '--'}</span>
            </div>
            <div className="customerInfo">
                <b>Calibration Remainder Date 1: </b>
                <span> {(data.calibration_remainder_date_1) ? createDateFormat(data.calibration_remainder_date_1) : '--'}</span>
            </div>
            <div className="customerInfo">
                <b>Calibration Remainder Date 2: </b>
                <span> {(data.calibration_remainder_date_2) ? createDateFormat(data.calibration_remainder_date_2) : '--'}</span>
            </div>

        </div>
    }

    const MasterViewHandler = (data) => {
        setFetchMaster(data);
        setEditModalOpen(true);
    }

    const viewModalHandler = () => {
        fetchMasterLists();
        setEditModalOpen(false);
    };

    const viewCertificateHandler = async (filename) => {
        try {
            const requestBody = {
                filename
            }
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify(requestBody)
            };

            let response = await fetch(config.Calibmaster.URL + "/api/master-list-equipments/view-certificate", requestOptions);
            if (!response.ok) {
                throw new Error('File Not Found');
            }
            let blob = await response.blob()
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');

        } catch (error) {
            const errNotification = {
                title: "Failed to View Master Certificate",
                icon: "error",
                state: true,
                timeout: 1500,
            };
            dispatch(notificationActions.changenotification(errNotification));
        }
    }

    const masterCertificateHandler = (data) => {
        viewCertificateHandler(data.mastercertificate_filename)
    }

    // *** Search By Asset / Identification No. ***
    const searchAssetIdentificationNoFunction = async (query) => {
        if (query != "") {

            const newArr = [...masterListStore];

            const result = newArr.filter((item) => {
                const regex = new RegExp(query, "i");
                return regex.test(item.asset_number);
            });
            setMasterList(result);
        } else {
            setMasterList([]);
            fetchMasterLists();
        }
    }

    // *** Search By Equipment Name ***
    const searchEquipmentNameFunction = async (query) => {
        if (query != "") {

            const newArr = [...masterListStore];

            const result = newArr.filter((item) => {
                const regex = new RegExp(query, "i");
                return regex.test(item.name_of_equipment);
            });
            setMasterList(result);
        } else {
            setMasterList([]);
            fetchMasterLists();
        }
    }

    // *** Search By Equipment Serial No. ***
    const searchEquipmentSerialNoFunction = async (query) => {
        if (query != "") {

            const newArr = [...masterListStore];

            const result = newArr.filter((item) => {
                const regex = new RegExp(query, "i");
                return regex.test(item.serial_no);
            });
            setMasterList(result);
        } else {
            setMasterList([]);
            fetchMasterLists();
        }
    }

    return (
        <div className="users__container">
            <Card className="users__card">

                <div className="users__label">
                    <h3>Master List Of Equipments</h3>
                </div>

                <div className="searchers__container">

                    <div className="searchers">
                        <div className="custom__search__container">
                            <Input
                                label="Asset Number"
                                type="text"
                                disabled={false}
                                placeholder="Asset Number"
                                onChange={(e) => searchAssetIdentificationNoFunction(e.target.value)}
                                icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
                                iconPosition="right"
                            />
                        </div>
                    </div>

                    <div className="searchers">
                        <div className="custom__search__container">
                            <Input
                                label="Search By Equipment Name"
                                type="text"
                                disabled={false}
                                placeholder="Search By Equipment Name"
                                onChange={(e) => searchEquipmentNameFunction(e.target.value)}
                                icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
                                iconPosition="right"
                            />
                        </div>
                    </div>

                    <div className="searchers">
                        <div className="custom__search__container">
                            <Input
                                label="Search By Serial No."
                                type="text"
                                disabled={false}
                                placeholder="Search By Serial No."
                                onChange={(e) => searchEquipmentSerialNoFunction(e.target.value)}
                                icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
                                iconPosition="right"
                            />
                        </div>
                    </div>

                </div>

                <DataTable
                    columns={columns}
                    data={masterList}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
                />

                {(loading) ? <Spinner size="medium" /> : ""}

            </Card>

            {editModalOpen ? (
                <EditMaster
                    isopen={editModalOpen}
                    onclose={viewModalHandler}
                    fetchMaster={fetchMaster}
                />
            ) : null}

        </div>
    )
}

export default ListMaster;