// for handling wishlist add/delete

function submitwish(e) {
    const id = this.attributes.value.value;
    document.getElementById(id).submit();
}

var wishl = document.getElementsByClassName("wishlist");
for(var i=0;i<wishl.length;i++){
    wishl[i].addEventListener("click",submitwish);
}