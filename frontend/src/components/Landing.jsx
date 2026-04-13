import { Link } from 'react-router-dom';

const Landing = () => {
  return (
    <>
      <img
        src="/images/figma.jpg"
        alt="Background"
        className="landing-bg"
      />

      <div className="landing-panel">

        <div className="landing-logo-circle">
          <img
            src="/images/logo.png"
            alt="Recipe Nest Logo"
            className="landing-logo-img"
          />
        </div>

        <div className="landing-buttons">
          <Link to ="/login" className="landing-btn landing-btn-primary">
            Get Started
          </Link>
          <Link to="/signup" className="landing-btn landing-btn-outline">
            Sign In
          </Link>
        </div>

      </div>
    </>
  );
};

export default Landing;