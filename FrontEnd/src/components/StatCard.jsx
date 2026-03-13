function StatCard({title,number,color,onClick}){

return(

<div className={`stat-card ${color}`} onClick={onClick}>

<h3>{title}</h3>

<h1>{number}</h1>

</div>

)

}

export default StatCard