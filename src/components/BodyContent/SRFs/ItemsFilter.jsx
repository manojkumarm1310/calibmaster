import "./ItemsFilter.css";
import { Card, Input, Spinner } from "react-rainbow-components";
import CustomSearch from "../../Inputs/CustomSearch";
import { useDispatch, useSelector } from "react-redux";
import { useContext, useEffect, useState } from "react";
import FilteredItems from "./FilteredItems";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { filtereditemsActions } from "../../../store/filtereditems";
import { srfitemsActions } from "../../../store/srfitems";
import { notificationActions } from "../../../store/nofitication";
import { fetchSRFItems } from "./Helper";
import { childSrfItemsActions } from "../../../store/childSrfItems";

const ItemsFilter = () => {

  const allitems = useSelector((state) => state.filtereditems.list);
  const filteredSRFs = useSelector((state) => state.filteredsrfs.list);

  const dispatch = useDispatch();
  const auth = useContext(AuthContext);

  const [filtereditems, setFilteredItems] = useState([]);
  const [loading, setloading] = useState(false);

  useEffect(() => {

  }, []);

  const searchSerialNoHandler = async (val) => {
    if (val !== "") {
      setloading(true);
      try {
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
          body: JSON.stringify({ labId: auth.labId, serial_no: val }),
        };

        const response = await fetch(config.Calibmaster.URL + "/api/srf-search/serial-number", requestOptions);
        const { items } = await response.json();

        const newSRFList = async (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i].slNo = i + 1;
          }
          console.log(arr);
          return arr;
        }
        let getSRFList = await newSRFList(items);
        dispatch(childSrfItemsActions.changesrfitems([]));
        dispatch(childSrfItemsActions.changesrfitems(getSRFList));
        setloading(false);
      } catch (error) {
        console.log(error);
        setloading(false);
        const errNotification = {
          title: "Something went wrong",
          description: "",
          icon: "error",
          state: true,
          timeout: 1500,
        };
        return dispatch(notificationActions.changenotification(errNotification));
      }
    } else {
      const getSRFList = await fetchSRFItems(auth);
      dispatch(childSrfItemsActions.changesrfitems(getSRFList));
    }
  }

  const searchByDispatchDCHandler = async (val) => {
    if (val !== "") {
      setloading(true);
      try {
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
          body: JSON.stringify({ labId: auth.labId, dispatch_number: val }),
        };

        const response = await fetch(config.Calibmaster.URL + "/api/srf-search/dispatch-number", requestOptions);
        const { items } = await response.json();

        const newSRFList = async (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i].slNo = i + 1;
          }
          console.log(arr);
          return arr;
        }
        let getSRFList = await newSRFList(items);
        dispatch(childSrfItemsActions.changesrfitems([]));
        dispatch(childSrfItemsActions.changesrfitems(getSRFList));
        setloading(false);
      } catch (error) {
        console.log(error);
        setloading(false);
        const errNotification = {
          title: "Something went wrong",
          description: "",
          icon: "error",
          state: true,
          timeout: 1500,
        };
        return dispatch(notificationActions.changenotification(errNotification));
      }
    } else {
      const getSRFList = await fetchSRFItems(auth);
      dispatch(childSrfItemsActions.changesrfitems(getSRFList));
    }
  }

  const searchByIdNoHandler = async (val) => {
    if (val !== "") {
      setloading(true);
      try {
        const requestOptions = {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
          body: JSON.stringify({ labId: auth.labId, identification_details: val }),
        };

        const response = await fetch(config.Calibmaster.URL + "/api/srf-search/identification-details", requestOptions);
        const { items } = await response.json();

        const newSRFList = async (arr) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i].slNo = i + 1;
          }
          console.log(arr);
          return arr;
        }
        let getSRFList = await newSRFList(items);
        dispatch(childSrfItemsActions.changesrfitems([]));
        dispatch(childSrfItemsActions.changesrfitems(getSRFList));
        setloading(false);
      } catch (error) {
        console.log(error);
        setloading(false);
        const errNotification = {
          title: "Something went wrong",
          description: "",
          icon: "error",
          state: true,
          timeout: 1500,
        };
        return dispatch(notificationActions.changenotification(errNotification));
      }
    } else {
      const getSRFList = await fetchSRFItems(auth);
      dispatch(childSrfItemsActions.changesrfitems(getSRFList));
    }
  }

  return (
    <>
      <div className="items__filter">
        <Card className="srfs__card">
          <div className="srfs__label">
            <h3>SRF Items Filter</h3>
          </div>

          <div className="searchers__container">

            <div className="searchers" style={{ padding: "0 1rem 1rem 1rem" }}>
              <Input
                label="Search By Serial No."
                type="text"
                disabled={false}
                placeholder="Search By Serial No."
                onChange={(e) => searchSerialNoHandler(e.target.value)}
                icon={
                  <FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />
                }
                iconPosition="right"
              />
            </div>

            <div className="searchers" style={{ padding: "0 1rem 1rem 1rem" }}>
              <Input
                label="Search By Dispatch DC"
                type="text"
                disabled={false}
                placeholder="Search By Serial No."
                onChange={(e) => searchByDispatchDCHandler(e.target.value)}
                icon={
                  <FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />
                }
                iconPosition="right"
              />
            </div>

            <div className="searchers" style={{ padding: "0 1rem 1rem 1rem" }}>
              <Input
                label="Search By Id No"
                type="text"
                disabled={false}
                placeholder="Search By Serial No."
                onChange={(e) => searchByIdNoHandler(e.target.value)}
                icon={
                  <FontAwesomeIcon icon={faSearch} className="rainbow-color_gray-3" />
                }
                iconPosition="right"
              />
            </div>
          </div>

          {(loading) ? <Spinner size="medium" /> : ""}
        </Card>
      </div>

      <FilteredItems items={filtereditems} />
    </>
  );
};

export default ItemsFilter;
