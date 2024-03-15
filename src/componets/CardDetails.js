import React, { useEffect, useState } from "react";
import { Table } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { ADD, DELETE, REMOVE } from "../redux/actions/action";

function CardDetails() {
  const [data, setData] = useState([]);
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const getData = useSelector((state) => state.cartreducer.carts);

 
  useEffect(() => {
    fetchSingleData();
  }, [getData]);

  const fetchSingleData = () => {
    let item = getData.filter((e) => {
      return e.id == id;
    });
    setData(item[0]);
  };

  console.log(data,"data")
  const addItem = (data) => {
    dispatch(ADD(data));
  };

  const deleteItem = (id) => {
    dispatch(DELETE(id));
    navigate("/");
  };

  const removeoneitem = (item)=>{
    dispatch(REMOVE(item))
  }
  
  return (
    <div className="container  mt-2">
      <h2 className="text-center">Iteams Details Page</h2>
      <section className="container mt-3">
        <div className="iteamsdetails">
          <div className="items_img">
            <img src={data?.imgdata} />
          </div>
          <div className="details">
            <Table>
              <tr>
                <td>
                  <p>
                    {" "}
                    <strong>Restaurant</strong> : {data?.rname}
                  </p>
                  <p>
                    {" "}
                    <strong>Price</strong> : ₹{data?.price}
                  </p>
                  <p>
                    {" "}
                    <strong>Dishes</strong> : {data?.address}
                  </p>
                  <p>
                    {" "}
                    <strong>Total</strong> :₹ {data?.price * data?.qnty}
                  </p>
                  <div className='mt-5 d-flex justify-content-between align-items-center' style={{width:100,cursor:"pointer",background:"#ddd",color:"#111"}}>
                  <span style={{fontSize:24}}  onClick={data.qnty <=1 ? ()=>deleteItem(data.id) : ()=>removeoneitem(data)}>-</span>
                  <span style={{fontSize:22}}>{data?.qnty}</span>
                  <span style={{fontSize:24}} onClick={()=>addItem(data)}>+</span>

                  </div>

                </td>
                <td>
                  <p>
                    <strong>Rating :</strong>{" "}
                    <span
                      style={{
                        background: "green",
                        color: "#fff",
                        padding: "2px 5px",
                        borderRadius: "5px",
                      }}
                    >
                      {data?.rating}★{" "}
                    </span>
                  </p>
                  <p>
                    <strong>Order Review :</strong>{" "}
                    <span>{data?.somedata} </span>
                  </p>
                  <p>
                    <strong>Remove :</strong>{" "}
                    <span onClick={() => deleteItem(data?.id)}>
                      <i
                        className="fas fa-trash"
                        style={{
                          color: "red",
                          fontSize: 20,
                          cursor: "pointer",
                        }}
                      ></i>{" "}
                    </span>
                  </p>
                </td>
              </tr>
            </Table>
          </div>
        </div>
      </section>
    </div>
  );
}

export default CardDetails;
