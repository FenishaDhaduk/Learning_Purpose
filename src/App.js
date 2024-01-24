import Excelexport from "./Excelexport";


function App() {
  
  const ExcelData = [
    {
    "firstname":"Fenisha",
    "lastName":"Dhaduk",
    "employee":"upsquare",
    "Address":"Ahemadabad"
  },
  {
    "firstname":"neha",
    "lastName":"bhat",
    "employee":"infoys",
    "Address":"rajkot"
  },
  {
    "firstname":"tom",
    "lastName":"mickey",
    "employee":"7span",
    "Address":"Ahemadabad"
  }
]
  return (
    <div className="App">
     <Excelexport excelData={ExcelData} fileName={"Excel Export"}/>
    </div>
  );
}

export default App;
