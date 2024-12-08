import { useContext, useEffect, useState } from "react";
import { Button, Card, Spinner, TableWithBrowserPagination, Column } from "react-rainbow-components";
import config from "../../../utils/config.json";
import axios from "axios";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from '../../../context/auth-context';
import { useDispatch } from "react-redux";
import EditULR from "./EditULR";
import AddNewULR from "./AddNewULR";

const AddUlr = () => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    // *** State For Listing ULR's *** 
    const [ULRList, setULRList] = useState([]);
    const [loading, setloading] = useState(false);

    // *** State For Edit ULR ***
    const [ulrInfo, setUlrInfo] = useState({});
    const [openEditModal, setOpenEditModal] = useState(false);

    // *** State For Proceed To Next Year *** 
    const [openCreateModal, setOpenCreateModal] = useState(false);

    async function fetchData() {

        try {
            setloading(true);
            const response = await axios.get(config.Calibmaster.URL + "/api/ulr-no-generation/fetch-ulr/" + auth.labId);
            const { msg, data } = response.data;

            setULRList(data);
            const newNotification = {
                title: msg,
                icon: "success",
                state: true,
                timeout: 1500,
            };
            dispatch(notificationActions.changenotification(newNotification));
            setloading(false);
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
        fetchData();
    }, [])

    const closeModalHandler = () => {
        setOpenEditModal(false);
        fetchData();
    }

    const closeCreateModalHandler = () => {
        setOpenCreateModal(false);
        fetchData();
    }

    const EditUser = ({ row }) => (
        <Button
            variant="brand"
            label="Edit"
            onClick={() => {
                setUlrInfo(row); setOpenEditModal(true);
            }}
        />
    );

    return (
        <>
            <Card style={{ width: "100%" }}>

                <h3>List ULR</h3>

                {loading && <Spinner />}

                <TableWithBrowserPagination
                    pageSize={5}
                    data={ULRList}
                    keyField="ulr_generation_id"
                >
                    <Column header="SL No." component={({ index }) => index + 1} />
                    <Column header="Accreditation Number" field="accreditationNumber" />
                    <Column header="Current Year" field="currentYear" />
                    <Column header="Location" field="location" />
                    <Column header="Running Number" field="runningNumber" />
                    <Column header="Accredited Scope" field="accreditedScope" />
                    <Column header="Edit" field="ulr_generation_id" component={EditUser} />
                </TableWithBrowserPagination>

                {openEditModal ? (
                    <EditULR
                        isopen={openEditModal}
                        onclose={closeModalHandler}
                        ulrInfo={ulrInfo}
                    />
                ) : null}

            </Card>

            <div style={{ width: '100%', marginTop: '1rem' }}>
                <Button
                    label="Proceed to Next Year"
                    onClick={() => setOpenCreateModal(true)}
                    variant="brand"
                    className="rainbow-m-around_medium"
                />

                {openCreateModal ? (
                    <AddNewULR
                        isopen={openCreateModal}
                        onclose={closeCreateModalHandler}
                    />
                ) : null}
            </div>
        </>

    )
}

export default AddUlr;