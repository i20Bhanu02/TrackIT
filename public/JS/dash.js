// pre-selecting the search criteria in select
var opts = document.getElementsByClassName("searchcriteria");
var type = document.getElementById("searchtype").attributes.name.value;
for(var i=0;i<opts.length;i++){
    if(opts[i].attributes.value.value == type){
        opts[i].setAttribute("selected","selected");
    }
}

// for changing currency
var cngcurr = document.getElementsByClassName("getcurr");

function btn_clicked() {
    document.getElementById("set_curr").setAttribute("value",this.textContent);
    document.getElementById("cng-curr").submit();
}

for(var i=0;i<cngcurr.length;i++){
    cngcurr[i].addEventListener("click",btn_clicked);
}


var coinbtn = document.getElementsByClassName("coinbtn");

function open_coin(e){
    const id = this.attributes.name.value;

    document.getElementById("singlecoinsearchcode").setAttribute("value",id);
    document.getElementById("singlecoinsearch").submit();
}

for(var i=0;i<coinbtn.length;i++){
    coinbtn[i].addEventListener("click",open_coin);
}
