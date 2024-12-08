import React, { useContext, useState, useEffect } from 'react';
import { Card, Button, Input, TableWithBrowserPagination, Column, Spinner } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from '../../../context/auth-context';
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch } from 'react-redux';
import DataTable from 'react-data-table-component';
import { labIdActions } from '../../../store/labId';
import { sidebarActions } from "../../../store/sidebar";
import { addNewId, searchByNameFunction } from './higherOrderFunction';

const ListInstrumentType = () => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [instrumentTypeList, setInstrumentTypeList] = useState([]);
    const [loading, setloading] = useState(false);

    const fetchinstrumentType = async () => {
        try {
            setloading(true);
            const data = await fetch(config.Calibmaster.URL + "/api/instrument-types/list", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ lab_id: auth.labId })
            });

            let response = await data.json();
            response = await addNewId(response.data);

            setInstrumentTypeList(response);
            setloading(false);

            const newNotification = {
                title: "Instrument Type List fetched Successfully",
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
        fetchinstrumentType();
    }, []);

    const searchNameFunction = async (val) => {
        if (val) {
            setloading(true);
            setInstrumentTypeList([]);
            const data = await searchByNameFunction(val, auth);
            let response = await addNewId(data);
            setInstrumentTypeList(response);
            setloading(false);
        } else {
            setInstrumentTypeList([]);
            fetchinstrumentType();
        }
    }

    const EditBtn = (data) => {

        let id = data.row.instrument_type_id;

        return <Button
            label="Edit"
            onClick={() => { redirectHandler(id) }}
            variant="success"
            className="rainbow-m-around_medium"
        />
    }

    const redirectHandler = (id) => {
        console.log(id);
        dispatch(labIdActions.setLabId(id));
        dispatch(sidebarActions.changesidebar("Edit-Instrument-Type"));
    }

    return (
        <div className="users__container">
            <Card className="users__card">

                <div className="users__label">
                    <h3>Instrument Variants List</h3>
                </div>

                <div className="searchers__container">

                    <div className="searchers">
                        <div className="custom__search__container">
                            <Input
                                label="Search By Instrument Full Name"
                                type="text"
                                disabled={false}
                                placeholder="Search By Instrument Full Name"
                                onChange={(e) => searchNameFunction(e.target.value)}
                                icon={
                                    <FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />
                                }
                                iconPosition="right"
                            />
                        </div>
                    </div>

                </div>

                <TableWithBrowserPagination
                    className="labs__table"
                    pageSize={15}
                    data={instrumentTypeList}
                    keyField="id"
                >
                    <Column header="Sr No" field="id" />
                    <Column header="Instrument" field="instrument_name" />
                    <Column header="Instrument Full Name" field="instrument_full_name" />
                    <Column header="UOM" field="ins_uom_name" />
                    <Column header="Discipline" field="ins_dis_name" />
                    <Column header="UOM Group" field="ins_group_name" />
                    <Column
                        header="Action"
                        field="instrument_type_id"
                        component={EditBtn}
                    />
                </TableWithBrowserPagination>

            </Card>

            {(loading) ? <Spinner size="medium" /> : ""}

        </div>
    )
}

export default ListInstrumentType;