import React, { useEffect, useState } from 'react';
import { Lookup } from 'react-rainbow-components';

const AddMasterEquipments = ({ masterList, addEquipmets, setAddEquipmets, setMasterListError }) => {

    const [state, setState] = useState({ options: null });
    const [data, setData] = useState([]);

    useEffect(() => {
        const masterlist = masterList.map((v, i) => ({
            ...v,
            label: v.name_of_equipment,
        }));
        setData(masterlist);
    }, [masterList]);

    const selectHandler = (option) => {
        console.log(option);
        setState({ option });

        if (option != null) {
            if (addEquipmets.indexOf(option) === -1) {
                setAddEquipmets([...addEquipmets, option]);
                setMasterListError("");
            }
        }
    };

    function filter(query, options) {
        if (query) {
            return options.filter((item) => {
                const regex = new RegExp(query, "i");
                return regex.test(item.label);
            });
        }
        return [];
    }

    function search(value) {
        if (state.options && state.value && value.length > state.value.length) {
            setState({
                options: filter(value, state.options),
                value,
            });
        } else if (value) {
            setState({
                value,
            });
            setState({
                options: filter(value, data),
                value,
            });
        } else {
            setState({
                value: "",
                options: null,
            });
        }
    }

    return (
        <Lookup
            label={"Master Equipments"}
            placeholder={"Master Equipments"}
            options={state?.options}
            value={state?.option}
            onChange={(option) => selectHandler(option)}
            onSearch={search}
            required={true}
        />
    );
}

export default AddMasterEquipments;