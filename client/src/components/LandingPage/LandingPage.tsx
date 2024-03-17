import { useContext } from "react";
import { StateContext } from "../../StateProvider";
import "./styles.css";
import { Link } from "react-router-dom";

const LandingPage = () => {
  const stateContext = useContext(StateContext);

  stateContext?.setLocation("home");

  return (
    <div className="min-vh-100 z-1" style={{ backgroundColor: "gray-300" }}>
      <div
        className="  d-flex flex-wrap justify-content-start gap-4 pt-4 "
        style={{ padding: "0px 100px" }}
      >
        <div
          className="card shadow-lg border-1 rounded-3 d-flex justify-content-center align-items-center"
          style={{
            width: "20rem",
            height: "15rem",
            backgroundColor: "gray-100",
          }}
        >
          <Link to={"/landing-page"}>
            <span className="bg-light rounded-5 hover">
              <img src="plus.png" alt="add" height={70} width={70} />
            </span>
          </Link>
        </div>
        <div
          className="card shadow border-1 rounded-3"
          style={{ width: "20rem", height: "15rem" }}
        >
          <img
            src="empty.png"
            className="card-img-top "
            alt="card-img"
            style={{ height: "180px" }}
          />
          <div className="card-body shadow-lg pb-0 border-2">
            <h5 className="card-title">White Board 1</h5>
          </div>
        </div>
        <div
          className="card shadow border-1 rounded-3"
          style={{ width: "20rem", height: "15rem" }}
        >
          <img
            src="empty.png"
            className="card-img-top "
            alt="card-img"
            style={{ height: "180px" }}
          />
          <div className="card-body shadow-lg pb-0 border-2">
            <h5 className="card-title">White Board 2</h5>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
