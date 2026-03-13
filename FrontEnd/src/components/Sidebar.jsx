function Sidebar({page,setPage}){

const menu = [

{ id:"dashboard", label:"Dashboard", icon:"📊" },
{ id:"referrals", label:"Referrals", icon:"📋" },
{ id:"submit", label:"Submit Referral", icon:"➕" },
{ id:"team", label:"Team Overview", icon:"👥" },
{ id:"reports", label:"Reports", icon:"📄" },
{ id:"notifications", label:"Notifications", icon:"🔔" }

]

return(

<div className="sidebar">

<h2 className="logo">Health Matters</h2>

{menu.map(m => (

<button
key={m.id}
className={page===m.id ? "menu active" : "menu"}
onClick={()=>setPage(m.id)}
>

<span>{m.icon}</span> {m.label}

</button>

))}

</div>

)

}

export default Sidebar