import { FaRegShareFromSquare } from "react-icons/fa6";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import Button from "react-bootstrap/Button";
import { LuLogOut } from "react-icons/lu";
import { useState } from "react";
import "./styles.css";

const NavBar = ({ keycloak }: any) => {
  const [smShow, setSmShow] = useState(false);
  const userDetails = keycloak?.idTokenParsed;
  console.log(userDetails);

  const handleLogout = () => {
    keycloak.logout();
  };
  return (
    <>
      <nav className="navbar navbar-light bg-light d-flex  shadow ">
        <div className="container-fluid ">
          <Link
            to="/"
            className="navbar-brand  fs-3 d-flex gap-3 ms-2 fw-bolder poppins-extrabold  text-secondary poppins-extrabold"
          >
            <Link to="/">
              <img src="home.png" alt="home-icon" width={33} height={33} />
            </Link>
            DoodleMasti
          </Link>

          <div className="d-flex gap-4">
            <Button
              onClick={() => setSmShow(!smShow)}
              className="border-0 bg-light position-relative"
            >
              <img
                src="profile.jpg"
                alt="profile"
                height={45}
                width={45}
                className="rounded-5 m-0 p-0"
              />
            </Button>
            {smShow && (
              <div className="width-20 height-20 d-flex flex-column  position-absolute top-100 end-40 translate-middle-x p-4 rounded-3 shadow  mt-2 align-content-center">
                <h2 className="fs-3">Hello, {userDetails?.given_name}</h2>

                <p>Welcome to DoodleMasti!</p>
              </div>
            )}

            <span className="d-flex gap-2">
              <button
                className="btn btn-outline-black btn-lg disabled ps-4 d-flex gap-3 fs-6 "
                type="button"
              >
                <FaRegShareFromSquare className="my-auto" />
                <span className="my-auto">Invite</span>
              </button>
              <div className=" my-auto fs-5 ">|</div>
              <Button
                className="btn btn-lg btn-secondary fs-6"
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
