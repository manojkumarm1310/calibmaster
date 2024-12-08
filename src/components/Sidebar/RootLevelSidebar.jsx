import { useContext } from 'react';
import { Sidebar, SidebarItem } from 'react-rainbow-components';
import { FcFactory } from "react-icons/fc";
import { BsHouseAddFill } from "react-icons/bs";
import { AuthContext } from '../../context/auth-context';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faCertificate } from "@fortawesome/free-solid-svg-icons";

const RootLevelSidebar = ({ sidebar, sidebarHandler, iconsize }) => {

    const auth = useContext(AuthContext);

    return (
        <Sidebar
            selectedItem={sidebar}
            onSelect={sidebarHandler} id="sidebar-1">

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

        </Sidebar>
    )
}

export default RootLevelSidebar;