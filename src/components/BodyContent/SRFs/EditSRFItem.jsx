import { Spinner, Button, Modal, Input, Textarea } from "react-rainbow-components";
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
import { srfitemsActions } from "../../../store/srfitems";
import { childSrfItemsActions } from "../../../store/childSrfItems";
import { selecteditemsActions } from "../../../store/selecteditems";

const EditSRFItem = (props) => {

  const [isLoading, setIsLoading] = useState(false);
  const [description, setDescription] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [serialno, setSerialNo] = useState("");
  const [idno, setIdno] = useState("");
  const [remarks, setRemarks] = useState("");
  const [ulrno, setULRNo] = useState();
  const [masterlistId, setmasterListId] = useState("");
  const [calibrationDueDate, setCalibrationDueDate] = useState("");
  const [srf_item_no, setSrf_item_no] = useState(0);
  const [error, setError] = useState("");

  const dispatch = useDispatch();
  const instrumentTypes = useSelector((state) => state.masterlist.list);
  const auth = useContext(AuthContext);

  //Default Instrument Types
  const [defaultInstrumentTypes, setDefaultInstrumentTypes] = useState("");

  // Error State
  const [instrumentTypeErr, setInstrumentTypeErr] = useState("");
  const [serialNoErr, setSerialNoErr] = useState("");
  const [remarksErr, setRemarksErr] = useState("");
  const [responseError, setResponseError] = useState("");

  // Fetch Instrument Type List
  useEffect(() => {

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ lab_id: auth?.labId })
    };

    fetch(config.Calibmaster.URL + "/api/instrument-types/list", requestOptions)
      .then(async (response) => {
        const data = await response.json();

        setIsLoading(true);

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
        setIsLoading(false);
      })
      .catch((err) => {
        setIsLoading(false);
        setError("Error While Getting Instrument Types List");
      });
  }, []);

  // Pre Fill All Input Fields
  useEffect(() => {
    // console.log(props?.item);

    setDefaultInstrumentTypes({ label: props?.item?.intrument_type?.instrument_full_name });

    setmasterListId(props?.item?.intrument_type?.instrument_id);
    setMake(props?.item?.make);
    setModel(props?.item?.model);
    setSerialNo(props?.item?.serial_no);
    setIdno(props?.item?.identification_details);
    setRemarks(props?.item?.remarks);
    setSrf_item_no(props?.item?.srf_item_no);
    setULRNo(props?.item?.url_number);

  }, [props.item]);

  const selectItemHandler = (v) => {
    if (v) {
      setDescription(v.name);
      setmasterListId(v.id);
    }
  };

  // *** Get srf-items by id Function Handler ***
  const getSRFDetail = async () => {

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ srfId: props?.item?.srf_id })
    };

    const errornotification = {
      title: "Error while Getting SRF Detail!!",
      icon: "error",
      state: true,
      timeout: 15000,
    };

    fetch(config.Calibmaster.URL + "/api/srf/getsrfbyid", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        dispatch(srfitemsActions.changesrfitems(data.data.items));
      })
      .catch((err) => {
        dispatch(notificationActions.changenotification(errornotification));
        setError("Error while Getting SRF Detail!!");
      });
  };

  //*** Fetch SRF Items ***/
  async function fetchSRFItems() {

    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ labId: auth.labId }),
      };

      const response = await fetch(config.Calibmaster.URL + "/api/srf/getSrfItems", requestOptions);
      const { data } = await response.json();
      const { items } = data;

      const newSRFList = async (arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i].slNo = i + 1;
        }
        console.log(arr)
        return arr;
      }
      let getSRFList = await newSRFList(items);
      dispatch(childSrfItemsActions.changesrfitems(getSRFList));
    } catch (error) {
      console.log(error);
    }
  }

  // Add SRF Items
  const addSrfItemHandler = async () => {

    try {

      const bodyData = {
        lab_id: auth.labId,
        srf_id: props?.item?.srf_id,
        srf_item_id: props?.item?.srf_item_id,
        item: {
          srf_item_no: srf_item_no,
          make: make,
          model: model,
          serial_no: serialno,
          identification_details: idno,
          remarks: remarks,
          url_number: ulrno,
          intrument_type_id: masterlistId
        }
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify(bodyData)
      };

      const response = await fetch(config.Calibmaster.URL + "/api/srf/updateitem", requestOptions);
      const data = await response.json();

      const newNotification = {
        title: data?.message,
        description: "",
        icon: "success",
        state: true,
        timeout: 15000,
      };
      dispatch(notificationActions.changenotification(newNotification));

      // *** Remove the selected srf-items from redux store ***
      dispatch(selecteditemsActions.changeselecteditems([]));
      // *** Get srf-items by id and save redux store ***
      await getSRFDetail();
      // *** Get all srf-items belongs to current lab and save redux store ***
      await fetchSRFItems();
      // *** Close this modal ***
      props.onclose();

    } catch (error) {
      console.log(error);
      setResponseError("Something went wrong.")
    }
  }

  return (
    <div className="new__item__modal__container">
      <Modal
        id="modal-2"
        isOpen={props.isopen}
        onRequestClose={props.onclose}
        title="Edit Item Here"
        footer={
          <div className="rainbow-flex center">
            {responseError && <p className="red">{responseError}</p>}
            <Button label="Save Item" variant="brand"
              onClick={addSrfItemHandler}
            />
            {isLoading ? <Spinner size="medium" /> : null}
          </div>
        }
      >
        <div className="new__item__modal__body">

          {/* Instrument Types */}
          <div className="new__item__item">
            <CustomLookup1
              options={instrumentTypes}
              option={defaultInstrumentTypes}
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
              value={serialno}
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

          {/* Remarks */}
          <div className="new__item__item">
            <Textarea
              label="Remarks"
              value={remarks}
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

          {/* SRF Item Number */}
          <div className="new__item__item">
            <Input
              label="SRF Item Number"
              type="number"
              value={srf_item_no}
              required={true}
              onChange={(e) => {
                setSrf_item_no(e.target.value);
              }}
            />
            <span className="red">{serialNoErr}</span>
          </div>

          {/* ULR Number */}
          <div className="new__item__item">
            <Input
              label="ULR Number"
              value={ulrno}
              readOnly
              type="text"
              onchange={(e) => setULRNo(e.target.value)}
            />
          </div>

        </div>

      </Modal>
    </div>
  );
};

export default EditSRFItem;
