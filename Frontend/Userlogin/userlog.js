document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let user = document.getElementById("username").value;
    let pass = document.getElementById("password").value;

    const credentials = {
        "arun_cse": "password123",
        "dr_sharma": "password123",
        "dr_patel": "password123"
    };

    if (credentials[user] === pass) {
        alert("Login Successful! Welcome " + user);
    } else {
        alert("Invalid Username or Password");
    }
});
