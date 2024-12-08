import "./SRFsList.css";

import { useContext, useEffect, useState } from "react";
import {
  TableWithBrowserPagination,
  Column,
  Button,
  Spinner, Input
} from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { srfsActions } from "../../../store/srfs";
import CustomSearch from "../../Inputs/CustomSearch";
import ViewSRFModal from "./ViewSRFModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { filteredsrfsActions } from "../../../store/filteredsrfs";
import { childSrfItemsActions } from "../../../store/childSrfItems";

const SRFsList = (props) => {

  const srfs = useSelector((state) => state.srfs.list);
  const filteredSRFs = useSelector((state) => state.filteredsrfs.list);

  const dispatch = useDispatch();
  const auth = useContext(AuthContext);

  const [modifiedSRFs, setModifiedSRFs] = useState();
  const [isLoaded, setIsLoaded] = useState(true);
  const [viewSRFModal, setViewSRFModal] = useState(false);
  const [viewId, setViewId] = useState();
  const [SRFList, setSRFList] = useState([]);
  const [SRFListCopy, setSRFListCopy] = useState([]);
  const [error, setError] = useState();

  useEffect(() => {
    // if (srfs) {
    //   let addedzero = [];
    //   srfs.forEach((element) => {
    //     if (element.sno > 0 && element.sno < 10) {
    //       addedzero.push("0000" + element.sno);
    //     }
    //     if (element.sno > 9 && element.sno < 100) {
    //       addedzero.push("000" + element.sno);
    //     }
    //     if (element.sno > 99 && element.sno < 1000) {
    //       addedzero.push("00" + element.sno);
    //     }
    //     if (element.sno > 999 && element.sno < 10000) {
    //       addedzero.push("0" + element.sno);
    //     }
    //     if (element.sno > 9999 && element.sno < 100000) {
    //       addedzero.push("" + element.sno);
    //     }
    //   });

    //   const modifiedsrfs = srfs.map((v, i) => ({
    //     ...v,
    //     srfId:
    //       v.lab.symbol +
    //       "/" +
    //       v.year.toString().slice(2) +
    //       "/" +
    //       v.type +
    //       addedzero[i],
    //     sno: i + 1,
    //     company_name: v.Company.companyname,
    //     date: v.date.split("-").reverse().join("-"),
    //     agreed_date: v.agreed_date.split("-").reverse().join("-"),
    //     customer_dc_date: v.customer_dc_date.split("-").reverse().join("-"),
    //   }));
    //   setModifiedSRFs(modifiedsrfs);
    //   console.log(modifiedSRFs);
    // }
  }, [srfs]);

  useEffect(() => {
    // setIsLoaded(false);
    // const requestOptions = {
    //   method: "POST",
    //   headers: {
    //     "Content-Type": "application/json",
    //     Authorization: "Bearer " + auth.token,
    //   },
    //   body: JSON.stringify({ labId: auth.labId }),
    // };
    // const errornotification = {
    //   title: "Error while Getting SRFs!!",
    //   description: "Getting List of SRFs Failed!!",
    //   icon: "error",
    //   state: true,
    //   timeout: 15000,
    // };

    // fetch(config.Calibmaster.URL + "/api/srf/getall", requestOptions)
    //   .then(async (response) => {
    //     const data = await response.json();

    //     setIsLoaded(true);
    //     dispatch(srfsActions.changesrfs(data.data));

    //   })
    //   .catch((err) => {
    //     setIsLoaded(true);
    //     dispatch(notificationActions.changenotification(errornotification));
    //   });
  }, []);

  // Fetch SRF List
  async function fetchSRFList() {

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ labId: auth.labId }),
    };

    const response = await fetch(config.Calibmaster.URL + "/api/srf/getall", requestOptions);
    const { data } = await response.json();

    const newSRFList = async (srfArr) => {
      for (let i = 0; i < data.length; i++) {
        srfArr[i].id = i + 1;
      }
      return srfArr;
    }
    let getSRFList = await newSRFList(data);
    setSRFList(getSRFList);
    setSRFListCopy(getSRFList);
  }

    // *** Create Date Format ***
    const createDateFormat = ({ value }) => {
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
    fetchSRFList();
  }, []);

  const srfViewHandler = (v) => {
    // return console.log(v);
    setViewSRFModal(true);
    setViewId(v);
  };

  const viewmodalHandler = () => {
    const srfviewmodal = viewSRFModal;
    setViewSRFModal(!srfviewmodal);
  };

  const ViewSRF = ({ value }) => (
    <Button
      variant="neutral"
      label="View"
      onClick={() => srfViewHandler(value)}
    />
  );

  const PreviewSRF = ({ value }) => (
    <Button
      variant="brand"
      label="Preview"
      onClick={() => srfPreviewHandler(value)}
    />
  );

  const srfPreviewHandler = async (srf_id) => {

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      responseType: "blob",
      body: JSON.stringify({ srf_id }),
    };

    await fetch(config.Calibmaster.URL + "/api/excel/download-excel", requestOptions)
      .then(response => response.blob())
      .then(blob => {
        const blobURL = window.URL.createObjectURL(new Blob([blob]));

        const fileName = "srf-" + new Date().getTime() + ".xlsx";
        const aTag = document.createElement('a');
        aTag.href = blobURL;
        aTag.setAttribute('download', fileName);
        document.body.appendChild(aTag);
        aTag.click();
        aTag.remove();

        const newnotification = {
          title: "SRF Downloaded Successfully!!",
          icon: "success",
          state: true,
          timeout: 5000,
        };
        dispatch(notificationActions.changenotification(newnotification));
      }).catch((err) => {
        console.log(err);
        const errornotification = {
          title: "Error while downloading SRF!!",
          icon: "error",
          state: true,
          timeout: 15000,
        };
        dispatch(notificationActions.changenotification(errornotification));
      })
  };

  const findCustomerName = ({ value }) => {
    return value?.customer_name;
  }

  // *** Function for Search SRF with SRF-No ***
  const searchSrfNoHandler = async (query) => {
    const ids = [];

    if (query) {

      const newArr = [...SRFListCopy];

      const result = newArr.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item.srf_number);
      });

      setSRFList(result);

      result?.map((v, i) => {
        ids.push(v.srf_id);
      });

      await fetchSRFItems(ids);

    } else {
      setSRFList([]);
      await fetchSRFList();
      await fetchLabSRFItems();
    }
  }

  // *** Function for Search SRF with Customer-DC ***
  const searchCustomerDCHandler = async (query) => {
    const ids = [];

    if (query) {

      const newArr = [...SRFListCopy];

      const result = newArr.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item.customer_dc);
      });

      setSRFList(result);

      result?.map((v, i) => {
        ids.push(v.srf_id);
      });

      await fetchSRFItems(ids);

    } else {
      setSRFList([]);
      await fetchSRFList();
      await fetchLabSRFItems();
    }
  }

  // *** Function for Search SRF with Customer-Name ***
  const searchCustomerNameHandler = async (query) => {
    const ids = [];

    if (query) {

      const result = SRFList.filter((item) => {
        const regex = new RegExp(query, "i");
        return regex.test(item?.customer?.customer_name);
      });

      setSRFList(result);

      result?.map((v, i) => {
        ids.push(v.srf_id);
      });

      await fetchSRFItems(ids);

    } else {
      setSRFList([]);
      await fetchSRFList();
      await fetchLabSRFItems();
    }
  }

  // *** Commond Function for Search SRF Items and set in redux store ***
  async function fetchSRFItems(ids) {

    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify({ labId: auth.labId, srf_ids: ids })
      };

      let response = await fetch(config.Calibmaster.URL + "/api/srf-search/srf-items", requestOptions);
      const { items } = await response.json();

      const newSRFList = async (arr) => {
        for (let i = 0; i < arr.length; i++) {
          arr[i].slNo = i + 1;
        }
        return arr;
      }
      let getSRFList = await newSRFList(items);

      dispatch(childSrfItemsActions.changesrfitems([]));
      dispatch(childSrfItemsActions.changesrfitems(getSRFList));
    } catch (error) {
      console.log(error);
    }
  }

  //*** Fetch SRF Items ***/
  async function fetchLabSRFItems() {
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
    <div className="srfs_page">
      <div className="srfs__container">

        <div className="searchers__container">

          <div className="searchers" style={{ padding: "0 1rem 1rem 1rem" }}>
            <Input
              label="Search By SRF No."
              placeholder="Search By SRF No."
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
              iconPosition="right"
              onChange={(e) => searchSrfNoHandler(e.target.value)}
            />
          </div>

          <div className="searchers" style={{ padding: "0 1rem 1rem 1rem" }}>
            <Input
              label="Search By Customer DC"
              placeholder="Search By Customer DC"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
              iconPosition="right"
              onChange={(e) => searchCustomerDCHandler(e.target.value)}
            />
          </div>

          <div className="searchers" style={{ padding: "0 1rem 1rem 1rem" }}>
            <Input
              label="Search By Customer Name"
              placeholder="Search By Customer Name"
              className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
              icon={<FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />}
              iconPosition="right"
              onChange={(e) => searchCustomerNameHandler(e.target.value)}
            />
          </div>
        </div>

        <TableWithBrowserPagination
          className="srfs__table"
          pageSize={5}
          data={SRFList}
          keyField="srf_id"
          maxColumnWidth={300}
        >
          <Column header="S.No" field="id" />
          <Column header="SRF No" field="srf_number" />
          <Column header="SRF Date" field="srf_date" component={createDateFormat} />
          <Column header="Customer DC" field="customer_dc" />
          <Column header="Customer Name" field="customer" component={findCustomerName} />
          <Column header="Agreed Date" field="agreed_completion_date"  omponent={createDateFormat}/>
          <Column header="Contact Person" field="contact_name" />
          <Column header="Contact Number" field="contact_number" />
          <Column header="Department" field="department" />
          <Column header="View SRF" field="srf_id" component={ViewSRF} />
          {auth.department == "admin" || auth.department == "CSD" ? (
            <Column header="Preview" field="srf_id" component={PreviewSRF} />
          ) : null}
        </TableWithBrowserPagination>

        {!isLoaded ? <Spinner size="medium" /> : null}

        {viewSRFModal ? (
          <ViewSRFModal
            isopen={viewSRFModal}
            onclose={viewmodalHandler}
            srfid={viewId}
          />
        ) : null}
      </div>
    </div>
  );
};

export default SRFsList;
