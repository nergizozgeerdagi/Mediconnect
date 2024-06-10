$(document).ready(function () {
   $("#signup-form").submit(function (event) {
      event.preventDefault(); // Formu özel bir şekilde gönderme işlemini engelle

      const email = $("#email").val();
      const password = $("#password").val();
      const name = $("#name").val();
      const faculty = $("#faculty").val();
      const department = $("#department").val();
      const year = $("#year").val();

      $.ajax({
         url: "http://127.0.0.1:3002/api/signup",
         method: "POST",
         contentType: "application/json",
         data: JSON.stringify({ email, password, name, faculty, department, year }),
         success: function (response) {
            alert(response.message);

            // Kullanıcının girişi
            $.ajax({
               url: "http://127.0.0.1:3002/api/login",
               method: "POST",
               contentType: "application/json",
               data: JSON.stringify({ email, password }),
               success: function (response) {
                  localStorage.setItem("token", response.token);
                  localStorage.setItem("user", JSON.stringify(response.user));

                  // Başarılı kayıttan sonra kanal oluşturma sayfasına yönlendir
                  window.location.href = "channel_creation.html";
               },
               error: function (jqXHR) {
                  alert(jqXHR.responseJSON.error);
               },
            });
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });
});
