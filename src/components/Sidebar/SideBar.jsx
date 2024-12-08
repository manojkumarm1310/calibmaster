import { useContext, useEffect, useState } from "react";
import { Sidebar, SidebarItem } from "react-rainbow-components";
import { FcBusinessman, FcFactory, FcImport, FcList, FcPortraitMode, FcWorkflow, FcInvite, FcSurvey, } from "react-icons/fc";
import { HiViewGridAdd } from "react-icons/hi";
import { AiFillFileAdd, AiFillSetting } from "react-icons/ai";
import { IoIosCreate } from "react-icons/io";
import { BiSolidAddToQueue } from "react-icons/bi";
import { FaListAlt } from "react-icons/fa";
import { BsHouseAddFill, BsList } from "react-icons/bs";
import { FaListUl } from "react-icons/fa"
import { useDispatch, useSelector } from "react-redux";
import { sidebarActions } from "../../store/sidebar";
import { AuthContext } from "../../context/auth-context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBuilding, faSquarePlus, faSliders, faList, faCertificate, faPersonChalkboard,
  faClipboardList, faUserGear, faPlus
} from "@fortawesome/free-solid-svg-icons";
import config from "../../utils/config.json";
import { notificationActions } from "../../store/nofitication";
import "./SideBar.css";
import LeftVerticalNavigation from "./LeftVerticalNavigation";
import RootLevelSidebar from "./RootLevelSidebar";
import DepartmentLevelSidebar from "./DepartmentLevelSidebar";

const iconsize = 30;

const SideBar = (props) => {

  const dispatch = useDispatch();
  const auth = useContext(AuthContext);

  const [enableCertificateCMS, setenableCertificateCMS] = useState(false);
  const [enableSRFMail, setenableSRFMail] = useState(false);

  const sidebar = useSelector((state) => state.sidebar.current);

  const sidebarHandler = (e, v) => {
    dispatch(sidebarActions.changesidebar(v));
  };

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

        if (item.is_enable && item.setting_name === "ENABLE_CERTIFICATE_GENERATION") {
          setenableCertificateCMS(true);
        }

        if (item.is_enable && item.setting_name === "SEND_SRF_MAIL") {
          setenableSRFMail(true);
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

  useEffect(() => {
    fetchCMSSettings();
  }, []);

  return (
    <div
      className="sidebar__container rainbow-p-top_small rainbow-p-bottom_medium"
      style={{ width: (auth.department === "admin" || auth.department === "Manager") && 180 }}
    >
      {
        auth.department === "root" &&
        <RootLevelSidebar sidebar={sidebar} sidebarHandler={sidebarHandler} iconsize={iconsize} />
      }

      {
        (auth.department === "admin" || auth.department === "Manager") &&
        <LeftVerticalNavigation sidebar={sidebar} sidebarHandler={sidebarHandler} iconsize={iconsize} />
      }

      {
        (auth.department !== "root" && auth.department !== "admin" && auth.department !== "Manager") &&
        <DepartmentLevelSidebar sidebar={sidebar} sidebarHandler={sidebarHandler} iconsize={iconsize} />
      }

    </div>
  );
};

export default SideBar;
