$(document).ready(function () {
   $("#signup-form").submit(function (event) {
      event.preventDefault(); // Formu özel bir şekilde gönderme işlemini engelle

      const email = $("#email").val();
      const password = $("#password").val();
      const name = $("#name").val();
      const faculty = $("#faculty").val();
      const department = $("#department").val();
      const year = $("#year").val();


      const emailPattern = /^[^@\s]+@std\.ankaramedipol\.edu\.tr$/;
      const passwordPattern = /^(?=.*[!@#$%^&*(),.?":{}|<>]).{8,20}$/;

        if (!emailPattern.test(email)) {
            alert("Lütfen sadece @std.ankaramedipol.edu.tr uzantılı bir e-posta adresi kullanın.");
            return false; // Yanlış kullanımda form iletimini durdurma
        }

        if (!passwordPattern.test(password)) {
         alert("Şifre 8-20 karakter uzunluğunda olmalı ve en az bir özel karakter içermelidir.");
         return false; // Stop form submission
     }

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
