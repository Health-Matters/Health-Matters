function Referrals({referrals}){

return(

<div>

<h1 className="page-title">Referrals</h1>

<table className="table">

<thead>

<tr>

<th>Referral ID</th>
<th>Employee</th>
<th>Manager</th>
<th>Service</th>
<th>Status</th>

</tr>

</thead>

<tbody>

{referrals.map(r => (

<tr key={r.id}>

<td>{r.id}</td>
<td>{r.employee}</td>
<td>{r.manager}</td>
<td>{r.service}</td>
<td className="status pending">{r.status}</td>

</tr>

))}

</tbody>

</table>

</div>

)

}

export default Referrals