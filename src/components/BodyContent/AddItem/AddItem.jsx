import "./AddItem.css";
import { Spinner, Button, Modal, Input, Textarea, Select } from "react-rainbow-components";
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
import { number } from "yup";
import CustomDatePicker from "../../Inputs/CustomDatePicker";

const AddItem = (props) => {

  const [isLoaded, setisLoaded] = useState(true);
  const [error, setError] = useState("");
  const [description, setDescription] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [serialno, setSerialNo] = useState("");
  const [idno, setIdno] = useState("");
  const [remarks, setRemarks] = useState("");
  const [ulrno, setULRNo] = useState();
  const [masterlistId, setmasterListId] = useState("");
  const [unitOptions, setUnitOptions] = useState([]);
  const [calibrationDueDate, setCalibrationDueDate] = useState("");
  const [srf_item_no, setSrf_item_no] = useState(1);
  const [reminder_frequency, setReminder_frequency] = useState("0");
  const [frequency_days, setFrequency_days] = useState("0");

  const dispatch = useDispatch();
  const masterlist = useSelector((state) => state.masterlist.list);
  const auth = useContext(AuthContext);

  // Error State
  const [instrumentTypeErr, setInstrumentTypeErr] = useState("");
  const [serialNoErr, setSerialNoErr] = useState("");
  const [remarksErr, setRemarksErr] = useState("");

  useEffect(() => {

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ lab_id: auth.labId }),
    };

    fetch(config.Calibmaster.URL + "/api/instrument-types/list", requestOptions)
      .then(async (response) => {
        const data = await response.json();

        // console.log(data);
        setisLoaded(true);

        let oldmasterlist = data.data;
        const modified = oldmasterlist.map((v, i) => {
          return {
            id: v.instrument_type_id,
            sno: i + 1,
            name: v.instrument_full_name,
            units: v.ins_uom_name
          };
        });
        dispatch(masterlistActions.changeitems(modified));
      })
      .catch((err) => {
        setisLoaded(true);
        setError("Error While Getting Masterlist!!");
      });
  }, []);

  const newitemHandler = async () => {
    setisLoaded(false);

    const newitem = {
      description,
      make,
      model,
      serialno,
      idno,
      remarks,
      ulrno,
      masterlistId: masterlistId,
      calibrationDueDate: `${calibrationDueDate}`,
      reminder_frequency,
      frequency_days
    };

    // return console.log(newitem);

    if (masterlistId == "") {
      setInstrumentTypeErr("Instrument Type is required");
      setisLoaded(true);
      return;
    }

    if (serialno == "") {
      setSerialNoErr("Serial Number is required");
      setisLoaded(true);
      return;
    }

    if (remarks == "") {
      setRemarksErr("Remarks is required");
      setisLoaded(true);
      return;
    }

    const newNotification = {
      title: "Item Added Successfully",
      description: description,
      icon: "info",
      state: true,
      timeout: 10000,
    };
    dispatch(itemsActions.additem(newitem));
    dispatch(notificationActions.changenotification(newNotification));
    props.onclose();
  };

  const selectItemHandler = (v) => {
    // console.log(v);
    if (v) {
      setDescription(v.name);
      setmasterListId(v.id);
    }
  };

  return (
    <div className="new__item__modal__container">

      <Modal
        id="modal-2"
        isOpen={props.isopen}
        onRequestClose={props.onclose}
        title="New Item"
        footer={
          <div className="rainbow-flex center">
            <p className="red">{error}</p>
            {!isLoaded ? <Spinner size="medium" /> : null}
            <Button label="Add Item" variant="brand" onClick={newitemHandler} />
          </div>
        }
      >
        <div className="new__item__modal__body">

          {/* Instrument Types */}
          <div className="new__item__item">
            <CustomLookup1
              options={masterlist}
              onselect={(v) => selectItemHandler(v)}
              setInstrumentTypeErr={setInstrumentTypeErr}
              label={"Instrument Types"}
              required={true}
            />
            <span className="red">{instrumentTypeErr}</span>
          </div>

          {/* Make */}
          <div className="new__item__item">
            <CustomInput
              label="Make"
              value={make}
              type="text"
              onchange={(v) => setMake(v)}
            />
          </div>

          {/* Model */}
          <div className="new__item__item">
            <CustomInput
              label="Model"
              value={model}
              type="text"
              onchange={(v) => setModel(v)}
            />
          </div>

          {/* Serial Number */}
          <div className="new__item__item">
            <Input
              label="Serial Number"
              type="text"
              required={true}
              onChange={(e) => {
                setSerialNo(e.target.value);
                setSerialNoErr("");
              }}
            />
            <span className="red">{serialNoErr}</span>
          </div>

          {/* Id/Asset Number */}
          <div className="new__item__item">
            <CustomInput
              label="Id/Asset Number"
              value={idno}
              type="text"
              onchange={(v) => setIdno(v)}
            />
          </div>

          {/* Frequency in Months */}
          <div className="new__item__item">
            <Input
              label="Next Calibration (in Months)"
              type="number"
              min={0}
              onChange={(e) => {
                const { value } = e.target;
                if (0 <= value) setReminder_frequency(value)
              }}
              value={reminder_frequency}
            />
          </div>

          {/* Next Calibration Reminder */}
          <div className="new__item__item">
            <Select
              label="Next Calibration Reminder"
              options={
                [
                  { value: '0', label: 'No Reminder' },
                  { value: '1', label: '1 Reminder 7 days before' },
                  { value: '2', label: '2 Reminders 15 days before' }
                ]
              }
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              onChange={(e) => setFrequency_days(e.target.value)}
              value={frequency_days}
            />
          </div>

          {/* Remarks */}
          <div className="new__item__item">
            <Textarea
              label="Remarks"
              onChange={(e) => {
                setRemarks(e.target.value);
                setRemarksErr("");
              }}
              rows={5}
              required={true}
              disabled={false}
            />
            <span className="red">{remarksErr}</span>
          </div>

        </div>

      </Modal>

    </div>
  );
};

export default AddItem;
