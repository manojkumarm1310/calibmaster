import React, { useState, useEffect, useContext } from 'react';
import { Modal, Button, Card, TableWithBrowserPagination, Column, Select } from 'react-rainbow-components';
import config from "../../../../utils/config.json";
import { AuthContext } from '../../../../context/auth-context';
import { useDispatch } from 'react-redux';
import { notificationActions } from "../../../../store/nofitication";
import EditDefinedProdedureModal from './EditDefinedProdedureModal';

const EnterResult = ({ isOpen, onRequestClose, srfItemInfo }) => {

    const { srf_item_id, srf_id, intrument_type_id } = srfItemInfo

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [setTitle, setSetTitle] = useState(false);
    const [disableFrom, setDisableFrom] = useState(false);

    const [data, setData] = useState([]);
    const [seletecdProcedure, setSeletecdProcedure] = useState("");
    const [loading, setloading] = useState(false);

    const [masterId, setMasterId] = useState("");
    const [openModal, setOpenModal] = useState(false);

    const fetchDefinedProcedures = async () => {

        try {

            setloading(true);
            const data = await fetch(config.Calibmaster.URL + "/api/design-procedures/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({
                    lab_id: auth.labId,
                    instrument_type_id: intrument_type_id,
                    srf_id,
                    srf_item_id,
                })
            });

            let response = await data.json();

            if (response?.is_exist) {

                let newArray = [{ value: '', label: 'Select' }];

                await response?.definedProcedures?.map((item, index) => {
                    newArray[index + 1] = {
                        value: item?.master_design_procedure_id,
                        label: item?.calibration_procedure
                    }
                });

                setData(newArray);

                // setSeletecdProcedure(response?.existingResultMaster?.master_design_procedure_id);

                setMasterId(response?.existingResultMaster?.master_result_table_id);

                setSetTitle(response?.is_exist);

                setDisableFrom(response?.is_exist);

                setOpenModal(true);

                setloading(false);

            } else {

                let newArray = [{ value: '', label: 'Select' }];

                await response?.definedProcedures?.map((item, index) => {
                    newArray[index + 1] = {
                        value: item?.master_design_procedure_id,
                        label: item?.calibration_procedure
                    }
                });

                setData(newArray);
                setloading(false);
            }

            const newNotification = {
                title: "Defined Procedure List fetched Successfully",
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

    useEffect(() => {
        fetchDefinedProcedures();
    }, []);

    const openModalHandler = () => {
        setOpenModal(true);
    }

    const closeModalHandler = () => {
        setOpenModal(false);
    }

    return (
        <Modal
            isOpen={isOpen}
            onRequestClose={onRequestClose}
            title={setTitle ? "Update Result" : "Enter Result"}
            style={{ width: '95%' }}
        >
            <p style={{ display: "none" }}>
                srf_item_id: {JSON.stringify(srf_item_id)},
                srf_id: {JSON.stringify(srf_id)},
                intrument_type_id: {JSON.stringify(intrument_type_id)}
            </p>

            <Card style={{ display: "flex", flexDirection: "column", padding: "1rem", alignItems: "center" }}>

                {/* Select Procedure */}
                <div className="input_group">
                    <Select
                        label="Select Procedure"
                        options={data}
                        required={true}
                        disabled={disableFrom}
                        className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                        onChange={(e) => {
                            setMasterId(e.target.value);
                        }}
                    />
                </div>

                {/* Modal Open button */}
                <Button
                    label="Select"
                    disabled={disableFrom}
                    onClick={() => {
                        console.log(masterId);
                        if (masterId != "") {
                            openModalHandler();
                            setDisableFrom(true);
                        }
                    }}
                    variant="success"
                    style={{ width: "15%", height: "45px" }}
                />

                {openModal &&
                    <EditDefinedProdedureModal
                        isOpen={openModal}
                        onRequestClose={closeModalHandler}
                        masterId={masterId}
                        srf_id={srf_id}
                        srf_item_id={srf_item_id}
                        setSetTitle={setSetTitle}
                        parentModalClose={onRequestClose}
                    />
                }

            </Card>

        </Modal>
    )
}

export default EnterResult;