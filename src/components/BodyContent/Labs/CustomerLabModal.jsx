import { useContext, useEffect, useState } from "react";
import { Card, Avatar, Button, Spinner, Modal } from "react-rainbow-components";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { useDispatch } from "react-redux";
import { notificationActions } from "../../../store/nofitication";
import "./modal.css";

const CustomerLabModal = ({ isopen, onclose, customerLabId }) => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [customerLabInfo, setCustomerLabInfo] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchCustomerLab = async () => {

        try {

            setLoading(true);
            let response = await fetch(config.CustomerPortal.URL + `/api/lab/fetchLab/${customerLabId}`, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            });
            response = await response.json();
            const { status, code, customerLab, message } = response

            if (status == "SUCCESS") {
                setCustomerLabInfo(customerLab);
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
            }
            setLoading(false);
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
        fetchCustomerLab();
    }, []);

    return (
        <Modal
            id="modal-2"
            isOpen={isopen}
            onRequestClose={onclose}
            title="View Customer Lab Info"
        >
            <div className="modal_content_style">
                <p>Name: {customerLabInfo?.lab_name}</p>
                <p>Symbol: {customerLabInfo?.symbol}</p>

                <p>Email: {customerLabInfo?.contact_email}</p>
                <p>Contact Number: {customerLabInfo?.contact_number1}</p>

                <p>Address 1: {customerLabInfo?.address1}</p>
                <p>Address 2: {customerLabInfo?.address2}</p>
                <p>Address 3: {customerLabInfo?.address3}</p>

                <p>City: {customerLabInfo?.city}</p>
                <p>State: {customerLabInfo?.state}</p>

                <p>Country: {customerLabInfo?.country}</p>
                <p>Pincode: {customerLabInfo?.pincode}</p>

                <Card className="modalCard">
                    <h4 style={{ textAlign: "center" }}>Lab Brand Logo</h4>
                    <img src={`${config.CustomerPortal.URL}/images/${customerLabInfo?.brand_logo_filename}`} />
                </Card>

            </div>
        </Modal>
    )
}

export default CustomerLabModal;