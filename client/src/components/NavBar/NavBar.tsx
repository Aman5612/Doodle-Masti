import { FaRegShareFromSquare } from "react-icons/fa6";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import { LuLogOut } from "react-icons/lu";
import { useContext, useState } from "react";
import "./styles.css";
import { StateContext } from "../../StateProvider";
import ShareLink from "../ShareLink";

const NavBar = ({ keycloak }: any) => {
  const [smShow, setSmShow] = useState(false);
  const [isShare, setIsShare] = useState(false);
  const [joinModal, setJoinModal] = useState(false);
  const userDetails = keycloak?.idTokenParsed;

  const stateContext = useContext(StateContext);
  const handleLogout = (e) => {
    keycloak.logout();
  };
  const handleJoin = (e) => {
    setJoinModal(!joinModal);
  };
  const handleProfile = () => {
    setSmShow(!smShow);
  };
  const handleShare = () => {
    setIsShare(!isShare);
  };
  return (
    <>
      <nav className="navbar navbar-light bg-secondary d-flex p-1 ">
        <div className="container-fluid ">
          <Link
            to="/"
            className="navbar-brand  fs-5 d-flex gap-2 ms-2 fw-bold poppins-extrabold  text-secondary poppins-extrabold p-0 mb-0"
          >
            {stateContext?.location === "board" && (
              <Link to="/">
                <img
                  src="/home.png"
                  alt="home-icon"
                  width={23}
                  height={23}
                  className="mb-2 ml-2"
                />
              </Link>
            )}
            <span className="text-white">DoodleMasti</span>
          </Link>

          <div className="d-flex gap-4">
            <Button
              onClick={handleProfile}
              className="border-0 bg-secondary position-relative"
            >
              <img
                src="/profile.jpg"
                alt="profile"
                height={30}
                width={30}
                className="rounded-5 m-0 p-0"
              />
            </Button>
            {smShow && (
              <div
                className="width-20 height-20 d-flex flex-column bg-body-secondary position-absolute top-100 end-40 translate-middle-x p-4 rounded-3   mt-2 align-content-center"
                style={{ zIndex: 10 }}
              >
                <h2 className="fs-4">Hello {userDetails.name}</h2>

                <p>Welcome to DoodleMasti!</p>
              </div>
            )}

            <span className="d-flex gap-2">
              {stateContext?.location === "home" ? (
                <Button
                  className="btn btn-sm btn-secondary btn-outline-black  text-dark border-0 "
                  onClick={(e) => {
                    handleJoin(e);
                  }}
                  style={{
                    height: "2rem",
                    margin: "auto 0",
                    padding: "0.1rem 0.4rem 0.1rem 0.5rem",
                    backgroundColor: "#00F1FD",
                  }}
                >
                  Join
                </Button>
              ) : (
                <Button
                  className="btn btn-sm btn-secondary btn-outline-black  text-dark border-0 "
                  onClick={(e) => {
                    handleShare();
                  }}
                  style={{
                    height: "2rem",
                    margin: "auto 0",
                    padding: "0.1rem 0.4rem 0.1rem 0.5rem",
                    backgroundColor: "#00F1FD",
                  }}
                >
                  <FaRegShareFromSquare className="m-1 fs-5" />
                </Button>
              )}
              {isShare && <ShareLink />}

              {joinModal && (
                <div
                  className=" width-20 height-20 bg-body-secondary"
                  style={{
                    position: "absolute",
                    left: "72%",
                    top: "90%",
                    borderRadius: "15px",
                    zIndex: 2,
                  }}
                >
                  <div className="d-flex flex-column p-4">
                    <h2 className="fs-3">Join a Room</h2>
                    <div className="d-flex gap-4">
                      <input
                        type="text"
                        className="form-control"
                        placeholder="Enter Room ID"
                      />
                      <Button
                        className="btn btn-sm btn-secondary btn-outline-black  text-dark border-0 "
                        style={{
                          height: "2rem",
                          margin: "auto 0",
                          padding: "0.1rem 0.4rem 0.1rem 0.5rem",
                          backgroundColor: "#00F1FD",
                        }}
                      >
                        Join
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              <div className=" my-auto">|</div>
              <Button
                className="btn btn-sm border-0"
                style={{
                  backgroundColor: "#00F1FD",
                  color: "black",
                  height: "2rem",
                  margin: "auto 0",
                  padding: "0.1rem 1rem 0.1rem 0.5rem",
                }}
                onClick={handleLogout}
              >
                <LuLogOut className="m-2" />
                Logout
              </Button>
            </span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default NavBar;
