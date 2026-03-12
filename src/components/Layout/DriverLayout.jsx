import { Outlet } from "react-router-dom";

function DriverLayout(){
  return(
    <div style={{padding:"20px"}}>
      <h2>Driver Dashboard</h2>
      <Outlet/>
    </div>
  )
}

export default DriverLayout;