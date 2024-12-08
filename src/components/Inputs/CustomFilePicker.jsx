import "./CustomFilePicker.css";
import { FileSelector } from "react-rainbow-components";

const containerStyles = {
  maxWidth: 300,
};

const CustomFilePicker = (props) => {
  return (
    <FileSelector
      className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto"
      style={containerStyles}
      label={props.label}
      placeholder={props.placeholder}
      bottomHelpText={props.helptext}
      variant="multiline"
      required={props.required}
      disabled={props.disabled}
      onChange={(v) => {
        props.onchange(v);
      }}
    />
  );
};

export default CustomFilePicker;
