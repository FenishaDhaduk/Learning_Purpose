import Name from "./Name";
import { FetchData} from "./StaticdataApi";
import React,{Suspense} from "react";


function App() {

  const resorce = FetchData()

 function Name(){
  const name = resorce.name.read();
  return <h1>{name}</h1>
}

function Address(){
  const address = resorce.address.read();
  return <h1>{address}</h1>
}

  return (
    <>
<Name/> 
<Suspense fallback={<h2>Loading a data...</h2>}>
<Name/>
<Address/>
</Suspense>

    </>

  );
}

export default App;
