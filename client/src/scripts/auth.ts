const version = localStorage.getItem("version");

if (version) {
    if (window.location.pathname === '/' || window.location.pathname === '/index') {
        if (version === "lite") {
            localStorage.setItem("version", "lite");
            window.location.href = "/lite";
        } else {
            localStorage.setItem("version", "os");
            window.location.href = "/os";
        }
    }
}
else {
    window.location.href = "/onboarding";
}