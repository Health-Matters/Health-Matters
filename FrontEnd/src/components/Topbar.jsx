function Topbar({page,setPage}){

return(

<div className="topbar">

<div className="title">

Manager Dashboard

</div>

<div className="actions">

<button
className="primary-btn"
onClick={()=>setPage("submit")}
>
+ Submit Referral
</button>

<div className="user">

Manager

</div>

</div>

</div>

)

}

export default Topbar