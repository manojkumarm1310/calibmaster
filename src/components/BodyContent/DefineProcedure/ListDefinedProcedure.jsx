import React, { useContext, useState, useEffect } from 'react';
import { Modal, Card, Button, Input, TableWithBrowserPagination, Column, Spinner } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClone } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from '../../../context/auth-context';
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch } from 'react-redux';
import { sidebarActions } from "../../../store/sidebar";
import EditDefinedProdedureModal from './EditDefinedProdedureModal';
import ReviewProcedureModal from './ReviewProcedure/ReviewProcedureModal';
import TestProcedureModal from './TestProcedure/TestProcedureModal';

const ListDefinedProcedure = () => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [data, setData] = useState([]);
    const [loading, setloading] = useState(false);

    const [masterId, setMasterId] = useState("");
    const [openModal, setOpenModal] = useState(false);
    const [reviewModal, setReviewModal] = useState(false);
    const [testModal, setTestModal] = useState(false);

    const fetchDefinedProcedures = async () => {

        try {

            setloading(true);
            const data = await fetch(config.Calibmaster.URL + "/api/design-procedures/findAllList", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ lab_id: auth.labId })
            });

            let response = await data.json();
            setData(response);
            setloading(false);

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
        }
    }

    useEffect(() => {
        fetchDefinedProcedures();
    }, []);

    const duplicateDefinedProcedure = async (masterId) => {
        try {
            const data = await fetch(config.Calibmaster.URL + "/api/design-procedures/duplicate-defined-procedure", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({
                    master_design_procedure_id: masterId,
                    lab_id: auth.labId
                })
            });

            let { procedureName } = await data.json();

            await fetchDefinedProcedures();

            const newNotification = {
                title: `Copy of ${procedureName} added Successfully`,
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

    const openModalHandler = (id) => {
        setMasterId(id);
        setOpenModal(true);
    }

    const closeModalHandler = () => {
        setOpenModal(false);
        fetchDefinedProcedures();
    }

    const closeReviewModalHandler = () => setReviewModal(false);

    const closeTestModalHandler = () => setTestModal(false);

    const EditBtn = (data) => {

        let id = data.row.master_design_procedure_id;

        return <Button
            label="Edit"
            onClick={() => { openModalHandler(id) }}
            variant="success"
            className="rainbow-m-around_medium"
        />
    }

    const reviewBtn = (data) => {

        let id = data.row.master_design_procedure_id;
        return <Button
            label="Review"
            variant="outline-brand"
            className="rainbow-m-around_medium"
            onClick={() => { setMasterId(id); setReviewModal(true); }}
        />
    }

    const testBtn = (data) => {
        let id = data.row.master_design_procedure_id;
        return <Button
            label="Test"
            variant="border"
            className="rainbow-m-around_medium"
            onClick={() => { setMasterId(id); setTestModal(true); }}
        />
    }
    const DuplicateBtn = (data) => {
        let id = data.row.master_design_procedure_id;
        return <Button
            variant="success"
            className="rainbow-m-around_medium"
            onClick={() => {
                let userConfirmed = confirm(`Are you sure you want to add another copy of ${data.row.calibration_procedure}`);
                if (userConfirmed) duplicateDefinedProcedure(id);
            }}
        >{"Duplicate"}<FontAwesomeIcon icon={faClone} style={{ paddingLeft: '10px' }} />
        </Button>
    }
    return (
        <div className="">

            <Card className="">

                <h3 className=''>Defined Procedures List</h3>

                <TableWithBrowserPagination
                    className="labs__table"
                    pageSize={15}
                    data={data} isLoading={loading}
                    keyField="master_design_procedure_id"
                >
                    <Column header="Sr No" field="master_design_procedure_id" component={(data) => data?.index + 1} />
                    <Column header="Calibration Procedure" field="calibration_procedure" />
                    <Column header="Action" component={EditBtn} />
                    <Column header="Review" component={reviewBtn} />
                    <Column header="Test" component={testBtn} />
                    <Column header="Duplicate" component={DuplicateBtn} />
                </TableWithBrowserPagination>

            </Card>

            {openModal &&
                <EditDefinedProdedureModal isOpen={openModal} onRequestClose={closeModalHandler} masterId={masterId} />
            }

            {reviewModal &&
                <ReviewProcedureModal isOpen={reviewModal} onRequestClose={closeReviewModalHandler} masterId={masterId} />
            }

            {testModal &&
                <TestProcedureModal isOpen={testModal} onRequestClose={closeTestModalHandler} masterId={masterId} />
            }
        </div>
    )
}

export default ListDefinedProcedure;