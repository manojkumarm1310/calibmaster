import "./UpdateCal.css";
import { Card, Modal, Button, Spinner } from "react-rainbow-components";
import StatusBadge from "../../UI/StatusBadge";
import CustomProgress from "../../UI/CustomProgress";
import config from "../../../utils/config.json";
import { useState, useContext } from "react";
import { useDispatch } from "react-redux";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from "../../../context/auth-context";
import { srfitemsActions } from "../../../store/srfitems";
import { useEffect } from "react";
import CustomInput from "../../Inputs/CustomInput";
import CustomSelect from "../../Inputs/CustomSelect";
import CustomDatePicker from "../../Inputs/CustomDatePicker";
import { DatePicker } from "react-rainbow-components";
import { childSrfItemsActions } from "../../../store/childSrfItems";
import DownloadCertificate from "./DownloadCertificate";
import { formattedDate } from "../../helpers/Helper";

const groups = [
  {
    label: "Dimension",
    value: "Dimension",
  },
];
const disciplines = [
  {
    label: "Mechanical",
    value: "Mechanical",
  },
  {
    label: "Electrical",
    value: "Electrical",
  },
];

const UpdateCal = (props) => {

  const auth = useContext(AuthContext);
  const dispatch = useDispatch("");

  const { modalType } = props;

  const [isLoading, setIsLoading] = useState(false);

  const [calibrationDate, setCalibrationDate] = useState("");
  const [calibrationDateErr, setCalibrationDateErr] = useState("");

  const [reportGenerateDate, setReportGenerateDate] = useState("");
  const [reportGenerateDateErr, setReportGenerateDateErr] = useState("");

  // *** Generate Certificate ***
  const [canGenerateCertificate, setCanGenerateCertificate] = useState(false);

  // *** fetch CMS Settings Permissions ***
  const fetchCMSSettings = async () => {
    try {

      const data = await fetch(config.Calibmaster.URL + "/api/cms-permissions-setting/fetch", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth?.token,
        },
        body: JSON.stringify({ lab_id: auth?.labId })
      });

      let response = await data?.json();
      const { result } = response

      result.map((item, index) => {

        if (item.is_enable && item.setting_name === "GENERATE_CERTIFICATE") {
          setCanGenerateCertificate(true);
        }

      });
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

  // *** Create Date Format ***
  const createDateFormat = (value) => {
    let formatedDate = "";

    if (value !== "") {
      const date = new Date(value);
      const currentDate = String(date.getDate()).padStart(2, "0");
      const month = date.toLocaleString("default", { month: "short" });
      const fullYear = date.getFullYear();
      formatedDate = currentDate + "-" + month + "-" + fullYear;
    }
    return formatedDate;
  };

  useEffect(() => {
    // console.log(props.item);

    (props.item.calibration_done_date) ? setCalibrationDate(props.item.calibration_done_date) : setCalibrationDate("");
    (props.item.report_done_date) ? setReportGenerateDate(props.item.report_done_date) : setReportGenerateDate("")

    fetchCMSSettings();
  }, [props]);

  const updateUlrNumber = async () => {

    const requestBody = {
      lab_id: auth?.labId,
      items: [{ srf_item_id: props.item.srf_item_id }]
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify(requestBody),
    };

    let res = await fetch(config.Calibmaster.URL + "/api/ulr-no-generation/update-ulr-number", requestOptions);
    res = await res.json();
  }

  // Update Calalibration Status Handler
  const updatecalHandler = async (mode) => {
    
    if (mode == 1) {
      if (calibrationDate == "") {
        setCalibrationDateErr("Please set the calibration date");
        return;
      }
      updateUlrNumber();
    }

    if (mode == 2) {
      if (reportGenerateDate == "") {
        setReportGenerateDateErr("Please set the report generated date");
        return;
      }
    }

    if (mode == 3) {
      if (calibrationDate == "") {
        setCalibrationDateErr("Please set the calibration date");
        return;
      }

      if (reportGenerateDate == "") {
        setReportGenerateDateErr("Please set the report generated date");
        return;
      }
      updateUlrNumber();
      !(canGenerateCertificate && auth.department === "Manager") && await generateCertificateHandler();
    }

    setIsLoading(true);
    
    const requestBody = {
      id: props.item.srf_item_id,
      srfId: props.item.srf_id,
      mode: mode,
      date: calibrationDate,
      reportGenerateDate: reportGenerateDate,
      userName: auth.name,
    };

    // return console.log(requestBody);

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify(requestBody),
    };

    const errornotification = {
      title: "Error while Updating SRF Item!!",
      description: "Updating SRF Item Failed!!",
      icon: "error",
      state: true,
      timeout: 15000,
    };

    fetch(config.Calibmaster.URL + "/api/srf/updatecalinfo", requestOptions)
      .then(async (response) => {
        const data = await response.json();

        if (data) {
          if (data.code === 200) {
            //console.log(data);
            const newnotification = {
              title: "SRF Item Updated Successfully!!",
              description: "SNo: " + props.item.sno,
              icon: "success",
              state: true,
              timeout: 15000,
            };
            setIsLoading(false);
            dispatch(srfitemsActions.changesrfitems(data.data.items));
            dispatch(notificationActions.changenotification(newnotification));
            await fetchSRFItems();
            props.onclose();
          } else {
            setIsLoading(false);
            errornotification.description = data.message;
            dispatch(notificationActions.changenotification(errornotification));
          }
        } else {
          setIsLoading(false);
          dispatch(notificationActions.changenotification(errornotification));
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoading(false);
        dispatch(notificationActions.changenotification(errornotification));
      });
  };

  // Generate Certificate Handler
  const generateCertificateHandler = async () => {

    try {

      setIsLoading(true);

      if (reportGenerateDate == "") {
        setReportGenerateDateErr("Please set the report generated date");
        setIsLoading(false);
        return;
      }
      const customer_info = {
        "srfId": props?.item?.srf_id,
        "srfNo": (modalType === "srf_items_list") ? props?.srf?.srf_number : props?.item?.srf?.srf_number,
        "name": props?.item?.intrument_type?.instrument_full_name,
        "make": props?.item?.make,
        "model": props?.item?.model,
        "serialno": props?.item?.serial_no,
        "idno": props?.item.identification_details,
        "companyId": (modalType === "srf_items_list") ? props?.srf?.customer_id : props?.item?.srf?.customer?.customer_id
      }

      // Create Request Body object
      const requestBody = {
        lab_id: auth.labId,
        srf_id: props?.item?.srf_id,
        srf_item_id: props?.item?.srf_item_id,
        customer_info
      }
      // return console.log(requestBody);

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + auth.token
        },
        body: JSON.stringify(requestBody)
      };

      const response_1 = await fetch(config.Calibmaster.URL + "/api/generate-certificate/generate", requestOptions);
      const blob = await response_1.blob();

      setIsLoading(false);
      await updatecalHandler(2);

    } catch (err) {
      console.log(err);
      setIsLoading(false);
    }
  }

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
        return arr;
      }
      let getSRFList = await newSRFList(items);
      dispatch(childSrfItemsActions.changesrfitems(getSRFList));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <Modal
      id="modal-1"
      isOpen={props.isOpen}
      onRequestClose={props.onclose}
      className="view__srf__item__modal"
    >
      <h2 className="srf_item_detail center">SRF Item Detail</h2>

      {
        props?.item &&
        <div className="srf__item__details__container">

          <div className="srf__item__detail">
            <p className="bold">
              Serial No: <span className="black normal">{props?.item?.serial_no}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Description: <span className="black normal">{props?.item?.description}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Make: <span className="black normal">{props?.item?.make}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Model: <span className="black normal">{props?.item?.model}</span>
            </p>
          </div>

          <div className="srf__item__detail">
            <p className="bold">
              Identification Details: <span className="black normal">{props?.item?.identification_details}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Status: <StatusBadge value={props?.item?.status} />
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              SRF No: <span className="black normal">{props?.srf?.srf_number}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Calibration Done Date:{" "}
              <span className="black normal">{props?.item?.calibration_done_date ? createDateFormat(props?.item?.calibration_done_date) : '--'}</span>
            </p>
          </div>

          <div className="srf__item__detail">
            <p className="bold">
              Calibration Done Name:{" "}
              <span className="black normal">{props?.item?.calibration_done_by_empname}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Report Done Date:{" "}
              <span className="black normal">
                {props?.item?.report_done_date ? createDateFormat(props?.item?.report_done_date) : '--'}
              </span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Report Done Name:{" "}
              <span className="black normal">{props?.item?.report_done_by_empname}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Report Dispatch Date:{" "}
              <span className="black normal">{props?.item?.report_dispatch_date ? createDateFormat(props?.item?.report_dispatch_date) : '--'}</span>
            </p>
          </div>

          <div className="srf__item__detail">
            <p className="bold">
              Report Dispatch Mode:{" "}
              <span className="black normal">{props?.item?.report_dispatch_mode}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Item Dispatch Date:{" "}
              <span className="black normal">{props?.item?.dispatch_date ? createDateFormat(props?.item?.dispatch_date) : '--'}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Item Dispatch DC:{" "}
              <span className="black normal">{props?.item?.dispatch_dc}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Item Dispatch Mode:{" "}
              <span className="black normal">{props?.item?.dispatch_mode}</span>
            </p>
          </div>

          <div className="srf__item__detail">
            <p className="bold">
              ULR No: <span className="black normal">{props?.item?.url_number}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Invoice No: <span className="black normal">{props?.item?.invoice_no}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Remarks: <span className="black normal">{props?.item?.remarks}</span>
            </p>
          </div>

          {
            canGenerateCertificate && props?.item?.report_done_date
              ? <div className="srf__item__detail"> <DownloadCertificate item={props?.item} /></div>
              : ""
          }

          <CustomProgress
            options={config.SRF_ITEM_STATUS_LIST}
            current={props.item.status}
          />
        </div>
      }

      <Card className="update__cal__card">
        <div className="update__cal__item" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 10 }}>
            <DatePicker
              value={calibrationDate}
              onChange={value => {
                setCalibrationDate(formattedDate(value));
                setCalibrationDateErr("");
              }}
              label="Calibrate Done Date"
              locale="en-IN"
            />
            <span style={{ color: "red" }}>{calibrationDateErr}</span>
          </div>
          <Button
            label="Mark as Calibrated"
            onClick={() => updatecalHandler(1)}
            variant="success"
            className="rainbow-m-around_medium"
          />
        </div>
        <div className="update__cal__item" style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 10 }}>
            <DatePicker
              value={reportGenerateDate}
              onChange={value => {
                setReportGenerateDate(formattedDate(value));
                setReportGenerateDateErr("");
              }}
              label="Report Generated Date"
              locale="en-IN"
            />
            <span style={{ color: "red" }}>{reportGenerateDateErr}</span>
          </div>
          {(canGenerateCertificate && auth.department === "admin") || (canGenerateCertificate && auth.department === "Calibration")
            ? (
              <Button
                label="Generate Certificate"
                onClick={() => {
                  generateCertificateHandler();
                }}
                variant="brand"
                className="rainbow-m-around_medium"
              />
            ) : (
              <Button
                label="Mark as Report Generated"
                onClick={() => updatecalHandler(2)}
                variant="neutral"
                className="rainbow-m-around_medium"
              />
            )
          }
        </div>
        <div className="update__cal__item w400" style={{ textAlign: "center" }}>
          <Button
            label="Mark as Calibrated & Report Generated"
            onClick={() => updatecalHandler(3)}
            variant="brand"
            className="rainbow-m-around_medium"
          />
        </div>
      </Card>

      {isLoading && <Spinner />}

    </Modal>
  );
};

export default UpdateCal;
