import { useEffect, useState, useContext } from "react";
import { renderToString } from 'react-dom/server';
import { Card, TableWithBrowserPagination, Column, Button, FileSelector, Modal, Spinner, Input, MenuItem } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { srfitemsActions } from "../../../store/srfitems";
import "./SRFItemsList.css";
import CustomButton from "../../Inputs/CustomButton";
import AddItemtoSRF from "./AddItemtoSRF";
import { selecteditemsActions } from "../../../store/selecteditems";
import ViewSRFItem from "./ViewSRFItem";
import EditSRFItem from "./EditSRFItem";
import StatusBadge from "../../UI/StatusBadge";
import UpdateCal from "./UpdateCal";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { childSrfItemsActions } from "../../../store/childSrfItems";
import EnterResult from "./ResultComponent/EnterResult";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas";
import { formattedDate } from "../../helpers/Helper";
import { faBars, faEdit, faEye, faFile, faFileLines, faPrint, faRemove, faTrash, faUpload } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const SRFItemsList = (props) => {

  const [modifiedItems, setModifiedItems] = useState([]);
  const [addItemModel, setAddItemModel] = useState(false);
  const [viewItemModel, setViewItemModel] = useState(false);
  const [editItemModel, setEditItemModel] = useState(false);
  const [updateItemModel, setUpdateItemModel] = useState(false);
  const [newfilemodal, setNewFileModal] = useState(false);

  const [viewItem, setViewItem] = useState();
  const [editItem, setEditItem] = useState();
  const [updateItem, setUpdateItem] = useState();
  const [files, setFiles] = useState([]);
  const [newfileerror, setNewFileError] = useState("");
  const [newfilemessage, setNewFileMessage] = useState("");
  const [isLoaded, setisLoaded] = useState(true);
  const [uploadinfo, setUploadInfo] = useState({});

  const [loading, setloading] = useState(false);

  const [isDcModal, setIsDcModal] = useState(false);
  const [dcModalLoader, setdcModalLoader] = useState(false);
  const [srfItemID, setsrfItemID] = useState("");

  const [returnAfterCalibration, setReturnAfterCalibration] = useState(false);
  const [sendForRepairs, setSendForRepairs] = useState(false);
  const [notForSale, setNotForSale] = useState(false);
  const [sendForCalibration, setsendForCalibration] = useState(false);
  const [returnableMaterial, setReturnableMaterial] = useState(false);

  const [mailSendResponse, setMailSendResponse] = useState("");

  //*** Enter Result States ***/
  const [srfItemInfo, setSrfItemInfo] = useState({});
  const [enterResultModal, setEnterResultModal] = useState(false);

  const auth = useContext(AuthContext);
  const dispatch = useDispatch();

  // TODO: This is connected with SRF Items Listing By SRF Id
  const items = useSelector((state) => state.srfitems.list);

  useEffect(() => {
    if (items) {
      //console.log(items);
      const modifieditems = items.map((v, i) => ({
        ...v,
        description: v.intrument_type.instrument_full_name,
        sno: i + 1,
      }));
      setModifiedItems(modifieditems);
    }
  }, [items]);

  const addItemHandler = () => {
    const isopen = addItemModel;
    setAddItemModel(!isopen);
  };
  const viewItemModelHandler = () => {
    const viewitemmodel = viewItemModel;
    setViewItemModel(!viewitemmodel);
  };
  const editItemModelHandler = () => {
    const edititemmodel = editItemModel;
    setEditItemModel(!edititemmodel);
  };
  const updateItemModelHandler = () => {
    const updateitemmodel = updateItemModel;
    setUpdateItemModel(!updateitemmodel);
  };

  const handleChange = (value) => {
    setFiles(value);
    console.log(value);
    // setNewFileError();
    // setNewFileMessage();
  };

  const containerStyles = {
    maxWidth: 300,
  };

  const uploadModalHandler = (value) => {
    // console.log(value);
    setUploadInfo(value); // uploadinfo
    // const newstate = !newfilemodal;
    setNewFileModal(!newfilemodal);
    // setNewFileError();
    // setNewFileMessage();
  };

  const ViewButton = ({ row }) => (
    <Button
      variant="neutral"
      label="View"
      onClick={() => {
        // console.log(row);
        // setViewItem(modifiedItems[value - 1]);
        setViewItem(row);
        viewItemModelHandler();
      }}
    />
  );

  const EditButton = ({ row }) => (
    <Button
      variant="brand"
      label="Edit"
      onClick={() => {
        setEditItem(row);
        editItemModelHandler();
      }}
    />
  );

  const UpdateButton = ({ value }) => (
    <Button
      variant="success"
      label="Update"
      onClick={() => {
        console.log(value);
        setUpdateItem(modifiedItems[value - 1]);
        updateItemModelHandler();
      }}
    />
  );

  const DeleteButton = ({ row }) => (
    <Button
      variant="destructive"
      label="Delete"
      onClick={() => {
        deleteItemHandler(row);
      }}
    />
  );

  const deleteItemHandler = async ({ srf_id, srf_item_id, lab_id }) => {

    try {

      const requestBody = {
        srf_id,
        srf_item_id,
        lab_id
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify(requestBody),
      };

      let response = await fetch(config.Calibmaster.URL + "/api/srf/deleteitem", requestOptions)
      response = await response.json();

      const newnotification = {
        title: "SRF Item Deleted Successfully!!",
        icon: "success",
        state: true,
        timeout: 15000,
      };
      await getSRFDetail();
      dispatch(notificationActions.changenotification(newnotification));
      dispatch(childSrfItemsActions.changesrfitems(response?.data?.items));

    } catch (error) {
      console.log(error);
      const errornotification = {
        title: "Error while Deleting Updating SRF Item!!",
        icon: "error",
        state: true,
        timeout: 15000,
      };
      dispatch(notificationActions.changenotification(errornotification));
    }
  };

  const UploadButton = ({ value }) => (
    <Button
      variant="neutral"
      label="Upload"
      onClick={() => {
        uploadModalHandler(modifiedItems[value - 1]);
      }}
    />
  );

  const newFileModalHandler = () => {
    const newstate = !newfilemodal;
    setNewFileModal(newstate);
    setNewFileError();
    setNewFileMessage();
  };

  // *** Upload Certificate to Customer Portal ***
  const newfileHanlder = async () => {
    // return console.log(files[0]);
    // console.log(auth.labId);
    // return console.log(uploadinfo);
    // return console.log(props.srf);

    if (files.length < 1) {
      setNewFileError("File not Selected!!");
      setNewFileMessage("");
    }
    if (files.length > 0) {

      setloading(true);

      const description = uploadinfo?.intrument_type?.instrument_full_name?.split(" ")?.join("_");
      const unique_number = new Date().getTime();
      const filename = auth.labId + "_" + uploadinfo.srf_item_id + "_" + description + "_" + unique_number + ".pdf";

      const data = new FormData();
      data.append("file", files[0]);
      data.append("item", JSON.stringify(uploadinfo));
      data.append("companyId", props?.srf?.customer?.customer_id);
      data.append("srf_number", props?.srf?.srf_number);
      data.append("srfId", uploadinfo?.srf_id);
      data.append("srf_item_id", uploadinfo?.srf_item_id);
      data.append("labId", auth.labId);
      data.append("filename", filename);

      const requestOptions = {
        method: "POST",
        headers: { Authorization: "Bearer " + auth.token },
        body: data,
      };

      fetch(config.Calibmaster.URL + "/api/certificate/upload", requestOptions)
        .then(async (response) => {
          const data = await response.json();
          console.log(data);
          const code = data.code;
          if (code !== 200) {
            setNewFileError(data.message);
          } else {
            setFiles("");
            setNewFileError("");
            setNewFileMessage(data.message);
            setTimeout(() => {
              setNewFileModal(!newfilemodal);
            }, 1000);
          }
          setloading(false);
        })
        .catch((err) => {
          console.log(err);
          setNewFileError("Failed to upload certificate.");
          setloading(false)
        });

      try {
        const requestOptions = {
          method: "POST",
          headers: {
            Authorization: "Bearer " + auth.token,
          },
          body: data,
        };

        let response = await fetch(config.CustomerPortal.URL + "/api/certificate/upload", requestOptions);
        response = await response.json();
        console.log(response);
      } catch (error) {
        console.log(error);
      }
    }
  };

  // *** First Delivery Challan Btn Function ***
  const deliveryChallanBtn = ({ value }) => (
    <Button
      variant="outline-brand" className="rainbow-m-around_medium"
      label="Send"
      onClick={() => {
        // console.log(value);
        setsrfItemID(value);
        setIsDcModal(true);
      }}
    />
  );

  // *** Close Delivery Challan Modal ***
  const closeDCModalHandler = () => {
    return setIsDcModal(false);
  };

  // *** Mail Delivery Function ***
  const sendDCHandler = async () => {
    try {
      setdcModalLoader(true);

      const lab_id = auth.labId;
      const srf_id = props.srfId;
      const srf_item_id = srfItemID;

      const requestBody = {
        lab_id, srf_id, srf_item_id,
        returnAfterCalibration, sendForRepairs, notForSale, sendForCalibration, returnableMaterial
      };

      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify(requestBody),
      };

      let response = await fetch(config.Calibmaster.URL + "/api/delivery-challan/create", requestOptions)
      response = await response.json();

      if (response.code == 200) {
        setMailSendResponse(response.msg);
        setdcModalLoader(false);
        setTimeout(() => {
          closeDCModalHandler();
          setMailSendResponse("");
        }, 3000);
      } else {
        setdcModalLoader(false);
      }
    } catch (error) {
      console.log(error);
      const newNotification = {
        title: "Something went wrong",
        description: "",
        icon: "error",
        state: true,
        timeout: 1500,
      };
      setdcModalLoader(false);
      dispatch(notificationActions.changenotification(newNotification));
    }
  }

  // *** Open Enter Result Modal ***
  const enterResultHanler = ({ row }) => (
    <Button
      variant="border" className="rainbow-m-around_medium"
      label="Result"
      onClick={() => {
        setSrfItemInfo(row);
        setEnterResultModal(true);
      }}
    />
  );

  // *** Close Delivery Challan Modal ***
  const closeEnterResultModalHandler = () => {
    return setEnterResultModal(false);
  };


  const getSRFDetail = async () => {

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ srfId: props.srfId })
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
        dispatch(srfitemsActions.changesrfitems(data.data.items));
        const labInfo = data?.data?.srf?.lab;

      })
      .catch((err) => {
        console.log(err);
        dispatch(notificationActions.changenotification(errornotification));
      });
  };

  const genrateLabelBtn = ({ row }) => (
    <Button
      variant="outline-brand" className="rainbow-m-around_medium"
      label="Generate"
      onClick={(e) => {
        handleGenerateLabel(e, row)
      }}
    />
  );

  const handleGenerateLabel = async (e, row) => {
    e.preventDefault();
    const custInfo = props?.srf?.customer;
    const labInfo = props?.srf?.lab;
    const qrData = {
      customerName: `${custInfo?.customer_name}, ${custInfo?.address1}, ${custInfo?.city}, ${custInfo?.state} - ${custInfo?.pincode}`,
      instrument: row?.description,
      make: row?.make,
      sr_no: row?.serial_no,
      cal_date: row?.calibration_done_date,
      due_date: row?.calibration_due_date,
      labName: labInfo?.lab_name,
      labLogoPath: labInfo?.brand_logo_filename,
      labAddress: `${labInfo?.address1}, ${labInfo?.city}, ${labInfo?.state} - ${labInfo?.pincode}`,
      contact: labInfo?.contact_number1,
    }
    const logo = localStorage.getItem("logo");
    const logoUrl =`${config.Calibmaster.URL}/images/${logo}`;
    const component = <Card className={'delivery-label'}>
      <div class="row">
      <img
        className="logoImage"
        src={logoUrl}
        alt="company logo"
      />
        <div class="lab-name-column"><h3>{labInfo?.lab_name}</h3></div>
      </div>
      <div class="row">
        <div class="column"></div>
        <div class="column">
          <span class="row"><b className="label-content">Customer: </b> {`${custInfo?.customer_name}, ${custInfo?.address1}, ${custInfo?.city}, ${custInfo?.state} - ${custInfo?.pincode}`}</span>
          <span class="row"><b className="label-content">Instrument: </b> {row?.description}</span>
          <span class="row"><b className="label-content">Make: </b> {row?.make}</span>
          <span class="row"><b className="label-content">Serial No: </b> {row?.serial_no}</span>
          <span class="row"><b className="label-content">Calibration Date: </b> {formattedDate(row?.calibration_done_date)}</span>
          <span class="row"><b className="label-content">Due Date: </b> { formattedDate(row?.calibration_due_date)}</span>
        </div>
        <div class="column"> <QRCode className="qr-code" value={JSON.stringify(qrData)} size={200} /></div>
      </div>

      <div class="footer"><span style={{ display: 'flex' }}>{`${labInfo?.address1}, ${labInfo?.city}, ${labInfo?.state} - ${labInfo?.pincode}`}</span>
        <span>Cell: {labInfo?.contact_number1}</span>
      </div>
    </Card>;
    
    // Create a dynamic HTML element
    const htmlString = renderToString(component);
    const divContainer = document.createElement('div');
    divContainer.id=`Card-${row?.serial_no}`;
    divContainer.style.width = '740px';

    // Dynamically generate HTML content including a logo image
    divContainer.innerHTML = htmlString;

    // Append the element temporarily to the body (hidden or off-screen)
    document.body.appendChild(divContainer);

    // Use html2canvas to capture the HTML element and download it
    const canvas = await html2canvas(divContainer, { useCORS: true });
    const dataUrl = canvas.toDataURL('image/png');
    const link=document.createElement('a');
    link.href=dataUrl;
    link.download = `card-${row?.serial_no}.png`;
    link.click();

    // Remove the dynamically created element after the image is downloaded
    document.body.removeChild(divContainer);    
  };

  return (
    <div className="srf__items__container">

      <Card className="items__table__card">
        <div className="items__label">
          <h2>SRF Items List</h2>
        </div>

        <TableWithBrowserPagination
          className="srf__items__table"
          pageSize={5}
          data={modifiedItems}
          keyField="srf_item_id"
          showCheckboxColumn={props.checkbox}
          onRowSelection={(selection) => {
            dispatch(selecteditemsActions.changeselecteditems(selection))
          }}
        >
          <Column header="S.No" field="sno" />
          <Column header="Description of Item" field="description" />
          <Column header="Make" field="make" />
          <Column header="Model" field="model" />
          <Column header="Serial Number" field="serial_no" />
          <Column header="Id Number" field="idno" />
          <Column header="Status" field="status" component={StatusBadge} />
          <Column header="Remarks" field="remarks" />

          <Column header="action" type="action">
            <MenuItem label="View" icon={<FontAwesomeIcon icon={faEye} />} iconPosition="left" onClick={(event,data)=>{
              setViewItem(data);
              viewItemModelHandler();
            }} />

          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <MenuItem label="Edit" icon={<FontAwesomeIcon icon={faEdit} />} iconPosition="left" onClick={(event,data)=>{
              setEditItem(data);
              editItemModelHandler();
            }} />
          ) : null}

          {auth.department == "admin" || auth.department == "Calibration" || auth.department === "Manager" ? (
            <MenuItem label="Update" icon={<FontAwesomeIcon icon={faEdit} />} iconPosition="left" onClick={(event,data)=>{
              setUpdateItem(modifiedItems[data.sno - 1]);
              updateItemModelHandler();
            }} />
          ) : null}

          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <MenuItem label="delete" icon={<FontAwesomeIcon icon={faTrash} />} iconPosition="left" onClick={(event,data)=>{
              deleteItemHandler(data);
            }} />
          ) : null}

          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <MenuItem label="Upload" icon={<FontAwesomeIcon icon={faUpload} />} iconPosition="left" onClick={(event,data)=>{
              uploadModalHandler(modifiedItems[data.sno - 1]);
            }} />
          ) : null}

          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <MenuItem label="Delivery Challan" icon={<FontAwesomeIcon icon={faFileLines} />} iconPosition="left" onClick={(event,data)=>{
              // console.log(data);
              setsrfItemID(data.srf_item_id);
              setIsDcModal(true);
            }} />
          ) : null}

          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <MenuItem label="Generate Label" icon={<FontAwesomeIcon icon={faPrint} />} iconPosition="left" onClick={(event,data)=>{
              handleGenerateLabel(event, data)
            }} />
          ) : null}

          {auth.department == "admin" || auth.department == "Calibration" || auth.department === "Manager" ? (
            <MenuItem label="Result" icon={<FontAwesomeIcon icon={faFile} />} iconPosition="left" onClick={(event,data)=>{
              setSrfItemInfo(data);
              setEnterResultModal(true);
            }}/>
          ) : null}




          </Column>


          {/* <Column header="View" field="sno" component={ViewButton} /> */}

          {/* {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <Column header="Edit" field="sno" component={EditButton} />
          ) : null}
          {auth.department == "admin" || auth.department == "Calibration" || auth.department === "Manager" ? (
            <Column header="Update" field="sno" component={UpdateButton} />
          ) : null}
          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <Column header="Delete" field="srf_item_id" component={DeleteButton} />
          ) : null}
          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <Column header="Upload" field="sno" component={UploadButton} />
          ) : null}

          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <Column header="Delivery Challan" field="srf_item_id" component={deliveryChallanBtn} />
          ) : null}
          {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
            <Column header="Generate Label" field="srf_item_id" component={genrateLabelBtn} />
          ) : null}

          {auth.department == "admin" || auth.department == "Calibration" || auth.department === "Manager" ? (
            <Column header="Enter" field="srf_item_id" component={enterResultHanler} />
          ) : null} */}
        </TableWithBrowserPagination>

        {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
          <div className="srf__submit__container">
            <div className="add__button__container">
              <CustomButton
                label="Add Item"
                onclick={addItemHandler}
                variant="success"
              />
            </div>
          </div>
        ) : null}

        {(loading) ? <Spinner size="medium" /> : ""}
      </Card>

      {addItemModel ? (
        <AddItemtoSRF
          onclose={addItemHandler}
          isopen={addItemModel}
          srf={props.srf}
        />
      ) : null}

      {viewItemModel ? (
        <ViewSRFItem
          onclose={viewItemModelHandler}
          item={viewItem}
          isOpen={viewItemModel}
        />
      ) : null}

      {editItemModel ? (
        <EditSRFItem
          onclose={editItemModelHandler}
          item={editItem}
          isopen={editItemModel}
        />
      ) : null}

      {updateItemModel ? (
        <UpdateCal
          onclose={updateItemModelHandler}
          item={updateItem}
          isOpen={updateItemModel}
          srf={props?.srf}
          modalType={"srf_items_list"}
        />
      ) : null}

      {newfilemodal ? (
        <Modal
          id="modal-1"
          isOpen={newfilemodal}
          onRequestClose={newFileModalHandler}
        >
          <div className="new_file_modal">
            <h2>Upload Certificate</h2>
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
          {(loading) ? <Spinner size="medium" /> : ""}
        </Modal>
      ) : null}

      {isDcModal ? (
        <Modal
          id="modal-2"
          isOpen={isDcModal}
          onRequestClose={closeDCModalHandler}
        >
          <div className="new_file_modal" style={{ display: "flex", flexDirection: "column" }}>
            <h2>Send Delivery Challan</h2>

            <Input
              className="rainbow-m-around_medium"
              type="checkbox"
              label="Returned after calibration"
              onChange={(e) => {
                setReturnAfterCalibration(e.target.checked);
              }}
            />

            <Input
              className="rainbow-m-around_medium"
              type="checkbox"
              label="Sent for Repairs & Servicing"
              onChange={(e) => {
                setSendForRepairs(e.target.checked);
              }}
            />

            <Input
              className="rainbow-m-around_medium"
              type="checkbox"
              label="Not For Sale"
              onChange={(e) => {
                setNotForSale(e.target.checked);
              }}
            />

            <Input
              className="rainbow-m-around_medium"
              type="checkbox"
              label="Sent for Calibration"
              onChange={(e) => {
                setsendForCalibration(e.target.checked);
              }}
            />

            <Input
              className="rainbow-m-around_medium"
              type="checkbox"
              label="Returnable Material"
              onChange={(e) => {
                setReturnableMaterial(e.target.checked);
              }}
            />

            <div className="button_container">
              <Button
                label="Send Delivery Challan"
                onClick={sendDCHandler}
                variant="success"
                className="rainbow-m-around_medium"
              />
            </div>
            <p className="new_file_error" style={{ textAlign: "center", margin: 0 }}>{newfileerror}</p>
            {mailSendResponse != "" && <p style={{ textAlign: "center", color: "green", margin: 0 }}>{mailSendResponse}</p>}

          </div>

          {(dcModalLoader) ? <Spinner size="medium" /> : ""}
        </Modal>
      ) : null}

      {enterResultModal ? (
        <EnterResult
          isOpen={enterResultModal}
          onRequestClose={closeEnterResultModalHandler}
          srfItemInfo={srfItemInfo}
        />
      ) : null}

    </div>
  );
};

export default SRFItemsList;
