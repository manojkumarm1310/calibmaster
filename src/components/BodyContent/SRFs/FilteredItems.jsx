import { useEffect, useState, useContext } from "react";
import { Card, TableWithBrowserPagination, Column, Button } from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { faEdit, faLock, faSearch,faEye, faDeleteLeft, faRemove } from "@fortawesome/free-solid-svg-icons";
import { srfitemsActions } from "../../../store/srfitems";
import "./FilteredItems.css";
import { selecteditemsActions } from "../../../store/selecteditems";
import ViewSRFItem from "./ViewSRFItem";
import EditSRFItem from "./EditSRFItem";
import StatusBadge from "../../UI/StatusBadge";
import UpdateCal from "./UpdateCal";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { childSrfItemsActions } from "../../../store/childSrfItems";
import CertificateGenerate from "./CertificateGenerate";
import VcCertificateGenerate from "./VcCertificateGenerate";
import { MenuItem } from "react-rainbow-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const FilteredItems = (props) => {

  const [modifiedItems, setModifiedItems] = useState([]);
  const [addItemModel, setAddItemModel] = useState(false);
  const [viewItemModel, setViewItemModel] = useState(false);
  const [editItemModel, setEditItemModel] = useState(false);
  const [updateItemModel, setUpdateItemModel] = useState(false);
  const [viewItem, setViewItem] = useState();
  const [editItem, setEditItem] = useState();
  const [updateItem, setUpdateItem] = useState();
  const [SRFItemsList, setSRFItemsList] = useState([]);
  const [addCertificateModel, setaddCertificateModel] = useState(false);
  const [addVcCertificateModel, setaddVcCertificateModel] = useState(false);
  const [isLoaded, setisLoaded] = useState(true);

  const dispatch = useDispatch();
  const auth = useContext(AuthContext);
  const allitems = useSelector((state) => state.childSrfItems.list);

  useEffect(() => {
    // console.log(allitems);
  }, []);

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

  const ViewButton = ({ row }) => (
    <Button
      variant="neutral"
      label="View"
      onClick={async () => {
        // console.log(row);
        // const requestOptions = {
        //   method: "POST",
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: "Bearer " + auth.token,
        //   },
        //   body: JSON.stringify({ labId: auth.labId, srf_item_id: value }),
        // };
        // let response = await fetch(config.Calibmaster.URL + "/api/srf/fetchSrfItem", requestOptions);
        // let { data } = await response.json();
        // console.log(data);
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
        // console.log(row);
        setEditItem(row);
        editItemModelHandler();
      }}
    />
  );

  // *** Update SRF-Items Button Is now fixed ***
  const UpdateButton = ({ row }) => (
    <Button
      variant="success"
      label="Update"
      onClick={() => {
        // console.log(row);
        setUpdateItem(row);
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
        // console.log(arr);
        return arr;
      }
      let getSRFList = await newSRFList(items);
      // dispatch(srfitemsActions.changesrfitems(getSRFList));
      dispatch(childSrfItemsActions.changesrfitems(getSRFList));
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    fetchSRFItems();
  }, []);


  // *** Instrument Full Name ***
  function findIntrumentTypeName({ value }) {
    return value?.instrument_full_name;
  }

  // ***  Open Add Weigh Certificate Model  *** 
  const addCertificateModelHandler = () => {
    setaddCertificateModel(true);
  };

  // ***  Close Add Weigh Certificate Model  *** 
  const closeCertificateModelHandler = () => {
    setaddCertificateModel(false);
  };

  // *** Weigh Certificate Generate button ***
  const weighCertificateButton = ({ row }) => (
    <Button
      variant="border"
      label="Certificate-1"
      style={{ width: '132px' }}
      onClick={() => {
        setViewItem(row);
        addCertificateModelHandler();
      }}
    />
  );

  // ***  Open Add VC Certificate Model  *** 
  const addVcCertificateModelHandler = () => {
    setaddVcCertificateModel(true);
  };

  // ***  Close Add VC Certificate Model  *** 
  const closeVcCertificateModelHandler = () => {
    setaddVcCertificateModel(false);
  };

  // *** Vernier Caliper Certificate Generate button ***
  const vcCertificateButton = ({ row }) => (
    <Button
      variant="border"
      label="Certificate-2"
      style={{ width: '132px' }}
      onClick={() => {
        setViewItem(row);
        addVcCertificateModelHandler();
      }}
    />
  );

  return (
    <div className="srfs__page">
      <div className="srf__items__container">
        <Card className="items__table__card">
          <div className="items__label">
            <h3>Filtered SRF Items</h3>
          </div>

          <TableWithBrowserPagination
            className="srf__items__table"
            pageSize={5}
            data={allitems}
            keyField="slNo"
            showCheckboxColumn={props.checkbox}
            onRowSelection={(selection) =>
              dispatch(selecteditemsActions.changeselecteditems(selection))
            }
          >
            <Column header="S.No" field="slNo" />
            <Column header="Description of Item" field="intrument_type" component={findIntrumentTypeName} />
            <Column header="Make" field="make" />
            <Column header="Model" field="model" />
            <Column header="Serial No." field="serial_no" />
            <Column header="Id Number" field="identification_details" />
            <Column header="Status" field="status" component={StatusBadge} />
            <Column header="Remarks" field="remarks" />
            {/* <Column header="View" field="srf_item_id" component={ViewButton} /> */}

            <Column header="ACTION" type="action">
              <MenuItem label="View SRF" icon={<FontAwesomeIcon icon={faEye} />} iconPosition="left" onClick={(event,data)=>{
                setViewItem(data);
                viewItemModelHandler();
              }}/>
  
              {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
              <MenuItem label="Edit" icon={<FontAwesomeIcon icon={faEdit} />} iconPosition="left" onClick={(event,data)=>{
                 setEditItem(data);
                 editItemModelHandler();
              }}  />
            ) : null}

              {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
              <MenuItem label="Update" icon={<FontAwesomeIcon icon={faEdit} />} iconPosition="left" onClick={(event,data)=>{
                 setUpdateItem(data);
                 updateItemModelHandler();
              }} />
            ) : null}
              {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
              <MenuItem label="Delete" icon={<FontAwesomeIcon icon={faRemove} />} iconPosition="left" onClick={(event,data)=>{
                deleteItemHandler(data);
              }}/>
            ) : null}


            </Column>

            

            {/* {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
              <Column header="Edit" field="sno" component={EditButton} />
            ) : null}

            {auth.department == "admin" || auth.department == "Calibration" || auth.department === "Manager" ? (
              <Column header="Update" field="sno" component={UpdateButton} />
            ) : null}

            {auth.department == "admin" || auth.department == "CSD" || auth.department === "Manager" ? (
              <Column header="Delete" field="srf_item_id" component={DeleteButton} />
            ) : null} */}

            {/* {auth.department == "admin" || auth.department == "Calibration" ? (
              <Column header="Generate" defaultWidth={140} field="srf_item_id" component={weighCertificateButton} />
            ) : null}

            {auth.department == "admin" || auth.department == "Calibration" ? (
              <Column header="Generate" defaultWidth={140} field="srf_item_id" component={vcCertificateButton} />
            ) : null} */}

          </TableWithBrowserPagination>
        </Card>

        {viewItemModel ? (
          <ViewSRFItem
            onclose={viewItemModelHandler}
            item={viewItem}
            isOpen={viewItemModel}
            mode={"Opened_via_Filtered_Items"}
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
            modalType={"filtered_srf_items"}
          />
        ) : null}

        {addCertificateModel ? (
          <CertificateGenerate
            onclose={closeCertificateModelHandler}
            item={viewItem}
            isOpen={addCertificateModel}
            mode={"Opened_via_Filtered_Items"}
          />
        ) : null}

        {addVcCertificateModel ? (
          <VcCertificateGenerate
            onclose={closeVcCertificateModelHandler}
            item={viewItem}
            isOpen={addVcCertificateModel}
            mode={"Opened_via_Filtered_Items"}
          />
        ) : null}

      </div>
    </div>
  );
};

export default FilteredItems;