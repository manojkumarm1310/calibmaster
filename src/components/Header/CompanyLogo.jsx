import "./CompanyLogo.css";
import config from "../../utils/config.json";
import packageconfig from "../../../package.json";
import companylogo from "../../images/CalibMaster_Logo2.png";
import { AuthContext } from "../../context/auth-context";
import { useContext } from "react";

const CompanyLogo = (props) => {
  const auth = useContext(AuthContext);
  const logo = localStorage.getItem("logo");
  const frontEndVersion = packageconfig.version || "0.0.0";

  return (
    <div className="company__logo__container">
      <img
        className="company__logo"
        src={
          logo
            ? `${config.Calibmaster.URL}/images/${logo}`
            : companylogo}
        alt="company logo"
        title={`version ${frontEndVersion}/${auth.backEndVersion}`}
      />
    </div>
  );
};

export default CompanyLogo;
