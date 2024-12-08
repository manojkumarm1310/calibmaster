
import { Spinner, Button, Modal, Input, Textarea, TableWithBrowserPagination, Column } from "react-rainbow-components";
import CustomInput from "../../Inputs/CustomInput";
import CustomTextArea from "../../Inputs/CustomTextArea";
import { useContext, useEffect, useState } from "react";
import { itemSchema } from "../../../Schemas/item";
import { useDispatch, useSelector } from "react-redux";
import { itemsActions } from "../../../store/items";
import { notificationActions } from "../../../store/nofitication";
import CustomSelect from "../../Inputs/CustomSelect";
import { masterlistActions } from "../../../store/masterlist";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import CustomLookup1 from "../../Inputs/CustomLookup1";

const DueDateItemList = (props) => {

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const [isLoaded, setisLoaded] = useState(true);
  const [error, setError] = useState("");
  const dispatch = useDispatch();
  const auth = useContext(AuthContext);

  const monthIndex = monthNames.indexOf(props.month); // Get the zero-based month index
  const day = props.date;
  const dateString = `${props.year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T00:00:00.000Z`;
  const date = new Date(dateString);

  const formattedDate = date.toISOString().split('T')[0];
  const [selectedDate, setSelectedDate] = useState(formattedDate);
  const [items, setItems] = useState([]);

  // *** Create Date Format ***
  const createDateFormat = (dynamicDate) => {
    let formatedDate = "";

    if (dynamicDate !== "") {
      const date = new Date(dynamicDate);
      const currentDate = String(date.getDate()).padStart(2, "0");
      const month = date.toLocaleString("default", { month: "short" });
      const fullYear = date.getFullYear();
      formatedDate = currentDate + "-" + month + "-" + fullYear;
    }
    return formatedDate;
  };

  const fetchDueDatCalibrationItem = async () => {
    try {
      setisLoaded(false);
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ labId: auth.labId, date: selectedDate })
      };

      let response = await fetch(config.Calibmaster.URL + `/api/due-date/calibration-due-date-items`, requestOptions);
      response = await response.json();
      if (response) {
        const indexedItems = response.items.map((item, index) => ({ ...item, index: index + 1, calibration_due_date: createDateFormat(item.calibration_due_date), last_calibration_date: createDateFormat(item.last_calibration_date) }));
        setItems(indexedItems);

        const newNotification = {
          title: "Calibration Detail fetched Successfully",
          description: "",
          icon: "success",
          state: true,
          timeout: 1500,
        };
        dispatch(notificationActions.changenotification(newNotification));
        setisLoaded(true);
      }
    } catch (error) {
      const errornotification = {
        title: "Items Detail not Found",
        icon: "error",
        state: true,
        timeout: 15000,
      };
      dispatch(notificationActions.changenotification(errornotification));
      setisLoaded(true);
    }
  }

  useEffect(() => {
    fetchDueDatCalibrationItem();
  }, [props]);


  return (
    <div style={{ padding: '10%' }}>

      <Modal
        id="modal-2"
        isOpen={props.isopen}
        onRequestClose={props.onclose}
        title="Item "
        style={{ width: '100%', margin: '10%' }}
      >
        {!isLoaded ? <Spinner /> : <div className="new__item__modal__body">
          <TableWithBrowserPagination
            pageSize={7}
            data={items}
            keyField="index"
          >
            <Column header="S.No" field="index" />
            <Column header="Description of Item" field="description" />
            <Column header="Make" field="make" />
            <Column header="Model" field="model" />
            <Column header="Serial_number" field="serial_no" />
            <Column header="Calibration Due Date" field="calibration_due_date" />
            <Column header="Last Calibration" field="last_calibration_date" />
          </TableWithBrowserPagination>
        </div>}
      </Modal>
    </div>
  );
};

export default DueDateItemList;
