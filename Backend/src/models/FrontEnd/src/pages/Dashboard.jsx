import StatCard from "../components/StatCard"

function Dashboard({setPage,referrals}){

const total = referrals.length

const pending = referrals.filter(r=>r.status==="Pending").length

const completed = referrals.filter(r=>r.status==="Completed").length

return(

<div>

<h1 className="page-title">
Referral Management Dashboard
</h1>

<div className="stats">

<StatCard
title="Total Referrals"
number={total}
color="blue"
onClick={()=>setPage("referrals")}
/>

<StatCard
title="Pending Referrals"
number={pending}
color="orange"
/>

<StatCard
title="Completed Referrals"
number={completed}
color="green"
/>

</div>

</div>

)

}

export default Dashboard