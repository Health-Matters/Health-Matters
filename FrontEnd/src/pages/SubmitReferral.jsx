import { useState } from "react"
import { MANAGERS } from "../data"

function SubmitReferral({addReferral}){

const [form,setForm] = useState({
employee:"",
manager:"",
service:"",
reason:""
})

function handleChange(e){
setForm({...form,[e.target.name]:e.target.value})
}

function submit(){

if(!form.employee || !form.manager || !form.service) return

addReferral(form)

setForm({
employee:"",
manager:"",
service:"",
reason:""
})

}

return(

<div>

<h1 className="page-title">Create Referral</h1>

<div className="form-card">

<select name="manager" value={form.manager} onChange={handleChange}>

<option value="">Select Manager</option>

{MANAGERS.map(m => (
<option key={m.id} value={m.name}>
{m.name} ({m.team})
</option>
))}

</select>

<input
name="employee"
placeholder="Employee Name"
value={form.employee}
onChange={handleChange}
/>

<select
name="service"
value={form.service}
onChange={handleChange}
>

<option value="">Select Service</option>
<option>Mental Health</option>
<option>Physiotherapy</option>
<option>Occupational Therapy</option>

</select>

<textarea
name="reason"
placeholder="Referral Reason"
value={form.reason}
onChange={handleChange}
/>

<button className="primary-btn" onClick={submit}>

Submit Referral

</button>

</div>

</div>

)

}

export default SubmitReferral