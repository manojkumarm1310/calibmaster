import "./UpdateInvoice.css";
import { Modal, Spinner, Button, Card, TableWithBrowserPagination, Column, FileSelector } from "react-rainbow-components";
import CustomDatePicker from "../../Inputs/CustomDatePicker";
import { useContext, useEffect, useState } from "react";
import { notificationActions } from "../../../store/nofitication";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../../context/auth-context";
import { srfitemsActions } from "../../../store/srfitems";
import CustomInput from "../../Inputs/CustomInput";
import StatusBadge from "../../UI/StatusBadge";
import config from "../../../utils/config.json";
import { getBase64 } from "../../../utils/utilfuns";
import { childSrfItemsActions } from "../../../store/childSrfItems";
import { selecteditemsActions } from "../../../store/selecteditems";

const UpdateInvoice = (props) => {

  const [error, setError] = useState();
  const [isLoaded, setIsLoaded] = useState(true);
  const [srf, setSRF] = useState([]);
  const [srfItems, setSrfItems] = useState([]);
  const dispatch = useDispatch();
  const [title, setTitle] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [invoiceDate, setInvoiceDate] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [newfilemodal, setNewFileModal] = useState(false);
  const [newfileerror, setNewFileError] = useState("");
  const [newfilemessage, setNewFileMessage] = useState("");
  const [files, setFiles] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");
  const [responseFileName, setResponseFileName] = useState("");

  const selecteditems = useSelector((state) => state.selecteditems.list);
  const auth = useContext(AuthContext);

  const getSRFDetail = async () => {

    if (props.srfid) {
      setIsLoaded(false);

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ srfId: props.srfid, srfNo: props.srfNo }),
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

          if (data) {
            if (data.code === 200) {
              //console.log(data);
              setSRF(data.data.srf);
              // setSrfItems(data.data.items);

              dispatch(srfitemsActions.changesrfitems(data.data.items));
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
          dispatch(notificationActions.changenotification(errornotification));
          setError("Error while Getting SRF Detail!!");
        });
    }


  };

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

  useEffect(() => {
    if (props.srfid) {
      getSRFDetail();
    }
  }, [props.srfid]);

  useEffect(() => {
    setTitle("Update Invoice Detail!!");
  }, [props]);

  const containerStyles = {
    maxWidth: 300,
  };

  const handleChange = (value) => {
    if (value.length > 0) {
      getBase64(value[0], (result) => {
        setFiles(result);
      });
    } else {
      setFiles("");
    }
  };

  const newfileHanlder = () => {
    if (files.length > 0) {
      setNewFileError("");
      setNewFileMessage("File is Selected!!");
      setTimeout(() => {
        setNewFileModal(!newfilemodal);
      }, 500);
    } else {
      setNewFileMessage("");
      setNewFileError("File is not Selected!!");
    }
  }

  const updateinvoiceHandler = async () => {

    if (!invoiceNo || !invoiceDate || !invoiceDueDate || !files) {
      return alert("Please enter all the required fields");
    }

    try {
      setIsLoading(true);

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({
          items: selecteditems,
          invoiceinfo: {
            invoice_no: invoiceNo,
            invoice_date: invoiceDate,
            invoice_due_date: invoiceDueDate,
            status: "Invoice Generated",
            labId: auth.labId
          },
          srfId: srf.srf_id,
          file: files
        })
      };

      let response = await fetch(config.Calibmaster.URL + "/api/srf/updateinvoice", requestOptions);
      response = await response.json();
      console.log(response);

      if (response?.code === 201) {

        setResponseMsg(response?.message);
        setResponseFileName(response?.filename);
        setIsLoading(false);

        // *** Remove the selected srf-items from redux store ***
        dispatch(selecteditemsActions.changeselecteditems([]));
        // *** Get srf-items by id and save redux store ***
        await getSRFDetail();
        // *** Get all srf-items belongs to current lab and save redux store ***
        await fetchSRFItems();
        // *** Close this modal ***
        props.onclose();
      } else {
        setResponseMsg(response?.message);
        setIsLoading(false);
      }
    } catch (error) {
      console.log(error);
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
        console.log(arr)
        return arr;
      }
      let getSRFList = await newSRFList(items);
      dispatch(childSrfItemsActions.changesrfitems(getSRFList));
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <div className="view__srf__modal__container">
      <Modal
        id="view__srf"
        isOpen={props.isopen}
        onRequestClose={props.onclose}
        title={title}
        className="view__srf__modal"
        footer={
          <div className="rainbow-flex center">
            <p className="red w100">{error}</p>
            {!isLoaded ? <Spinner size="medium" /> : null}
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
                    SRF Date: <span className="black normal">{srf?.created_timestamp ? createDateFormat(srf?.created_timestamp) : '--'}</span>
                  </p>
                </div>
              </div>

              <div className="srf__header__column">
                <div className="srf__header__item si21">
                  <p className="bold">
                    Company Name:{" "}
                    <span className="black normal">{srf?.customer?.customer_name}</span>
                  </p>
                </div>
                <div className="srf__header__item si24">
                  <p className="bold">
                    Company Address:{" "}
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
                    <span className="black normal">{srf?.customer_dc_date ? createDateFormat(srf?.customer_dc_date) : '--'}</span>
                  </p>
                </div>
              </div>

            </div>

            <div className="srf__body__container">

              <div className="srf__items__container">

                <Card className="items__table__card" style={{ marginBottom: "1rem" }}>
                  <SRFItemsListView srfItems={selecteditems} />
                </Card>

                <Card className="items__table__card mtop1">
                  <div className="dc__info__container" style={{ display: "flex" }}>
                    <div className="add__srf__item__container">
                      <CustomInput
                        label="Invoice No."
                        type="text"
                        required={true}
                        onchange={(v) => setInvoiceNo(v)}
                      />
                    </div>
                    <div className="add__srf__item__container">
                      <CustomDatePicker
                        label={"Invoice Date"}
                        setDate={(v) => setInvoiceDate(v)}
                        date={invoiceDate}
                        required={true}
                      />
                    </div>
                    {invoiceDate ? <div className="add__srf__item__container">
                      <CustomDatePicker
                        label={"Invoice Due Date"}
                        setDate={(v) => setInvoiceDueDate(v)}
                        date={invoiceDueDate}
                        minDate={new Date(invoiceDate)}
                        required={true}
                      />
                    </div> : <div></div>}

                    {/* <div className="add__srf__item__container">
                      <CustomDatePicker
                        label={"Invoice Due Date"}
                        setDate={(v) => setInvoiceDueDate(v)}
                        date={invoiceDueDate}
                        minDate={new Date(invoiceDate)}
                        required={true}
                      />
                    </div> */}

                    <div className="add__srf__item__container" style={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                      <Button
                        variant="neutral"
                        label="Upload"
                        onClick={() => {
                          setNewFileModal(true);
                        }}
                        style={{ width: 200 }}
                      />
                    </div>
                    {
                      responseFileName && <div className="add__srf__item__container">
                        <h5 style={{ textAlign: "center", color: "green" }}>
                          Invoice Filename: {responseFileName}
                        </h5>
                      </div>
                    }
                  </div>
                  {
                    isLoading && <Spinner size="medium" />
                  }
                </Card>

                <div style={{ display: "flex", flexDirection: "column-reverse" }}>
                  {
                    responseMsg && <p style={{ color: "green" }}>{responseMsg}</p>
                  }
                  <Button
                    label="Update Invoice Detail"
                    variant="brand"
                    onClick={() => updateinvoiceHandler()}
                    className="mar051"
                  />
                </div>

              </div>
            </div>
          </div>
        ) : null}

      </Modal>

      {newfilemodal ? (
        <Modal
          id="modal-1"
          isOpen={newfilemodal}
          onRequestClose={() => setNewFileModal(!newfilemodal)}
        >
          <div className="new_file_modal">
            <h2>Upload Invoice</h2>
            <div>
              <FileSelector
                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                style={containerStyles}
                label="File selector"
                placeholder="Drag & Drop or Click to Browse"
                bottomHelpText="Select only one file"
                variant="multiline"
                onChange={handleChange}
              />
            </div>
            <div className="button_container">
              <Button
                label="Upload"
                onClick={newfileHanlder}
                variant="success"
                className="rainbow-m-around_medium"
              />
            </div>
            <p className="new_file_error" style={{ textAlign: "center" }}>{newfileerror}</p>
            <p className="new_file_success" style={{ textAlign: "center" }}>{newfilemessage}</p>
          </div>
        </Modal>
      ) : null}
    </div>
  );
};
export default UpdateInvoice;

const SRFItemsListView = ({ srfItems }) => {

  function findIntrumentTypeName({ value }) {
    return value?.instrument_full_name;
  }

  return (
    <>
      <TableWithBrowserPagination
        className="labs__table"
        pageSize={15}
        data={srfItems}
        keyField="srf_item_id"
      >

        <Column header="S.No" field="srf_item_id" component={({ index }) => index + 1} />
        <Column header="Description of Item" field="intrument_type" component={findIntrumentTypeName} />
        <Column header="Make" field="make" />
        <Column header="Model" field="model" />
        <Column header="Serial Number" field="serial_no" />
        <Column header="Id Number" field="identification_details" />
        <Column header="Status" field="status" component={StatusBadge} />
        <Column header="Remarks" field="remarks" />

      </TableWithBrowserPagination>
    </>
  );
}