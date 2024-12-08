import "./ViewSRFModal.css";
import { Modal, Spinner, Button } from "react-rainbow-components";
import { useContext, useEffect, useState } from "react";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import SRFItemsList from "./SRFItemsList";
import { srfitemsActions } from "../../../store/srfitems";
import UpdateDCModal from "./UpdateDCModal";
import UpdateInvoice from "./UpdateInvoice";
import UpdatePaymentStatus from "./UpdatePaymentStatus";
import UpdateReportModal from "./UpdateReportModal";
import UpdateCalibrationStatus from "./UpdateCalibrationStatus";
import UpdateBulkDCStatus from "./UpdateBulkDCStatus";

const ViewSRFModal = (props) => {
  const [error, setError] = useState();
  const [isLoaded, setIsLoaded] = useState(true);
  const [srf, setSRF] = useState();
  const dispatch = useDispatch();
  const auth = useContext(AuthContext);
  const selecteditems = useSelector((state) => state.selecteditems.list);
  const [updatedispatchModal, setupdatedispatchModal] = useState(false);
  const [updatereportModal, setupdatereportModal] = useState(false);
  const [updateinvoiceModal, setupdateinvoiceModal] = useState(false);
  const [updatepaymentModal, setupdatepaymentModal] = useState(false);
  const [updateCalibrationModal, setUpdateCalibrationModal] = useState(false);
  const [updateDCStatusModal, setUpdateDCStatusModal] = useState(false);
  console.log(selecteditems);
  const getSRFDetail = async () => {
    if (props.srfid) {
      setIsLoaded(false);
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ srfId: props.srfid }),
      };
      const errornotification = {
        title: "Error while Getting SRF Detail!!",
        description: props.srfid,
        icon: "error",
        state: true,
        timeout: 15000,
      };
      fetch(config.Calibmaster.URL + "/api/srf/getsrfbyid", requestOptions)
        .then(async (response) => {
          const data = await response.json();
          setIsLoaded(true);
          //console.log(data);
          if (data) {
            if (data.code === 200) {
              // console.log(data);
              const srf = data.data.srf;

              setSRF(srf);

              let items = data.data.items;

              dispatch(srfitemsActions.changesrfitems(items));
              setIsLoaded(true);
            } else {
              dispatch(
                notificationActions.changenotification(errornotification)
              );
              setError(data.message);
            }
          } else {
            dispatch(notificationActions.changenotification(errornotification));
            setError("Error while Getting SRF Detail!!");
          }
        })
        .catch((err) => {
          console.log(err);
          dispatch(notificationActions.changenotification(errornotification));
          setError("Error while Getting SRF Detail!!");
        });
    }
  };

  
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
    getSRFDetail();
  }, [props.srfid]);

  const updatedispatchModalHandler = () => {
    const updatedispatchmodal = updatedispatchModal;
    setupdatedispatchModal(!updatedispatchmodal);
  };
  const updatereportModalHandler = () => {
    const updatereportmodal = updatereportModal;
    setupdatereportModal(!updatereportmodal);
  };
  const updateinvoiceModalHandler = () => {
    // return console.log(srf);
    const updateinvoicemodal = updateinvoiceModal;
    setupdateinvoiceModal(!updateinvoicemodal);
  };
  const updatepaymentModalHandler = () => {
    const updatepaymentmodal = updatepaymentModal;
    setupdatepaymentModal(!updatepaymentmodal);
  };
  const updateCalibrationModalHandler = () => {
    setUpdateCalibrationModal(!updateCalibrationModal);
  };
  const updateDCStatusModalHandler = () => {
    setUpdateDCStatusModal(!updateDCStatusModal);
  };

  const checkStatusForCalibration=()=>{
    return selecteditems.every((data)=>{
      return (data.status=="Not Calibrated" || data.status=="Calibrated");
    })
  }

  const checkStatusForCSD=()=>{
    return selecteditems.every((data)=>{
      return (data.status=="Report Generated")
    })
  }

  const checkStatusForCSDAfterDispatch=()=>{
    return selecteditems.every((data)=>{
      return (data.status=="Dispatched")
    })
  }
  const checkStatusForAccount=()=>{
    return selecteditems.every((data)=>{
      return (data.status=="Report Dispatched")
    })
  }

  const checkStatusForAccountAfterInvoice=()=>{
    return selecteditems.every((data)=>{
      return (data.status=="Invoice Generated")
    })
  }

  return (
    <div className="view__srf__modal__container">
      <Modal
        id="view__srf"
        isOpen={props.isopen}
        onRequestClose={props.onclose}
        title="SRF Detail"
        className="view__srf__modal"
        footer={
          <div className="rainbow-flex center">
            <p className="red w100">{error}</p>
            {!isLoaded ? <Spinner size="medium" /> : null}
            {selecteditems && selecteditems.length > 0 ? (
              <>
                {auth.department == "admin" || (auth.department == "Calibration" && checkStatusForCalibration() ) || auth.department === "Manager" ? (
                  <Button
                    label="Update"
                    variant="brand"
                    onClick={updateCalibrationModalHandler}
                    className="mar051"
                  />
                ) : null}

                {auth.department == "admin" || (auth.department == "CSD" && checkStatusForCSD() ) || auth.department === "Manager" ? (
                  <Button
                    label="Update Dispatch Details"
                    variant="brand"
                    onClick={updatedispatchModalHandler}
                    className="mar051"
                  />
                ) : null}

                {auth.department == "admin" || (auth.department == "CSD" && checkStatusForCSDAfterDispatch()) || auth.department === "Manager" ? (
                  <Button
                    label="Update Report Dispatch Details"
                    variant="success"
                    onClick={updatereportModalHandler}
                    className="mar051"
                  />
                ) : null}

                {auth.department == "admin" || (auth.department == "Accounts" && checkStatusForAccount()) || auth.department === "Manager" ? (
                  <Button
                    label="Update Invoice Detail"
                    variant="brand"
                    onClick={updateinvoiceModalHandler}
                    className="mar051"
                  />
                ) : null}

                {auth.department == "admin" || (auth.department == "Accounts" && checkStatusForAccountAfterInvoice()) || auth.department === "Manager" ? (
                  <Button
                    label="Update Payment Status"
                    variant="success"
                    onClick={updatepaymentModalHandler}
                    className="mar051"
                  />
                ) : null}

                {/* {auth.department == "admin" || auth.department == "CSD" ? (
                  <Button
                    label="Update DC Status"
                    variant="success"
                    onClick={updateDCStatusModalHandler}
                    className="mar051"
                  />
                ) : null} */}
              </>
            ) : null}
          </div>
        }
      >
        {srf ? (
          <div className="srf__container">
            <div className="srf__header__container">

              <div className="srf__header__column">
                <div className="srf__header__item si11">
                  <p className="bold">
                    SRF Number: <span className="black normal">{srf?.srf_number}</span>
                  </p>
                </div>
                <div className="srf__header__item si12">
                  <p className="bold">
                    SRF Date: <span className="black normal">{srf?.created_timestamp?createDateFormat(srf?.created_timestamp):'--'}</span>
                  </p>
                </div>
              </div>

              <div className="srf__header__column">
                <div className="srf__header__item si21">
                  <p className="bold">
                    Customer Name:{" "}
                    <span className="black normal">{srf?.customer?.customer_name}</span>
                  </p>
                </div>
                <div className="srf__header__item si24">
                  <p className="bold">
                    Customer Address:{" "}
                    <span className="black normal">
                      {srf?.customer?.address1 +
                        ", " +
                        srf?.customer?.address2 +
                        ", " +
                        srf?.customer?.address3}
                    </span>
                  </p>
                </div>
              </div>

              {auth.department != "Calibration" ? (
                <div className="srf__header__column">
                  <div className="srf__header__item si31">
                    <p className="bold">
                      Contact Person:{" "}
                      <span className="black normal">{srf?.contact_name}</span>
                    </p>
                  </div>
                  <div className="srf__header__item si32">
                    <p className="bold">
                      Contact Number:{" "}
                      <span className="black normal">{srf?.contact_number}</span>
                    </p>
                  </div>
                  <div className="srf__header__item si33">
                    <p className="bold">
                      Department:{" "}
                      <span className="black normal">{srf?.department}</span>
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="srf__header__column">
                <div className="srf__header__item si41" style={{ display: "none" }}>
                  <p className="bold">
                    Report Company Name:{" "}
                    <span className="black normal">{srf?.reportcompany?.companyname}</span>
                  </p>
                </div>
                <div className="srf__header__item si42" style={{ display: "none" }}>
                  <p className="bold">
                    Report Company Address:{" "}
                    <span className="black normal">
                      {
                        (srf?.reportcompany)
                          ? srf?.reportcompany?.address1 +
                          ", " +
                          srf?.reportcompany?.address2 +
                          ", " +
                          srf?.reportcompany?.address3
                          :
                          null
                      }
                    </span>
                  </p>
                </div>
                <div className="srf__header__item si13">
                  <p className="bold">
                    Customer DC: <span className="black normal">{srf?.customer_dc}</span>
                  </p>
                </div>
                <div className="srf__header__item si14">
                  <p className="bold">
                    Customer DC Date:{" "}
                    <span className="black normal">{srf?.customer_dc_date?createDateFormat(srf?.customer_dc_date):'--'}</span>
                  </p>
                </div>
              </div>

            </div>
            <div className="srf__body__container">
              <SRFItemsList srfId={srf.srf_id} checkbox={true} srf={srf} />
            </div>
          </div>
        ) : null}

      </Modal>

      {updatedispatchModal ? (
        <UpdateDCModal
          isopen={updatedispatchModal}
          onclose={updatedispatchModalHandler}
          srfid={srf.srf_id}
          srfNo={srf.srf_number}
          mode="updatedc"
        />
      ) : null}

      {updatereportModal ? (
        <UpdateReportModal
          isopen={updatereportModal}
          onclose={updatereportModalHandler}
          srfid={srf.srf_id}
          srfNo={srf.srf_number}
          mode="updatereport"
        />
      ) : null}

      {updateinvoiceModal ? (
        <UpdateInvoice
          isopen={updateinvoiceModal}
          onclose={updateinvoiceModalHandler}
          srfid={srf.srf_id}
          srfNo={srf.srf_number}
          mode="updateinvoice"
        />
      ) : null}

      {updatepaymentModal ? (
        <UpdatePaymentStatus
          isopen={updatepaymentModal}
          onclose={updatepaymentModalHandler}
          srfid={srf.srf_id}
          srfNo={srf.srf_number}
          mode="updatepayment"
        />
      ) : null}

      {updateCalibrationModal ? (
        <UpdateCalibrationStatus
          isopen={updateCalibrationModal}
          onclose={updateCalibrationModalHandler}
          srfid={srf.srf_id}
          srfNo={srf.srf_number}
          mode="updateCalibration"
        />
      ) : null}

      {updateDCStatusModal ? (
        <UpdateBulkDCStatus
          isopen={updateDCStatusModal}
          onclose={updateDCStatusModalHandler}
          srf_id={srf.srf_id}
          mode="updateCalibration"
          closeViewModal={props}
        />
      ) : null}
    </div>
  );
};

export default ViewSRFModal;