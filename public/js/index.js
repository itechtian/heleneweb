window.document.addEventListener('DOMContentLoaded', () => {

    let getphonenumber = document.getElementById('signinWithPhoneNumber');
    let icons = document.getElementsByClassName("fa");

    var date = new Date();
    var thisyear = date.getFullYear();
    document.getElementById("year").innerHTML = thisyear;


    getphonenumber.addEventListener('click', () => {
        location.assign('/signinwithphone')
    });

})
