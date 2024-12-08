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
import { addNewId, searchByKindOfQuantity, searchByNameFunction } from './higherOrderFunction';

const ListUOM = () => {

    const auth = useContext(AuthContext);
    const dispatch = useDispatch();

    const [uomList, setUomList] = useState([]);
    const [loading, setloading] = useState(false);

    const fetchUOMs = async () => {
        try {
            setloading(true);
            const data = await fetch(config.Calibmaster.URL + "/api/uom/list", {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
            });

            let response = await data.json();
            response = await addNewId(response.data);
            // console.log(response);
            setUomList(response);
            setloading(false);

            const newNotification = {
                title: "UOM List fetched Successfully",
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
        fetchUOMs();
    }, []);

    const EditBtn = (data) => {

        let id = data.row.uom_id;

        return <Button
            label="Edit"
            onClick={() => { redirectHandler(id) }}
            variant="success"
            className="rainbow-m-around_medium"
        />
    }

    const redirectHandler = (id) => {
        dispatch(labIdActions.setLabId(id));
        dispatch(sidebarActions.changesidebar("Edit-UOM"));
    }

    const searchNameFunction = async (val) => {
        if (val !== "") {
            try {
                setloading(true);
                const data = await searchByNameFunction(val, auth);
                let response = await addNewId(data);
                console.log(response);
                setUomList(response);
                return setloading(false);
            } catch (error) {
                console.log(error);
                setloading(false);
                const errNotification = {
                    title: "Something went wrong",
                    description: "",
                    icon: "error",
                    state: true,
                    timeout: 1500,
                };
                return dispatch(notificationActions.changenotification(errNotification));
            }
        } else {
            setUomList([]);
            return fetchUOMs();
        }
    }

    const searchQuantityFunction = async (val) => {
        if (val !== "") {
            try {
                setloading(true);
                const data = await searchByKindOfQuantity(val, auth);
                let response = await addNewId(data);
                console.log(response);
                setUomList(response);
                return setloading(false);
            } catch (error) {
                console.log(error);
                setloading(false);
                const errNotification = {
                    title: "Something went wrong",
                    description: "",
                    icon: "error",
                    state: true,
                    timeout: 1500,
                };
                return dispatch(notificationActions.changenotification(errNotification));
            }
        } else {
            setUomList([]);
            return fetchUOMs();
        }
    }

    return (
        <div className="users__container">
            <Card className="users__card">

                <div className="users__label">
                    <h3>UOM List</h3>
                </div>

                <div className="searchers__container">

                    <div className="searchers">
                        <div className="custom__search__container">
                            <Input
                                label="Search By UOM Name"
                                type="text"
                                disabled={false}
                                placeholder="Search By UOM Name"
                                onChange={(e) => searchNameFunction(e.target.value)}
                                icon={
                                    <FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />
                                }
                                iconPosition="right"
                            />
                        </div>
                    </div>

                    <div className="searchers">
                        <div className="custom__search__container">
                            <Input
                                label="Search By Kind Of Quantity"
                                type="text"
                                disabled={false}
                                placeholder="Search By Kind Of Quantity"
                                onChange={(e) => searchQuantityFunction(e.target.value)}
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
                    data={uomList}
                    keyField="id"
                >
                    <Column header="Sr No" field="id" />
                    <Column header="UOM Name" field="uom_name" />
                    <Column header="UOM kind Of Quantity" field="uom_kindofquantity" />
                    <Column header="UOM Unit Sysmbol" field="uom_printsysmbol" />
                    {/* <Column header="UOM Casesensitive" field="uom_casesensitive" />
                    <Column header="UOM Caseinsensitive" field="uom_caseinsensitive" /> */}
                    <Column header="Action" field="uom_id" component={EditBtn} />
                </TableWithBrowserPagination>

            </Card>

            {(loading) ? <Spinner size="medium" /> : ""}
        </div>
    )
}

export default ListUOM;