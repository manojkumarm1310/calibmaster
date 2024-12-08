import React from 'react'
import { Button, Column, TableWithBrowserPagination } from 'react-rainbow-components'

const ListMasterEquipments = ({ addEquipmets, setAddEquipmets }) => {

    const removeEquipment = ({ index }) => (
        <Button
            variant="destructive"
            label="Remove"
            onClick={() => {
                console.log(index);
                const deleteValue = [...addEquipmets];
                deleteValue.splice(index, 1);
                setAddEquipmets(deleteValue);
            }}
        />
    );

    return (
        <TableWithBrowserPagination
            pageSize={5}
            data={addEquipmets}
            keyField="master_list_equipment_id"
        >
            <Column header="SL" component={({ index }) => index + 1} />
            <Column header="Standard Maintained" field="standard_maintained" />
            <Column header="Name Of Equipment" field="name_of_equipment" />
            <Column header="UID" field="uid" />
            <Column header="Make" field="make" />
            <Column header="Model Type" field="model_type" />
            <Column header="Remove" field="id" component={removeEquipment} />

        </TableWithBrowserPagination>
    )
}

export default ListMasterEquipments