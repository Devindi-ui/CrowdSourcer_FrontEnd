import { Outlet } from "react-router-dom";

function OwnerLayout(){
  return(
    <div style={{padding:"20px"}}>
      <h2>Owner Dashboard</h2>
      <Outlet/>
    </div>
  )
}

export default OwnerLayout;