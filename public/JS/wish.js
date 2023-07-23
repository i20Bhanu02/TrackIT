// for handling wishlist add/delete

function submitwish(e) {
    // console.log(e.target);
    const id = this.attributes.value.value;
    document.getElementById(id).submit();
    e.stopPropagation();
}

var wishl = document.getElementsByClassName("wishlist");
for(var i=0;i<wishl.length;i++){
    wishl[i].addEventListener("click",submitwish);
}