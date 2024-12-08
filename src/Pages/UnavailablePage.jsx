import { Card } from "react-rainbow-components";
import "./UnavailablePage.css";
import serviceunavailable from "../images/service-unavailable.jpg";

const UnavailablePage = () => {
  return (
    <div className="service__unavailable">
      <Card className="service__unavailable__card">
        <img
          className="service__unavailable__img"
          src={serviceunavailable}
          alt="Service Unavailable"
        />
      </Card>
    </div>
  );
};

export default UnavailablePage;
