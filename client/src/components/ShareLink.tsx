import { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import { RiFileCopyLine } from "react-icons/ri";
import { RiFileCopyFill } from "react-icons/ri";

const ShareLink = () => {
  const [isCopied, setisCopied] = useState(false);
  return (
    <div
      className=" width-20 height-20 bg-body-secondary"
      style={{
        position: "absolute",
        left: "72%",
        top: "100%",
        borderRadius: "15px",
        zIndex: 2,
      }}
    >
      <div className="d-flex flex-column p-4">
        <h2 className="fs-3">Invite your friends</h2>
        <div className="d-flex gap-3">
          <input
            type="text"
            className="form-control"
            placeholder="Enter the email ID"
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
            Invite
          </Button>
        </div>
        <p className="text-center mt-2 mb-1 ">or</p>
        <div className="d-flex gap-3 ">
          <span
            // className={`border px-2 pb-1 bg-white rounded ${
            //   isCopied ? "scale-125 font-extrabold" : ""
            // }`}
            onClick={() => {
              navigator.clipboard.writeText(window.location.href);
              setisCopied(true);
              setTimeout(() => {
                setisCopied(false);
              }, 3000);
            }}
          >
            {isCopied ? <RiFileCopyFill /> : <RiFileCopyLine />}
          </span>
          <h5 className="my-auto">Copy the link</h5>
        </div>
      </div>
    </div>
  );
};

export default ShareLink;
