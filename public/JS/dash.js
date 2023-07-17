// for changing currency
var cngcurr = document.getElementsByClassName("getcurr");

function btn_clicked() {
    document.getElementById("set_curr").setAttribute("value",this.textContent);
    document.getElementById("contact-form").submit();
}

for(var i=0;i<cngcurr.length;i++){
    cngcurr[i].addEventListener("click",btn_clicked);
}


