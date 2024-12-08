import { VerticalNavigation, VerticalItem, VerticalSectionOverflow, SidebarItem } from 'react-rainbow-components';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FcInvite } from "react-icons/fc";
import { faSquarePlus, faClipboardList, faSync, faKey } from '@fortawesome/free-solid-svg-icons';
import { AuthContext } from '../../context/auth-context';
import { useContext } from 'react';

const LeftVerticalNavigation = ({ sidebar, sidebarHandler, iconsize }) => {

    const auth = useContext(AuthContext);

    return (
        <VerticalNavigation
            selectedItem={sidebar}
            onSelect={sidebarHandler}
        >

            {/* Customers */}
            <VerticalSectionOverflow label="Customers">
                <VerticalItem
                    name="Create-Customer"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-Customer"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Users */}
            {auth.department === 'admin' ? (<VerticalSectionOverflow label="Users">
                <VerticalItem
                    name="Add User"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="Users"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>) : null}

            {/* UOM */}
            <VerticalSectionOverflow label="UOM">
                <VerticalItem
                    name="Create-UOM"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-UOM"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Instrument */}
            <VerticalSectionOverflow label="Instrument">
                <VerticalItem
                    name="Create-Instrument"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-Instrument"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Create Instrument Variants */}
            <VerticalSectionOverflow label="Instrument Variants" description="Instrument Variants">
                <VerticalItem
                    name="Create-Instrument-Type"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-Instrument-Type"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Uncertainty Parameter */}
            {/* <VerticalSectionOverflow label="Uncertainty Parameter" description="Uncertainty Parameter">
                <VerticalItem
                    name="Create-Uncertainty-Parameter"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-Uncertainty-Parameter"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow> */}

            {/* ULR Setup */}
            <VerticalSectionOverflow label="ULR Setup">
                <VerticalItem
                    name="ULR-Setup"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-ULR"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Add SRF */}
            <VerticalSectionOverflow label="SRF">
                <VerticalItem
                    name="Add-SRF-Config"
                    label="Create Config"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-SRF-Config"
                    label="List Config"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
                <VerticalItem
                    name="Add SRF"
                    label="Create SRF"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="SRFs"
                    label="List SRF"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Master */}
            <VerticalSectionOverflow label="Master">
                <VerticalItem
                    name="Standard-Details"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-Master"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Employee */}
            <VerticalSectionOverflow label="Employee">
                <VerticalItem
                    name="Create-Employee"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-Employee"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Procedure */}
            <VerticalSectionOverflow label="Procedure">
                <VerticalItem
                    name="Define-Procedure"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}
                />
                <VerticalItem
                    name="List-Defined-Procedure"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            <VerticalSectionOverflow label="Calibration Due Date">
                <VerticalItem
                    name="Due-date"
                    label="Due Date"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            {/* Bank Configuration */}
            <VerticalSectionOverflow label="Bank Setup">
                <VerticalItem
                    name="Add-Bank-Config"
                    label="Create"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}

                />
                <VerticalItem
                    name="List-Bank-Config"
                    label="List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}

                />
            </VerticalSectionOverflow>


            {/* Quotation configuration and List */}
            <VerticalSectionOverflow label="Quotation Setup">
                <VerticalItem
                    name="Quotation-Config"
                    label="Create Config"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}

                />
                <VerticalItem
                    name="Quotation-Config-list"
                    label="List Config"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}

                />

                <VerticalItem
                    name="Quotation-Item"
                    label="Create Quotation"
                    icon={<FontAwesomeIcon icon={faSquarePlus} />}

                />
                <VerticalItem
                    name="Quotation-Customer-list"
                    label="Customer List"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}

                />
            </VerticalSectionOverflow>

            {/* E-Mail */}
            <VerticalSectionOverflow label="E-Mail" description="Update and Test SMTP">
                <VerticalItem
                    name="E-Mail"
                    label="Update"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>

            <VerticalSectionOverflow label="Sync Data" description="Sync CM & CP">
                <VerticalItem
                    name="Sync-Data"
                    label="Sync Data"
                    icon={<FontAwesomeIcon icon={faSync} />}
                />
            </VerticalSectionOverflow>

            {/* Lab Info */}
            {auth.department === 'admin' ? (<VerticalSectionOverflow label="Lab Info">
                <VerticalItem
                    name="Edit-Lab"
                    label="Update"
                    icon={<FontAwesomeIcon icon={faClipboardList} />}
                />
            </VerticalSectionOverflow>) : null}

            {/* Admin Info */}
            {auth.department === 'admin' ? (<VerticalSectionOverflow label="Admin Info">
                <VerticalItem
                    name="Reset-Password"
                    label="Reset Password"
                    icon={<FontAwesomeIcon icon={faKey} />}
                />
            </VerticalSectionOverflow>) : null}
        </VerticalNavigation>
    )
}

export default LeftVerticalNavigation;