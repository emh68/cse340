const pswdBtn = document.querySelector("#pswdBtn");
pswdBtn.addEventListener("click", function () {
    const pswdInput = document.getElementById("account_password");
    const type = pswdInput.getAttribute("type");

    if (type === "password") {
        pswdInput.setAttribute("type", "text");
        pswdBtn.innerHTML = "Hide";
    } else {
        pswdInput.setAttribute("type", "password");
        pswdBtn.innerHTML = "Show";
    }
});
