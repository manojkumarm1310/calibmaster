import { useContext, useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { Modal, Button, FileSelector } from "react-rainbow-components";
import StatusBadge from "../../UI/StatusBadge";
import CustomProgress from "../../UI/CustomProgress";
import config from "../../../utils/config.json";
import { AuthContext } from "../../../context/auth-context";
import { notificationActions } from "../../../store/nofitication";
import DownloadCertificate from "./DownloadCertificate";
import "./ViewSRFItem.css";


const ViewSRFItem = (props) => {

  const auth = useContext(AuthContext);
  const dispatch = useDispatch("");

  // *** Generate Certificate ***
  const [canGenerateCertificate, setCanGenerateCertificate] = useState(false);

  useEffect(() => {
    if (props.item) {
      fetchCMSSettings();
    }
  }, [props.item]);

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

  return (
    <>
      <Modal
        id="modal-1"
        isOpen={props.isOpen}
        onRequestClose={props.onclose}
        className="view__srf__item__modal"
      >
        <h2 className="srf_item_detail center">SRF Item Detail</h2>

        {/* {JSON.stringify(props?.item.srf)} */}

        <div className="srf__item__details__container">

          <div className="srf__item__detail">
            <p className="bold">
              Serial No: <span className="black normal">{props?.item?.serial_no}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Description: <span className="black normal">{props?.item.intrument_type?.instrument_full_name}</span>
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
              SRF No: <span className="black normal">{props?.item?.srf?.srf_number}</span>
            </p>
          </div>
          <div className="srf__item__detail">
            <p className="bold">
              Calibration Done Date:{" "}
              <span className="black normal">
                {props?.item?.calibration_done_date?createDateFormat(props?.item?.calibration_done_date):'--'}
              </span>
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
                {props?.item?.report_done_date?createDateFormat(props?.item?.report_done_date):'--'}
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
              <span className="black normal">{props?.item?.report_dispatch_date?createDateFormat(props?.item?.report_dispatch_date):'--'}</span>
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
              <span className="black normal">
                {props?.item?.dispatch_date?createDateFormat(props?.item?.dispatch_date):'--'}
              </span>
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
          <div className="srf__item__detail">
            {canGenerateCertificate && props?.item?.report_done_date ? <DownloadCertificate item={props?.item} /> : ""}
          </div>

          <CustomProgress
            options={config.SRF_ITEM_STATUS_LIST}
            current={props?.item?.status}
          />

        </div>
      </Modal>
    </>
  );
};

export default ViewSRFItem;
