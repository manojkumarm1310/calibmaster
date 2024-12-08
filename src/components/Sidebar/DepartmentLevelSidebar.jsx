import React, { useContext } from 'react'
import { Sidebar, SidebarItem } from 'react-rainbow-components'
import { AuthContext } from '../../context/auth-context';

import { FcBusinessman, FcFactory, FcImport, FcPortraitMode, FcWorkflow, FcInvite, } from "react-icons/fc";
import { HiViewGridAdd } from "react-icons/hi";
import { AiFillFileAdd, AiFillSetting } from "react-icons/ai";
import { BiSolidAddToQueue } from "react-icons/bi";
import { FaListAlt } from "react-icons/fa";
import { BsHouseAddFill, BsList } from "react-icons/bs";
import { FaListUl } from "react-icons/fa"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBuilding, faSquarePlus, faSliders, faList, faCertificate, faPersonChalkboard, faUserGear, } from "@fortawesome/free-solid-svg-icons";

const DepartmentLevelSidebar = ({ sidebar, sidebarHandler, iconsize }) => {

    const auth = useContext(AuthContext);
    // console.log("TopLevelSidebar")

    return (
        <Sidebar selectedItem={sidebar} onSelect={sidebarHandler} id="sidebar-1">

            {/* === Add Lab === */}
            {auth.department === "root" ? (
                <SidebarItem
                    icon={<BsHouseAddFill size={iconsize} />}
                    name="Labs"
                    label="Add Lab"
                />
            ) : null}

            {/* === List Lab === */}
            {auth.department === "root" ? (
                <SidebarItem
                    icon={<FcFactory size={iconsize} />}
                    name="List-Labs"
                    label="List Lab"
                />
            ) : null}

            {/* === Create Lab Config === */}
            {auth.department === "root" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faCertificate} />}
                    name="Create-Config"
                    label="Create Config"
                    style={{ color: "#ff4747" }}
                />
            ) : null}

            {/* === List Lab Config === */}
            {auth.department === "root" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faList} />}
                    name="List-Config"
                    label="List Config"
                    style={{ color: "#ff4747" }}
                />
            ) : null}

            {/* === Create Customers === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                    name="Create-Customer"
                    label="Create Customer"
                    style={{ color: "rebeccapurple" }}
                />
            ) : null}

            {/* === List Customers === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faBuilding} />}
                    name="List-Customer"
                    label="List Customer"
                    style={{ color: "rebeccapurple" }}
                />
            ) : null}

            {/* === Add Users === */}
            {auth.department === "admin" ? (
                <SidebarItem
                    icon={<FcBusinessman size={iconsize} />}
                    name="Add User"
                    label="Add User"
                />
            ) : null}

            {/* === List Users === */}
            {auth.department === "admin" ? (
                <SidebarItem
                    icon={<FcPortraitMode size={iconsize} />}
                    name="Users"
                    label="Users"
                />
            ) : null}

            {/* === Add UOM === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<HiViewGridAdd size={iconsize} />}
                    name="Create-UOM"
                    label="UOM"
                    style={{ color: "red" }}
                />
            ) : null}

            {/* === List UOM === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FaListAlt size={iconsize} />}
                    name="List-UOM"
                    label="List UOM"
                    style={{ color: "green" }}
                />
            ) : null}

            {/* === Create Instrument === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<AiFillFileAdd size={iconsize} />}
                    name="Create-Instrument"
                    label="Add Instrument"
                    style={{ color: "#e3881c" }}
                />
            ) : null}

            {/* === Create Instrument Variants === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<BiSolidAddToQueue size={iconsize} />}
                    name="Create-Instrument-Type"
                    label="Add Instrument Variants"
                    style={{ color: "rebeccapurple" }}
                />
            ) : null}

            {/* === List Instrument Type === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FaListUl size={iconsize} />}
                    name="List-Instrument-Type"
                    label="List Instrument Variants"
                    style={{ color: "#048061" }}
                />
            ) : null}

            {/* === Add Uncertainty Parameter === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                    name="Create-Uncertainty-Parameter"
                    label="Add Uncertainty Parameter"
                    style={{ color: "#0039e8" }}
                />
            ) : null}

            {/* === List Uncertainty Parameter === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FaListAlt size={iconsize} />}
                    name="List-Uncertainty-Parameter"
                    label="List Uncertainty Parameter"
                    style={{ color: "#0039e8" }}
                />
            ) : null}

            {/* === Add SRF Config === */}
            {auth.department === "CSD" || auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<AiFillSetting size={iconsize} />}
                    name="Add-SRF-Config"
                    label="Add SRF Config"
                />
            ) : null}

            {/* === List SRF Config === */}
            {auth.department === "Calibration" || auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<BsList size={iconsize} />}
                    name="List-SRF-Config"
                    label="List SRF Config"
                />
            ) : null}

            {/* ULR Setup */}
            {auth.department === "admin" || auth.department === "Manager" || auth.department === "CSD" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                    name="ULR-Setup"
                    label="ULR Setup"
                    style={{ color: "rgb(51 180 255)" }}
                />
            ) : null}

            {/* List ULR */}
            {auth.department === "admin" || auth.department === "Manager" || auth.department === "Calibration" ? (
                <SidebarItem
                    icon={<BsList size={iconsize} />}
                    name="List-ULR"
                    label="List ULR"
                    style={{ color: "rgb(51 180 255)" }}
                />
            ) : null}

            {/* === Add SRF === */}
            {auth.department === "CSD" || auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FcImport size={iconsize} />}
                    name="Add SRF"
                    label="Add SRF"
                />
            ) : null}

            {/* === List SRF === */}
            {auth.department !== "root" ? (
                <SidebarItem
                    icon={<FcWorkflow size={iconsize} />}
                    name="SRFs"
                    label="SRFs"
                />
            ) : null}

            {/* === Create Standard Details === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faSliders} />}
                    name="Standard-Details"
                    label="Standard Details"
                    style={{ color: "rebeccapurple" }}
                />
            ) : null}

            {/* === List Standard Details === */}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faList} />}
                    name="List-Master"
                    label="List Master"
                    style={{ color: "rebeccapurple" }}
                />
            ) : null}

            {/* Define Procedure */}
            {auth.department === "admin" || auth.department === "Manager" && enableCertificateCMS ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faPersonChalkboard} />}
                    name="Define-Procedure"
                    label="Define Procedure"
                    style={{ color: "#ff4747" }}
                />
            ) : null}

            {/* List-Defined-Procedure */}
            {auth.department === "admin" || auth.department === "Manager" && enableCertificateCMS ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faList} />}
                    name="List-Defined-Procedure"
                    label="List Defined Procedure"
                    style={{ color: "#ff4747" }}
                />
            ) : null}

            {/* First From Tableb List */}
            {/* {auth.department === "admin" && enableCertificateCMS ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                    name="First-From-Table-List"
                    label="First From Table List"
                    style={{ color: "rgb(145 39 252)" }}
                />
                ) : null} */}

            {/* Result Table List */}
            {/* {auth.department === "admin" && enableCertificateCMS ? (
            <SidebarItem
                icon={<FontAwesomeIcon icon={faClipboardList} />}
                name="Result-Table-List"
                label="Result Table List"
                style={{ color: "rgb(202 99 46)" }}
            />
            ) : null} */}

            {/* Create-Employee */}
            {auth.department === "admin" || auth.department === "Manager" || auth.department === "CSD" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faUserGear} />}
                    name="Create-Employee"
                    label="Create Employee"
                    style={{ color: "rgb(51 180 255)" }}
                />
            ) : null}

            {/* List-Employee */}
            {auth.department === "admin" || auth.department === "Manager" || auth.department === "CSD" ? (
                <SidebarItem
                    icon={<FontAwesomeIcon icon={faList} />}
                    name="List-Employee"
                    label="List Employee"
                    style={{ color: "rgb(51 180 255)" }}
                />
            ) : null}

            {/*=== Due-date-list ===*/}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FaListAlt size={iconsize} />}
                    name="Due-date"
                    label="Due date"
                    style={{ color: "#5AB2FF" }}
                />
            ) : null}

            {/*=== Add Bank Configurations ===*/}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<BiSolidAddToQueue size={iconsize} />}
                    name="Add-Bank-Config"
                    label="Add Bank Config"
                    style={{ color: "blue" }}
                />
            ) : null}

            {/*=== List Bank Configurations ===*/}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<BiSolidAddToQueue size={iconsize} />}
                    name="List-Bank-Config"
                    label="List Bank Config"
                    style={{ color: "blue" }}
                />
            ) : null}


            {/*=== Quotation Config ===*/}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<AiFillSetting size={iconsize} />}
                    name="Quotation-Config"
                    label="Add Quotation Config"
                    style={{ color: "#5AB2FF" }}
                />
            ) : null}

            {/*=== Quotation Item ===*/}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<BiSolidAddToQueue size={iconsize} />}
                    name="Quotation-Config-list"
                    label="List Quotation Config"
                    style={{ color: "#5AB2FF" }}
                />
            ) : null}

            {/*=== Quotation Item ===*/}
            {auth.department === "admin" || auth.department === "Accounts" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FaListAlt size={iconsize} />}
                    name="Quotation-Item"
                    label="Generate Quotation"
                    style={{ color: "#5AB2FF" }}
                />
            ) : null}

            {/*=== Quotation-customer-list ===*/}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FaListAlt size={iconsize} />}
                    name="Quotation-customer-list"
                    label="Quotation Customer List"
                    style={{ color: "#5AB2FF" }}
                />
            ) : null}

            {/*=== Send Test E-Mail ===*/}
            {auth.department === "admin" || auth.department === "Manager" ? (
                <SidebarItem
                    icon={<FcInvite size={iconsize} />}
                    name="E-Mail"
                    label="E-Mail"
                />
            ) : null}

        </Sidebar>
    )
}

export default DepartmentLevelSidebar