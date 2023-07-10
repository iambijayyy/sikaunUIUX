import { Link } from "react-router-dom";
import LOGO_ICON from "src/assets/logo.svg";
import "./logo.scss";

function Logo() {
  return (
    <Link to="/">
      <div className="logo-container">
        <img className="logo" src={LOGO_ICON} alt="CoursesLive" />
        <h1>Sikaun</h1>
      </div>
    </Link>
  );
}

export default Logo;
