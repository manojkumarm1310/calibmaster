import "./UpdateInvoice.css";
import { Modal, Spinner, Button, Card, TableWithBrowserPagination, Column, Input, DatePicker, Select } from "react-rainbow-components";
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
import { formattedDate } from "../../helpers/Helper";

const UpdateDCModal = (props) => {

  const [error, setError] = useState();
  const [isLoaded, setIsLoaded] = useState(true);
  const [srf, setSRF] = useState([]);
  const [srfItems, setSrfItems] = useState([]);

  const [title, setTitle] = useState("");

  const [dispatchDcNo, setDispatchDcNo] = useState("");
  const [dispatchDcDate, setDispatchDcDate] = useState("");
  const [dispatchDcMode, setDispatchDcMode] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [responseMsg, setResponseMsg] = useState("");

  const dispatch = useDispatch();
  const auth = useContext(AuthContext);
  const selecteditems = useSelector((state) => state.selecteditems.list);

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
    setTitle("Update SRF Items Dispatch Information!!");
  }, [props]);

  const updateinvoiceHandler = async () => {

    if (!dispatchDcNo || !dispatchDcDate || !dispatchDcMode) {
      alert("Please Enter all required fields.");
    } else {
      try {
        setIsLoading(true);

        const bodyData = {
          items: selecteditems,
          dispatchInfo: {
            dispatch_dc: dispatchDcNo,
            dispatch_date: dispatchDcDate,
            dispatch_mode: dispatchDcMode,
            status: "Dispatched",
            labId: auth.labId
          },
          srfId: srf.srf_id,
        };

        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
          body: JSON.stringify(bodyData)
        };

        let response = await fetch(config.Calibmaster.URL + "/api/srf-status/dispatch", requestOptions);
        response = await response.json();
        console.log(response);

        if (response?.code === 201) {

          setResponseMsg(response?.message);
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
        console.log(error)
      }
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
                    SRF Date: <span className="black normal">{srf?.created_timestamp?createDateFormat(srf?.created_timestamp):'--'}</span>
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
                    <span className="black normal">{srf?.customer_dc_date?createDateFormat(srf?.customer_dc_date):'--'}</span>
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
                  <div className="dc__info__container" style={{ display: "flex", justifyContent: "center" }}>
                    <div className="add__srf__item__container" style={{ width: 200 }}>
                      <Input
                        label="Dispatch DC No"
                        placeholder="Dispatch DC No"
                        className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                        required={true}
                        onChange={(e) => setDispatchDcNo(e.target.value)}
                      />
                    </div>
                    <div className="add__srf__item__container" style={{ width: 200 }}>
                      <DatePicker
                        formatStyle="medium"
                        label="Dispatch DC Date"
                        value={dispatchDcDate}
                        required={true}
                        onChange={value => setDispatchDcDate(formattedDate(value))}
                      />
                    </div>
                    <div className="add__srf__item__container" style={{ width: 200 }}>
                      <Select
                        label="Dispatch Mode"
                        options={[
                          { value: '', label: 'Select' },
                          { value: 'Post', label: 'Post' },
                          { value: 'Courier', label: 'Courier' }
                        ]}
                        className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                        onChange={(e) => setDispatchDcMode(e.target.value)}
                      />
                    </div>
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
                    label="Update Dispatch Details"
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
    </div>
  );
};
export default UpdateDCModal;


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