import { useContext, useState, useEffect } from "react";
import {
  Card,
  Button,
  Input,
  TableWithBrowserPagination,
  Column,
  Spinner,
} from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch } from "react-redux";
import { sidebarActions } from "../../../store/sidebar";
import { addNewId, searchByNameFunction } from "./higherOrderFunction";
import { instrumentIdActions } from "../../../store/instrumentId";

const ListInstrument = () => {
  const auth = useContext(AuthContext);
  const dispatch = useDispatch();

  const [instrumentList, setInstrumentList] = useState([]);
  const [loading, setloading] = useState(false);

  const fetchinstrument = async () => {
    try {
      setloading(true);
      const data = await fetch(
        config.Calibmaster.URL + "/api/instrument/list",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
          body: JSON.stringify({ lab_id: auth.labId }),
        }
      );

      let response = await data.json();
      response = await addNewId(response.data);

      setInstrumentList(response);
      setloading(false);

      const newNotification = {
        title: "Instrument List fetched Successfully",
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
  };

  useEffect(() => {
    fetchinstrument();
  }, []);

  const searchNameFunction = async (val) => {
    if (val) {
      setloading(true);
      setInstrumentList([]);
      const data = await searchByNameFunction(val, auth.labId, auth);
      let response = await addNewId(data);
      setInstrumentList(response);
      setloading(false);
    } else {
      setInstrumentList([]);
      fetchinstrument();
    }
  };

  const EditBtn = (data) => {
    let id = data.row.instrument_id;

    return (
      <Button
        label="Edit"
        onClick={() => {
          redirectHandler(id);
        }}
        variant="success"
        className="rainbow-m-around_medium"
      />
    );
  };

  const redirectHandler = (id) => {
    dispatch(instrumentIdActions.setInstrumentId(id));
    dispatch(sidebarActions.changesidebar("Edit-Instrument"));
  };

  return (
    <div className="users__container">
      <Card className="users__card">
        <div className="users__label">
          <h3>Instrument List</h3>
        </div>

        <div className="searchers__container">
          <div className="searchers">
            <div className="custom__search__container">
              <Input
                label="Search By Instrument Name"
                type="text"
                disabled={false}
                placeholder="Search By Instrument Name"
                onChange={(e) => searchNameFunction(e.target.value)}
                icon={
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="rainbow-color_gray-3"
                  />
                }
                iconPosition="right"
              />
            </div>
          </div>
        </div>

        <TableWithBrowserPagination
          className="labs__table"
          pageSize={15}
          data={instrumentList}
          keyField="id"
        >
          <Column header="Sr No" field="id" />
          <Column header="Instrument Name" field="instrument_name" />
          <Column header="UOM" field="uom_name" />
          <Column header="Discipline" field="instrument_discipline" />
          <Column header="UOM Group" field="group_details" />
          <Column header="Action" field="instrument_id" component={EditBtn} />
        </TableWithBrowserPagination>
      </Card>

      {loading ? <Spinner size="medium" /> : ""}
    </div>
  );
};

export default ListInstrument;