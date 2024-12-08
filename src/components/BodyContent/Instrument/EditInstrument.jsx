import { useContext, useEffect, useState } from "react";
import { Card, Spinner, Input, Select } from "react-rainbow-components";
import "../InstrumentType/style.css";
import CustomButton from "../../Inputs/CustomButton";
import { useDispatch, useSelector } from "react-redux";
import config from "../../../utils/config.json";
import { notificationActions } from "../../../store/nofitication";
import { AuthContext } from "../../../context/auth-context";
import { sidebarActions } from "../../../store/sidebar";
import {
  populateUomData,
  populateDisciplineData,
  populateGroupData,
} from "./HelperFunction";

const EditInstrument = () => {
  const [instrumentName, setInstrumentName] = useState("");
  const [uomValue, setUomValue] = useState("");
  const [disciplineValue, setDisciplineValue] = useState("");
  const [groupValue, setGroupValue] = useState("");

  const [UOMs, setUOM] = useState([]);
  const [Discipline, setDiscipline] = useState([]);
  const [Group, setGroup] = useState([]);

  const [enableGroup, setenableGroup] = useState(true);

  const [instrumentNameErr, setInstrumentNameErr] = useState("");
  const [uomErr, setuomErr] = useState("");
  const [groupErr, setgroupErr] = useState("");

  const [loading, setloading] = useState(false);
  const [error, setError] = useState("");

  const auth = useContext(AuthContext);
  const dispatch = useDispatch();

  const instrumentId = useSelector((state) => state.instrumentId.current);

  async function fetchData() {
    setloading(true);

    try {
      const uomResonse = await fetch(config.Calibmaster.URL + "/api/uom/list", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
      }).then((res) => res.json());
      let getUomData = await populateUomData(uomResonse.data);
      setUOM(getUomData);

      const disciplineResponse = await fetch(
        config.Calibmaster.URL + "/api/instrument-discipline/list",
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
        }
      ).then((res) => res.json());
      let getDisciplineData = await populateDisciplineData(
        disciplineResponse.data
      );
      setDiscipline(getDisciplineData);

      setloading(false);
    } catch (error) {
      const errNotification = {
        title: "Something went wrong",
        description: "",
        icon: "error",
        state: true,
        timeout: 1500,
      };
      dispatch(notificationActions.changenotification(errNotification));
    }
  }

  const disciplineHandler = async (id) => {
    try {
      if (id != "") {
        setloading(true);
        setDisciplineValue(id);

        const groupResponse = await fetch(
          config.Calibmaster.URL + `/api/instrument-groups/fetch/${id}`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: "Bearer " + auth.token,
            },
          }
        ).then((res) => res.json());
        let getGroupData = await populateGroupData(groupResponse.data);
        
        setGroup(getGroupData);
        setenableGroup(false);
        setloading(false);
      } else {
        setDisciplineValue("")
        setGroupValue("");
        setenableGroup(true);
        setloading(false);
        return;
      }
    } catch (error) {
      const errNotification = {
        title: "Error While Getting Instrument Group!!!",
        icon: "error",
        state: true,
        timeout: 15000,
      };
      dispatch(notificationActions.changenotification(errNotification));
      setError("Error While Getting Instrument Group!!!");
      setloading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // *** fetchinstrumentId ***
  async function fetchinstrumentId() {
    try {
      setloading(true);

      const response = await fetch(
        config.Calibmaster.URL + "/api/instrument/fetch/" + instrumentId,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + auth.token,
          },
        }
      );

      const data = await response.json();
      if (data) {
        const {
          instrument_name,
          instrument_uom_id,
          instrument_discipline_id,
          instrument_group_id,
        } = data?.result;

        setInstrumentName(instrument_name);
        setUomValue(instrument_uom_id);
        setDisciplineValue(instrument_discipline_id);
        setGroupValue(instrument_group_id);
        disciplineHandler(instrument_discipline_id);
      }

      setloading(false);
    } catch (error) {
      const newNotification = {
        title: "Something went wrong",
        description: "",
        icon: "error",
        state: true,
      };
      dispatch(notificationActions.changenotification(newNotification));
      setloading(false);
    }
  }

  useEffect(() => {
    if (instrumentId) {
      fetchinstrumentId();
    }
  }, [instrumentId]);

  // *** updateinstrumentDetails ***
  const saveInstrument = async () => {
    setloading(true);

    if (!instrumentName.trim()) {
      setInstrumentNameErr("Please Enter Instrument Name");
      setloading(false);
      return;
    }
    if (uomValue == "") {
      setuomErr("UOM Name is Required");
      setloading(false);
      return;
    }
    if (groupValue == "" || disciplineValue == "") {
      setgroupErr("Group Name is Required");
      setloading(false);
      return;
    }

    const updateinstrument = {
      instrument_id: instrumentId,
      instrument_name: instrumentName,
      instrument_uom_id: uomValue?parseInt(uomValue):'',
      instrument_discipline_id: disciplineValue?parseInt(disciplineValue):'',
      instrument_group_id: groupValue?parseInt(groupValue):'',
    };

    try {
      const requestOptions = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
        body: JSON.stringify(updateinstrument),
      };

      const response = await fetch(
        config.Calibmaster.URL + "/api/instrument/edit",
        requestOptions
      );
      const data = await response.json();

      if (response.ok) {
        const newNotification = {
          title: "Instrument Updated Successfully",
          description: "",
          icon: "success",
          state: true,
          timeout: 15000,
        };
        dispatch(notificationActions.changenotification(newNotification));
        dispatch(sidebarActions.changesidebar("List-Instrument"));
        setError("");
      } else {
        setError(data?.message);
      }
      setloading(false);
    } catch (err) {
      const newNotification = {
        title: "Something went wrong",
        description: "",
        icon: "error",
        state: true,
      };
      dispatch(notificationActions.changenotification(newNotification));
      setError("Error While Instrument Lab!!");
      setloading(false);
    }
  };

  return (
    <div className="masterlist">
      <div className="add__masterlist__container">
        <Card className="add__user__card">
          <div className="add__user__label">
            <h3>Edit Instrument</h3>
          </div>
          {/* Instrument Name Start */}
          <div className="add__user__form">
            <div className="add__user__item">
              <Input
                label="Instrument Name"
                placeholder="Instrument Name"
                value={instrumentName}
                type="text"
                onChange={(e) => {
                  setInstrumentName(e.target.value);
                  setInstrumentNameErr("");
                }}
                disabled={false}
                required={true}
              />
              <span className="red">{instrumentNameErr}</span>
            </div>
          </div>

          {/* UOM Drop Down Start */}
          <div className="add__user__form">
            <div className="add__user__item">
              <Select
                label="Select UOM"
                options={UOMs}
                value={uomValue}
                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                disabled={false}
                required={true}
                onChange={(e) => {
                  setUomValue(e.target.value);
                  setuomErr("");
                }}
              />
              <span className="red">{uomErr}</span>
            </div>
          </div>
          {/* UOM Drop Down End */}

          {/* Discipline Drop Down */}
          <div className="add__user__form">
            <div className="add__user__item">
              <Select
                label="Select Discipline"
                options={Discipline}
                value={disciplineValue}
                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                disabled={false}
                onChange={(e) => disciplineHandler(e.target.value)}
              />
            </div>
          </div>

          {/* Group Drop Down */}
          <div className="add__user__form">
            <div className="add__user__item">
              <Select
                label="Select Group"
                options={Group}
                value={!enableGroup && groupValue}
                className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
                disabled={enableGroup}
                required={true}
                onChange={(e) => {
                  setGroupValue(e.target.value);
                  setgroupErr("");
                }}
              />
              <span className="red">{groupErr}</span>
            </div>
          </div>

          <div className="add__user__item">
            <CustomButton
              label="Save Instrument"
              variant="success"
              onclick={saveInstrument}
            />
          </div>

          <p className="red center w100">{error}</p>

          {loading ? <Spinner size="medium" /> : ""}
        </Card>
      </div>
    </div>
  );
};

export default EditInstrument;