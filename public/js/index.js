let getphonenumber = document.getElementById('signinWithPhoneNumber');
var date = new Date();
var thisyear = date.getFullYear();
document.getElementById("year").innerHTML = thisyear;

getphonenumber.addEventListener('click', () => {
    location.assign('/signinwithphone')
});



