import CompanyLogo from "./CompanyLogo";
import "./Header.css";
import UserInfo from "./UserInfo";

const Header = (props) => {
  return (
    <div className="header">
      <CompanyLogo />

      <UserInfo />
    </div>
  );
};

export default Header;
