import { useContext, useEffect, useState } from "react";
import { StateContext } from "../../StateProvider";
import "./styles.css";
import { Link } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";

interface cardProps {
  id: string;
  title: string;
  imgUrl: string;
}

const LandingPage = () => {
  const handleFetchData = async () => {
    const response = await fetch("http://localhost:3000/getCards");
    const data = await response.json();
    setCardData(data);
  };

  const handleCreateCard = async () => {
    await fetch("http://localhost:3000/addCard", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        title: `Board-${cardData.length}`,
        imgUrl: "empty.png",
      }),
    });
  };

  const stateContext = useContext(StateContext);
  stateContext?.setLocation("home");
  const [token, setToken] = useState("");
  const [cardData, setCardData] = useState<cardProps[]>([]);

  useEffect(() => {
    const newToken = uuidv4();
    setToken(newToken);
  }, []);

  useEffect(() => {
    handleFetchData();
  }, []);

  return (
    <div
      className="min-vh-100 overflow-auto z-1"
      style={{ backgroundColor: "gray-300" }}
    >
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
          <Link to={`/landing-page/${token}`}>
            <span className="bg-light rounded-5 hover">
              <img
                src="plus.png"
                alt="add"
                height={70}
                width={70}
                onClick={handleCreateCard}
              />
            </span>
          </Link>
        </div>
        {cardData.length > 0 &&
          cardData.map((card) => {
            return (
              <div
                className="card shadow border-1 rounded-3"
                style={{ width: "20rem", height: "15rem" }}
                key={card.id}
              >
                <img
                  src={card.imgUrl}
                  className="card-img-top "
                  alt="card-img"
                  style={{ height: "180px" }}
                />
                <div className="card-body shadow-lg pb-0 border-2">
                  <h5 className="card-title">{card.title}</h5>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default LandingPage;
