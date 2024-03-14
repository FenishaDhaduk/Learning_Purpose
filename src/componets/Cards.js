import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Cardsdata from "./CardsData";
import "./style.css";
import { ADD } from "../redux/actions/action";
import { useDispatch } from "react-redux";

function Cards() {
  const [data, setData] = useState(Cardsdata);
  const dispatch = useDispatch()

  const send = (item,event)=>{
    event.preventDefault()
    dispatch(ADD(item))
  }
  return (
    <div className="container mt-3">
      <h2 className="text-center">Add To Cart Projects</h2>
      <div className="row d-flex justify-content-center align-align-items-center ">
        {data.map((item, id) => {
          return (
            <>
              <Card
                style={{ width: "22rem", border: "none" }}
                className="mx-2 mt-4 card_style"
              >
                <Card.Img
                  variant="top"
                  src={item?.imgdata}
                  className="mt-3"
                  style={{ height: "16rem" }}
                />
                <Card.Body>
                  <Card.Title>{item?.rname}</Card.Title>
                  <Card.Text>Price : ₹ {item.price}</Card.Text>
                  <div className="button_div d-flex justify-content-center">
                    <Button variant="primary" className="col-lg-12" onClick={(event)=>send(item,event)}>Add To Cart</Button>
                  </div>
                </Card.Body>
              </Card>
            </>
          );
        })}
      </div>
    </div>
  );
}

export default Cards;
