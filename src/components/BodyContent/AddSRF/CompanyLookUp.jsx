import { useEffect, useState } from "react";
import { Lookup } from "react-rainbow-components";
import "../../Inputs/CustomLookup.css";

const containerStyles = {
  maxWidth: 700,
};

const CompanyLookUp = (props) => {

  const [state, setState] = useState({ options: null });
  const [data, setData] = useState();

  useEffect(() => {
    if (props.options) {
      const companieslist = props.options.map((v, i) => ({
        ...v,
        label: v.customer_name,
      }));
      setData(companieslist);
    }
  }, [props.options]);

  const selectHandler = (option) => {
    // console.log(option);
    setState({ option });
    props.onselect(option);
    props.setContactPerson(option?.customer_contact?.contact_fullname);
    props.setContactNumber(option?.customer_contact?.contact_phone_1);
    props.setContactEmail(option?.customer_contact?.contact_email);
    props.setCompanyErr("");
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
      props.setCompanyErr("");
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
      id={props.label}
      label={props.label}
      placeholder={props.label}
      options={state.options}
      value={state.option}
      onChange={(option) => selectHandler(option)}
      onSearch={search}
      style={containerStyles}
      required={props.required ? true : false}
      className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
    />
  );
};

export default CompanyLookUp;
