function add_title(){
    const year = document.getElementById("title").value;
    if (year === "0"){
        document.getElementById("new_title").classList.toggle("hidden");
    }
}
function add_year(){
    const year = document.getElementById("year").value;
    if (year === "0"){
        document.getElementById("new_year").classList.toggle("hidden");
    }
}
function add_photo(){
    const d = document.getElementById("designation").value;
    if (d === "principal" || d === "inCharge-principal"){
        document.getElementById("staff_image").classList.remove("hidden");
        document.getElementById("message").classList.remove("hidden");
    }
    else{
        document.getElementById("staff_image").classList.add("hidden");
        document.getElementById("message").classList.add("hidden");
    }
    
}
function add_designation(){
    const d = document.getElementById("designation").value;
    if(d === "new_designation"){
        document.getElementById("new_designation").classList.remove("hidden");
    }
    else{
        document.getElementById("new_designation").classList.add("hidden");
    }
}