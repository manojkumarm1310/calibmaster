import React, { useContext } from 'react';
import { AuthContext } from '../../../context/auth-context';
import { useDispatch } from 'react-redux';
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { Button } from 'react-rainbow-components';

const DownloadCertificate = ({ item }) => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const viewCertificateHandler = async () => {

        try {

            // *** Create Request Body object ***
            const requestBody = {
                srf_item_id: item?.srf_item_id
            }

            // *** Create Request Options object ***
            const requestOptions = {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify(requestBody)
            };

            let response = await fetch(config.Calibmaster.URL + "/api/generate-certificate/download", requestOptions);
            let blob = await response.blob()
            if (response.status !== 200) {
                throw new Error('file not found');
            }
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');

        } catch (error) {
            const errNotification = {
                title: "Failed to View Certificate",
                icon: "error",
                state: true,
            };
            dispatch(notificationActions.changenotification(errNotification));
        }
    }

    return (
        <Button
            label="View Certificate"
            onClick={viewCertificateHandler}
        />
    )
}

export default DownloadCertificate