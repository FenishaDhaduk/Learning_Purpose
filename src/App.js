import Header from "./componets/Header";
import "bootstrap/dist/css/bootstrap.min.css";
import { Routes, Route } from "react-router-dom";
import Cards from "./componets/Cards";
import CardDetails from "./componets/CardDetails";


function App() {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Cards/>} />
        <Route path="/cart/:id" element={<CardDetails/>} />

      </Routes>
    </>
  );
}

export default App;
