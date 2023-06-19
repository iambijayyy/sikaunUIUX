import { Link, useNavigate } from "react-router-dom";
import { useAuthContext } from "src/contexts/auth/auth.context";
import Header from "src/components/common/header";
import "./hero.scss";
import Image from "../../../../public-assets/study.png";

function Hero() {
  const { isUserLogged } = useAuthContext();
  const navigateTo = useNavigate();

  function goAhead() {
    const redirectTo = isUserLogged ? "/courses" : "/signup";
    navigateTo(redirectTo);
  }

  return (
    <Header>
      <div className="">
        <h2>Become what you want!</h2>
        <p>
          With our tools you can become the best version of you, learn with our
          courses and review your knowledge with our tests. Be part of our team!
        </p>

        <div className="actions-container">
          <button onClick={goAhead} className="primary-button">
            Let's start
          </button>

          {!isUserLogged && <Link to="/login">Log in!</Link>}
        </div>
      </div>
      <div className="image-container">
        <img src={Image} alt="" height="400" width="400" />
      </div>
    </Header>
  );
}

export default Hero;
