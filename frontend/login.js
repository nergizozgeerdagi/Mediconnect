$(document).ready(function () {
   $("#login-form").submit(function (event) {
      event.preventDefault();

      const email = $("#email").val();
      const password = $("#password").val();

      $.ajax({
         url: "http://127.0.0.1:3002/api/login",
         method: "POST",
         contentType: "application/json",
         data: JSON.stringify({ email, password }),
         success: function (response) {
            localStorage.setItem("token", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            //   Kullanıcıyı Girişten Sonra Dashboard'a Yönlendir
            window.location.href = "dashboard.html";
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });
});
