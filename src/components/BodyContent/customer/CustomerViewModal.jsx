import { useContext, useEffect, useState } from "react";
import { Card, Avatar, Button, Spinner, Modal } from "react-rainbow-components";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { useDispatch } from "react-redux";
import { notificationActions } from "../../../store/nofitication";
import "./modal.css";

const CustomerViewModal = ({ isopen, onclose, customerId }) => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [customerInfo, setCustomerInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCustomerInfo = async () => {

        try {
            setLoading(true);
            let response = await fetch(config.CustomerPortal.URL + `/api/company/fetchCompany/${customerId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            });
            response = await response.json();
            const { status, code, customer, message } = response

            if (status == "SUCCESS") {
                setCustomerInfo(customer);
                setLoading(false);
                const newNotification = {
                    title: message,
                    icon: "success",
                    state: true,
                    timeout: 1500,
                };
                return dispatch(notificationActions.changenotification(newNotification));
            } else {
                const newNotification = {
                    title: "Something went wrong",
                    icon: "error",
                    state: true,
                    timeout: 1500,
                };
                dispatch(notificationActions.changenotification(newNotification));
                setLoading(false);
            }
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
        fetchCustomerInfo();
    }, []);

    return (
        <Modal
            id="modal-2"
            isOpen={isopen}
            onRequestClose={onclose}
            title="View Customer Info"
        >
            <div className="modal_content_style">
                {loading ? <Spinner /> : ""}
                <p>Cutomer Name: {customerInfo?.companyname}</p>
                <p>Customer Email: {customerInfo?.email}</p>

                <p>Address Line 1: {customerInfo?.address1}</p>
                <p>Address Line 2: {customerInfo?.address2}</p>
                <p>Address Line 3: {customerInfo?.address3}</p>
            </div>
        </Modal>
    )
}

export default CustomerViewModal;