import React, { useContext, useState, useEffect } from 'react';
import { Card, Button, Input, Column, Spinner } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from '../../../context/auth-context';
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch } from 'react-redux';
import { labIdActions } from '../../../store/labId';
import { sidebarActions } from "../../../store/sidebar";
import DataTable from 'react-data-table-component';
import { addNewId } from './higherOrderFunction';
import "./table.css";
import "./customer.css";
import CustomerViewModal from './CustomerViewModal';

const ListCustomer = () => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [customerList, setCustomerList] = useState([]);
    const [loading, setloading] = useState(false);

    const [customerId, setCustomerId] = useState("");
    const [customerViewModal, setCustomerViewModal] = useState(false);

    const fetchCustomers = async () => {
        try {
            setloading(true);
            const response = await fetch(config.Calibmaster.URL + "/api/customers/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ labId: auth.labId })
            });

            let { data } = await response.json();
            let modifiedData = await addNewId(data);
            // console.log(modifiedData);

            setCustomerList(modifiedData);
            setloading(false);

            const newNotification = {
                title: "Customer List fetched Successfully",
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

    useEffect(() => {
        fetchCustomers();
    }, []);

    const columns = [
        {
            name: 'S. No',
            selector: row => row.id,
        },
        {
            name: 'Customer Name',
            selector: row => row.customer_name,
        },
        {
            name: 'Customer Code',
            selector: row => row.customer_code,
        },
        {
            name: 'City',
            selector: row => row.city,
        },
        {
            name: 'State',
            selector: row => row.state,
        },
        {
            name: 'Country',
            selector: row => row.country,
        },
        {
            name: 'Active',
            selector: row => <>
                <Button
                    label="Edit Customer"
                    onClick={() => redirectHandler(row.customer_id)}
                    variant="brand"
                    size='small'
                    className="rainbow-m-around_medium"
                />
            </>,
        },
        {
            name: 'Portal Customer',
            selector: row => <>
                <Button
                    label="View"
                    onClick={() => {
                        setCustomerId(row.calibmaster_customer_id);
                        setCustomerViewModal(true);
                    }}
                    variant="outline-brand"
                    size='small'
                    className="rainbow-m-around_medium"
                />
            </>,
        }
    ];

    const ExpandedComponent = ({ data }) => {
        return <div className="dataContainer">

            <div className="customerInfo">
                <b>Address Line 1: </b>
                <span> {data.address1}</span>
            </div>
            <div className="customerInfo">
                <b>Address Line 2: </b>
                <span> {data.address2}</span>
            </div>
            <div className="customerInfo">
                <b>Address Line 3: </b>
                <span> {data.address3}</span>
            </div>

            <div className="customerInfo">
                <b>City: </b>
                <span> {data.city}</span>
            </div>
            <div className="customerInfo">
                <b>State: </b>
                <span> {data.state}</span>
            </div>
            <div className="customerInfo">
                <b>Pincode: </b>
                <span> {data.pincode}</span>
            </div>
            <div className="customerInfo">
                <b>Country: </b>
                <span> {data.country}</span>
            </div>
            <div className="customerInfo">
                <b>GST Number: </b>
                <span> {data.gst_number}</span>
            </div>

            <div className="customerInfo">
                <b>Contact Name: </b>
                <span>
                    {`${data?.customer_contact?.contact_title} ${data?.customer_contact?.contact_fullname}`}
                </span>
            </div>
            <div className="customerInfo">
                <b>Contact Email: </b>
                <span>{data?.customer_contact?.contact_email} </span>
            </div>
            <div className="customerInfo">
                <b>Contact Phone 1: </b>
                <span>{data?.customer_contact?.contact_phone_1} </span>
            </div>
            <div className="customerInfo">
                <b>Contact Phone 2: </b>
                <span>{data?.customer_contact?.contact_phone_2} </span>
            </div>
        </div>
    }

    const redirectHandler = (id) => {
        localStorage.setItem('lab_id', id);
        dispatch(labIdActions.setLabId(id));
        dispatch(sidebarActions.changesidebar("Edit-Customer"));
    }

    const closeCustomerViewModalHandler = () => {
        setCustomerViewModal(false);
    }

    return (
        <div className="users__container">
            <Card className="users__card">

                <div className="users__label">
                    <h3>Customer List</h3>
                </div>

                <DataTable
                    columns={columns}
                    data={customerList}
                    expandableRows
                    expandableRowsComponent={ExpandedComponent}
                />

            </Card>

            {(loading) ? <Spinner size="medium" /> : ""}

            {
                customerViewModal ? <CustomerViewModal
                    isopen={customerViewModal}
                    onclose={closeCustomerViewModalHandler}
                    customerId={customerId}
                /> : ""
            }

        </div>
    )
}

export default ListCustomer;