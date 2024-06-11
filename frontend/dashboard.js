/* global $ */

// Profile Settings Menu

$(document).ready(function () {
   // Redirect to login page if user is not logged in
   if (!localStorage.getItem("token")) {
      window.location.href = "login.html";
   }
   // Load user data from local storage
   const user = JSON.parse(localStorage.getItem("user"));
   $("#profile-name").text(user.name);
   if (user.image) {
      $("#user-avatar").attr("src", user.image);
      $("#main-user-avatar").attr("src", user.image);
      $("#profile-user-avatar").attr("src", user.image);
   }

   // Profile menu transition
   $(".user-profile-icon").on("click", function () {
      const profileMenu = $("#profileMenu");
      const iconOffset = $(this).offset();
      const iconWidth = $(this).outerWidth();
      const menuWidth = profileMenu.outerWidth();

      // Check if the menu would overflow the screen and adjust its position
      const leftPosition =
         iconOffset.left + iconWidth + menuWidth > $(window).width()
            ? iconOffset.left - menuWidth
            : iconOffset.left + iconWidth;

      profileMenu
         .css({
            top: iconOffset.top + $(this).outerHeight(),
            left: leftPosition,
         })
         .toggle();
   });

   // Close the menu when clicked outside of it
   $(document).on("click", function (e) {
      if (!$(e.target).closest(".user-profile-icon").length && !$(e.target).closest("#profileMenu").length) {
         $("#profileMenu").hide();
      }
   });

   // Close the profile menu function
   function closeProfileMenu() {
      $("#profileMenu").hide();
   }

   // Add a click event to each menu item to close the profile menu
   $("#profileMenu ul li").on("click", function () {
      closeProfileMenu();
   });

   // Show the user details box
   $("#profileMenu ul li.view-profile").on("click", function (e) {
      e.preventDefault();
      // const userName = $(".profile-name").text();
      // const userEmail = $(this).data("email");
      // const userFaculty = $(this).data("faculty");
      const user = JSON.parse(localStorage.getItem("user"));
      const userName = user.name;
      const userEmail = user.email;
      const userFaculty = user.faculty;

      $("#user-name").text(userName);
      $("#user-email").text(userEmail);
      $("#user-faculty").text(userFaculty);

      $(".user-details-box").fadeIn();
   });

   $(".user-details-box .close-btn").click(function () {
      $(".user-details-box").fadeOut();
   });

   // Show the edit profile module
   $("#profileMenu ul li.edit-profile").on("click", function (e) {
      e.preventDefault();

      const user = JSON.parse(localStorage.getItem("user"));
      console.log(user);
      $("#fullName").val(user.name);
      $("#faculty").val(user.faculty);
      $("#department").val(user.department);
      $("#year").val(user.year);
      $("#bio").val(user.biography);
      $("#profile-image-input").val("");
      if (user.image) {
         $("#user-profile-image").attr("src", user.image);
      } else {
         $("#user-profile-image").attr("src", "/public/blank_user.png");
      }

      $("#editProfileOverlay").fadeIn();
      $("#editProfileModal").fadeIn();
   });

   // Hide the edit profile module
   $("#editProfileOverlay, #closeEditProfileModal, #cancelEditProfile").click(function () {
      $("#profile-image-input").val("");
      $("#editProfileOverlay").fadeOut();
      $("#editProfileModal").fadeOut();
   });

   // Show the change password module
   $("#profileMenu ul li.change-password").on("click", function (e) {
      e.preventDefault();
      $("#changePasswordOverlay").fadeIn();
      $("#changePasswordModal").fadeIn();
   });

   // Hide the change password module
   $("#changePasswordOverlay, #closeChangePasswordModal, #cancelChangePassword").click(function () {
      $("#changePasswordOverlay").fadeOut();
      $("#changePasswordModal").fadeOut();
   });

   // Show the theme settings module
   $("#profileMenu ul li.theme-settings").on("click", function (e) {
      e.preventDefault();
      $("#themeSettingsOverlay").fadeIn();
      $("#themeSettingsModal").fadeIn();
   });

   // Hide the theme settings module
   $("#themeSettingsOverlay, #closeThemeSettingsModal, #cancelThemeSettings").click(function () {
      $("#themeSettingsOverlay").fadeOut();
      $("#themeSettingsModal").fadeOut();
   });

   // Theme selection
   $(".theme-option").on("click", function () {
      $(".theme-option").removeClass("active");
      $(this).addClass("active");
   });

   // Save theme settings
   $("#saveThemeSettings").on("click", function () {
      if ($("#lightTheme").hasClass("active")) {
         applyTheme("light");
         localStorage.setItem("theme", "light");
      } else if ($("#darkTheme").hasClass("active")) {
         applyTheme("dark");
         localStorage.setItem("theme", "dark");
      }
      $("#themeSettingsOverlay").fadeOut();
      $("#themeSettingsModal").fadeOut();
   });

   // Apply theme accoding to local storage
   if (localStorage.getItem("theme") === "light") {
      applyTheme("light");
   } else if (localStorage.getItem("theme") === "dark") {
      applyTheme("dark");
   }

   function applyTheme(theme) {
      const elementsToUpdate = [
         ".chat-container",
         ".container-fluid",
         ".chat-header",
         ".message-content",
         ".message .user-name",
         ".small-modal",
         "#editProfileModal",
      ];

      elementsToUpdate.forEach((selector) => {
         if (theme === "light") {
            // Apply light theme
            $(selector).removeClass("dark-theme").addClass("light-theme");
            $(".sub-channel-options-dropdown").css("filter", "invert(0%) brightness(100%)");
            $(
               ".sidebar, .channel-list, .channel-header, .chat-header, .current-subchannel, .user-name , .profile-menu , .modal , .container"
            ).css("color", "black");
            $(".sidebar, .channel-list, .channel-header").css("background-color", "#b7d7fc");
            $(".chat-header, .current-subchannel, .user-name , .profile-menu , .modal , .container").css(
               "background-color",
               "white"
            );
         } else if (theme === "dark") {
            // Apply dark theme
            $(selector).removeClass("light-theme").addClass("dark-theme");
            $(".sub-channel-options-dropdown").css("filter", "invert(100%) brightness(200%)");
            $(
               ".sidebar, .channel-list, .channel-header, .chat-header, .current-subchannel, .user-name , .profile-menu , .modal , .container"
            ).css("color", "white");
            $(
               ".sidebar, .channel-list, .channel-header , .chat-header, .current-subchannel, .profile-menu, .modal , .container"
            ).css("background-color", "#33415e");
            // $('.message-content').css('background-color', '#757573');
         }
      });
   }

   // Get the year list for faculty for profile editing

   var yearsByFaculty = {
      "Sağlık Bilimleri Enstitüsü": ["Lisansüstü 1. Sınıf", "Lisansüstü 2. Sınıf"],
      "Sosyal Bilimler Enstitüsü": ["Lisansüstü 1. Sınıf", "Lisansüstü 2. Sınıf"],
      "Adalet Meslek Yüksekokulu": ["1. Sınıf", "2. Sınıf"],
      "Sağlık Hizmetleri Meslek Yüksekokulu": ["1. Sınıf", "2. Sınıf"],
      "Meslek Yüksekokulu": ["1. Sınıf", "2. Sınıf"],
      "Diş Hekimliği Fakültesi": ["Hazırlık Sınıfı", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf"],
      "Eczacılık Fakültesi": ["Hazırlık Sınıfı", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf"],
      "Güzel Sanatlar, Tasarım ve Mimarlık Fakültesi": [
         "Hazırlık Sınıfı",
         "1. Sınıf",
         "2. Sınıf",
         "3. Sınıf",
         "4. Sınıf",
      ],
      "Hukuk Fakültesi": ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
      "İktisadi, İdari ve Sosyal Bilimler Fakültesi": [
         "Hazırlık Sınıfı",
         "1. Sınıf",
         "2. Sınıf",
         "3. Sınıf",
         "4. Sınıf",
      ],
      "İletişim Fakültesi": ["1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
      "Sağlık Bilimleri Fakültesi": ["Hazırlık Sınıfı", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
      "Mühendislik ve Doğa Bilimleri Fakültesi": ["Hazırlık Sınıfı", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
      "Siyasal Bilgiler Fakültesi": ["Hazırlık Sınıfı", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf"],
      "Tıp Fakültesi": ["Hazırlık Sınıfı", "1. Sınıf", "2. Sınıf", "3. Sınıf", "4. Sınıf", "5. Sınıf", "6. Sınıf"],
   };

   // var facultyInput = document.getElementById("faculty");
   var yearSelect = document.getElementById("year");

   function populateYears(faculty) {
      var years = yearsByFaculty[faculty] || [];
      yearSelect.innerHTML = "";
      years.forEach(function (year) {
         var option = document.createElement("option");
         option.value = year;
         option.textContent = year;
         yearSelect.appendChild(option);
      });
   }

   // Populate the years based on the default faculty value
   const currentUser = JSON.parse(localStorage.getItem("user"));
   populateYears(currentUser.faculty);
});

// Sub-Channel Module

$(function () {
   // Show the sub-channel module and layer when clicked
   $("#sub-channel-options").click(function () {
      const subChannel = JSON.parse(localStorage.getItem("subchannel"));
      const channelId = JSON.parse(localStorage.getItem("channel"))._id;

      $("#modal-subchannel-name-text").text(subChannel.name);
      $("#subchannel-konu-text").text(subChannel.topic);
      $("#subchannel-creation-time-text").text(formatDate(subChannel.createdAt));
      $("#subchannel-name").val(subChannel.name);
      $("#subchannel-search-input-area").val("");
      if (subChannel.name === "Genel") {
         $("#subchannel-name").prop("readonly", true).addClass("readonly");
      } else {
         $("#subchannel-name").prop("readonly", false).removeClass("readonly");
      }

      // Populate the subchannel members
      $.ajax({
         url: `http://127.0.0.1:3002/api/channels/${channelId}/subchannels/${subChannel._id}/members`,
         method: "GET",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function (response) {
            $(".subchannel-user-list").empty();

            console.log(response);

            response.forEach(function (member) {
               const user = document.createElement("div");
               user.classList.add("user");

               user.innerHTML = `<img src="${
                  member.image || "/public/blank_user.png"
               }" class="user-avatar" style="margin-right: 10px;"/>
                     <div class="user-name" data-image="${member.image || "/public/blank_user.png"}" data-name="${
                  member.name
               }" data-email="${member.email}" data-faculty="${member.faculty}" data-user-id="${member._id}">${
                  member.name
               }</div>
                     <div class="user-email" data-user-id="${member._id}">${member.email}</div>`;

               $(".subchannel-user-list").append(user);
            });
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });

      $("#sub-channel-overlay").fadeIn();
      $("#sub-channel-modal").fadeIn();
   });

   // Search for members
   $("#subchannel-search-button").on("click", function () {
      const query = $("#subchannel-search-input-area").val().trim();
      const channelId = JSON.parse(localStorage.getItem("channel"))._id;
      const subChannelId = JSON.parse(localStorage.getItem("subchannel"))._id;

      if (!channelId || !subChannelId) {
         return;
      }

      $.ajax({
         url: `http://127.0.0.1:3002/api/channels/${channelId}/subchannels/${subChannelId}/members/search`,
         method: "GET",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         data: { query },
         success: function (response) {
            console.log(response);
            $(".subchannel-user-list").empty();

            response.forEach(function (member) {
               const user = document.createElement("div");
               user.classList.add("user");

               user.innerHTML = `<img src="${
                  member.image || "/public/blank_user.png"
               }" class="user-avatar" style="margin-right: 10px;"/>
                     <div class="user-name" data-image="${member.image || "/public/blank_user.png"}" data-name="${
                  member.name
               }" data-email="${member.email}" data-faculty="${member.faculty}" data-user-id="${member._id}">${
                  member.name
               }</div>
                     <div class="user-email" data-user-id="${member._id}">${member.email}</div>`;

               $(".subchannel-user-list").append(user);
            });
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   // Hide the sub-channel module and layer when clicked

   $(".close-btn, #sub-channel-overlay").click(function () {
      $("#sub-channel-overlay").fadeOut();
      $("#sub-channel-modal").fadeOut();
   });

   // Bootstrap tabs
   $("#sub-channel-option-tabs a").on("click", function (e) {
      e.preventDefault();
      $(this).tab("show");
   });

   // Add "(Default)" to the sub-channel name if it is "Genel"
   $(document).ready(function () {
      // Get the element by ID
      var subchannelNameElement = $("#modal-subchannel-name-text");

      // Check the content of the element
      if (subchannelNameElement.text().trim() === "Genel") {
         // If the content is "Genel", add "(Default)"
         subchannelNameElement.append('<span style="color: gray; font-size: 18px;"> (Default)</span>');
      }
   });

   // Click event for the "Save" button in the "Settings" tab
   $("#save-subchannel-name").click(function () {
      const updatedName = $("#subchannel-name").val();

      if (updatedName === "") {
         alert("Lütfen bir isim girin!");
         return;
      }

      const currentChannel = JSON.parse(localStorage.getItem("channel"));
      if (!currentChannel._id) return;

      const currentSubChannel = JSON.parse(localStorage.getItem("subchannel"));
      if (!currentSubChannel._id) return;

      // API call
      $.ajax({
         url: `http://127.0.0.1:3002/api/channels/${currentChannel._id}/subchannels/${currentSubChannel._id}`,
         method: "PATCH",
         contentType: "application/json",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         data: JSON.stringify({
            name: updatedName,
            topic: currentSubChannel.topic,
         }),
         success: function (response) {
            localStorage.setItem("subchannel", JSON.stringify(response));
            $(".current-subchannel-name").text(response.name);
            $("#modal-subchannel-name-text").text(response.name);

            // Update the subchannel name in the sidebar
            $(".sub-channel").each(function () {
               if ($(this).attr("data-sub-channel-id") === currentSubChannel._id) {
                  $(this).find(".sub-channel-name").text(response.name);
               }
            });

            $("#sub-channel-overlay").fadeOut();
            $("#sub-channel-modal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   // Delete SubChannel
   $("#delete-subchannel").on("click", function () {
      const currentChannel = JSON.parse(localStorage.getItem("channel"));
      if (!currentChannel._id) return;

      const currentSubChannel = JSON.parse(localStorage.getItem("subchannel"));
      if (!currentSubChannel._id) return;

      $.ajax({
         url: `http://127.0.0.1:3002/api/channels/${currentChannel._id}/subchannels/${currentSubChannel._id}`,
         method: "DELETE",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function () {
            // location.reload();

            const subChannelToOpen = $(".sub-channel").first().attr("data-sub-channel-id");
            openSubChannel(subChannelToOpen);

            // Remove the deleted subChannel from the sidebar
            $(".sub-channel").each(function () {
               if ($(this).attr("data-sub-channel-id") === currentSubChannel._id) {
                  $(this).remove();
               }
            });

            $("#sub-channel-overlay").fadeOut();
            $("#sub-channel-modal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   // Leave SubChannel
   $("#leave-subchannel").on("click", function () {
      const currentChannel = JSON.parse(localStorage.getItem("channel"));
      if (!currentChannel._id) return;

      const currentSubChannel = JSON.parse(localStorage.getItem("subchannel"));
      if (!currentSubChannel._id) return;

      $.ajax({
         url: `http://127.0.0.1:3002/api/channels/${currentChannel._id}/subchannels/${currentSubChannel._id}`,
         method: "PUT",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function () {
            // location.reload();

            const subChannelToOpen = $(".sub-channel").first().attr("data-sub-channel-id");
            openSubChannel(subChannelToOpen);

            // Remove the deleted subChannel from the sidebar
            $(".sub-channel").each(function () {
               if ($(this).attr("data-sub-channel-id") === currentSubChannel._id) {
                  $(this).remove();
               }
            });

            // Add the subChannel to the other subChannels list
            const subChannelDiv = document.createElement("div");
            subChannelDiv.setAttribute("data-other-subchannel-id", currentSubChannel._id);
            subChannelDiv.classList.add("other-channel");

            subChannelDiv.innerHTML = `<img src="/public/channel_hash.png" class="other-channel-icon" />
               <div class="other-channel-name">${currentSubChannel.name}</div>
               <input type="image" src="/public/join_button.png" class="other-channel-join" alt="Join" />`;

            $("#other-channel-collapse").append(subChannelDiv);

            $("#sub-channel-overlay").fadeOut();
            $("#sub-channel-modal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   // Join SubChannel
   $(document).on("click", ".other-channel", function () {
      const subChannelId = $(this).attr("data-other-subchannel-id");

      const currentChannel = JSON.parse(localStorage.getItem("channel"));
      if (!currentChannel._id || !subChannelId) return;

      $.ajax({
         url: `http://127.0.0.1:3002/api/join/channels/${currentChannel._id}/subchannels/${subChannelId}`,
         method: "PUT",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function (response) {
            // location.reload();

            console.log(response);

            openSubChannel(subChannelId);

            // Remove the subChannel from the other subChannels list
            $(".other-channel").each(function () {
               if ($(this).attr("data-other-subchannel-id") === subChannelId) {
                  $(this).remove();
               }
            });

            const subChannelToAdd = response.find((subChannel) => subChannel._id === subChannelId);

            // Add the subChannel to joined subChannels list
            var subChannelDiv = document.createElement("div");
            subChannelDiv.classList.add("sub-channel");
            subChannelDiv.setAttribute("data-sub-channel-id", subChannelToAdd._id);

            var subChannelImg = document.createElement("img");
            subChannelImg.classList.add("sub-channel-icon");
            subChannelImg.setAttribute("src", "/public/channel_hash.png");

            var subChannelName = document.createElement("div");
            subChannelName.classList.add("sub-channel-name");
            subChannelName.textContent = subChannelToAdd.name;

            subChannelDiv.appendChild(subChannelImg);
            subChannelDiv.appendChild(subChannelName);

            $(".sub-channels-container").append(subChannelDiv);

            $("#sub-channel-overlay").fadeOut();
            $("#sub-channel-modal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });
});

// Channel Module
$(function () {
   // Show the channel module and layer when clicked
   $("#channelName").click(function () {
      const channel = JSON.parse(localStorage.getItem("channel"));

      $("#modal-channel-name-text strong").text(channel.name);
      $("#channel-description-text").text(channel.description);
      $("#channel-creation-time-text").text(formatDate(channel.createdAt));
      $("#channel-name-editor").val(channel.name);
      $("#channel-image-input").val("");
      $(".channel-image").attr("src", channel.image || "/public/blank_channel.png");
      $("#channel-search-input-area").val("");

      $("#channel-overlay").fadeIn();
      $("#channel-modal").fadeIn();

      // Fetch all users not in the channel
      $.ajax({
         url: `http://127.0.0.1:3002/api/get-all-users-not-member/${channel._id}`,
         method: "GET",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function (response) {
            $(".channel-invitation-user-list").empty();

            const userList = response;
            userList.forEach(function (user) {
               const outerDiv = document.createElement("div");
               outerDiv.classList.add("user", "channel-davet-user");
               outerDiv.setAttribute("data-user-id", user.id);

               const userImg = document.createElement("img");
               userImg.classList.add("user-avatar");
               userImg.setAttribute("src", user.image || "/public/blank_user.png");
               outerDiv.appendChild(userImg);

               const userInfo = document.createElement("div");
               userInfo.classList.add("user-info");
               outerDiv.appendChild(userInfo);

               const userName = document.createElement("div");
               userName.classList.add("user-name");
               userName.setAttribute("data-image", user.image || "/public/blank_user.png");
               userName.setAttribute("data-email", user.email);
               userName.setAttribute("data-faculty", user.faculty);
               userName.textContent = user.name;
               userInfo.appendChild(userName);

               const userEmail = document.createElement("div");
               userEmail.classList.add("user-email");
               userEmail.textContent = user.email;
               userInfo.appendChild(userEmail);

               $(".channel-invitation-user-list").append(outerDiv);
            });
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });

      // Populate the subchannel members
      $.ajax({
         url: `http://127.0.0.1:3002/api/channels/${channel._id}/members`,
         method: "GET",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function (response) {
            $(".channel-user-list").empty();

            response.forEach(function (member) {
               const user = document.createElement("div");
               user.classList.add("user");

               user.innerHTML = `<img src="${
                  member.image || "/public/blank_user.png"
               }" class="user-avatar" style="margin-right: 10px;"/>
                     <div class="user-name channel-uye channel-owner" data-image="${
                        member.image || "/public/blank_user.png"
                     }" data-name="${member.name}" data-email="${member.email}" data-faculty="${
                  member.faculty
               }" data-user-id="${member._id}">${member.name}</div>
                     <div class="user-email" data-user-id="${member._id}">${member.email}</div>`;

               $(".channel-user-list").append(user);
            });
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });

      // search for Channel members
      $("#channel-search-button").on("click", function () {
         const query = $("#channel-search-input-area").val().trim();
         const channelId = JSON.parse(localStorage.getItem("channel"))._id;

         if (!channelId) return;

         $.ajax({
            url: `http://127.0.0.1:3002/api/channels/${channelId}/members/search`,
            method: "GET",
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            data: { query },
            success: function (response) {
               $(".channel-user-list").empty();

               response.forEach(function (member) {
                  const user = document.createElement("div");
                  user.classList.add("user");

                  user.innerHTML = `<img src="${
                     member.image || "/public/blank_user.png"
                  }" class="user-avatar" style="margin-right: 10px;"/>
                     <div class="user-name channel-uye channel-owner" data-image="${
                        member.image || "/public/blank_user.png"
                     }" data-name="${member.name}" data-email="${member.email}" data-faculty="${
                     member.faculty
                  }" data-user-id="${member._id}">${member.name}</div>
                     <div class="user-email" data-user-id="${member._id}">${member.email}</div>`;

                  $(".channel-user-list").append(user);
               });
            },
            error: function (jqXHR) {
               alert(jqXHR.responseJSON.error);
            },
         });
      });
   });

   // Hide the channel module and layer when clicked
   $(".close-btn, #channel-overlay").click(function () {
      $("#channel-overlay").fadeOut();
      $("#channel-modal").fadeOut();
   });

   // Bootstrap tabs
   $("#channel-option-tabs a").on("click", function (e) {
      e.preventDefault();
      $(this).tab("show");
   });

   // Add a user to the selected users list
   function selectUser(name, id) {
      // check if the user is already in the list
      $("#channel-selected-users .user-box").each(function () {
         const userId = $(this).attr("data-user-id");
         if (userId === id) {
            $(this).remove();
         }
      });

      const userBox = $("<span>").addClass("user-box").text(name).attr("data-user-id", id);
      const removeBtn = $("<span>")
         .addClass("remove-user")
         .html("&times;")
         .click(function () {
            userBox.remove();
         });

      userBox.append(removeBtn);
      $("#channel-selected-users").append(userBox);

      // Clear the search input
      $("#channel-search-input").val("");
   }

   // Add users to the search result area
   $(document).on("click", "#channel-davet .channel-davet-user", function () {
      const name = $(this).find(".user-name").text();
      const id = $(this).data("user-id");
      selectUser(name, id);
   });

   // Add a channel owner indicator to the user names in the "Members" tab
   $(".channel-user-list .user-name.channel-owner").each(function () {
      $(this).append('<span class="owner-indicator"> (Kanal Sahibi)</span>');
   });

   // Handle the click event for the "Save" button in the "Invite" tab
   $("#save-channel-invite").click(function () {
      const selectedUsers = [];
      $("#channel-selected-users .user-box").each(function () {
         const userId = $(this).attr("data-user-id");
         selectedUsers.push(userId);
      });

      // Simulate sending the data to the backend
      const channel = JSON.parse(localStorage.getItem("channel"));
      if (!channel._id) return;

      $.ajax({
         url: `http://127.0.0.1:3002/api/channels/${channel._id}/invite`,
         method: "POST",
         contentType: "application/json",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         data: JSON.stringify({ usersToInvite: selectedUsers }),
         success: function (response) {
            alert(response.message);

            $("#channel-selected-users").empty();
            $("#channel-overlay").fadeOut();
            $("#channel-modal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   $(".channel-cancel-button").click(function () {
      $("#channel-overlay").fadeOut();
      $("#channel-modal").fadeOut();
   });

   // Click event for the "Save" button in the "Create" tab
   $("#create-subchannel-button").click(function () {
      const subchannelName = $("#subchannel-name-input").val();
      const subchannelTopic = $("#subchannel-topic-input").val();

      if (!subchannelName || !subchannelTopic) {
         alert("Alt Kanal İsmi ya da Konu Boş Bırakılamaz!");
         return;
      }

      const currentChannel = JSON.parse(localStorage.getItem("channel"));
      if (!currentChannel._id) return;

      // Create SubChannel
      $.ajax({
         url: `http://127.0.0.1:3002/api/channels/${currentChannel._id}/subchannels/create`,
         method: "POST",
         contentType: "application/json",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         data: JSON.stringify({ name: subchannelName, topic: subchannelTopic }),
         success: function (response) {
            // location.reload();

            // Add new subChannel to the sidebar

            var subChannelDiv = document.createElement("div");
            subChannelDiv.classList.add("sub-channel");
            subChannelDiv.setAttribute("data-sub-channel-id", response._id);

            var subChannelImg = document.createElement("img");
            subChannelImg.classList.add("sub-channel-icon");
            subChannelImg.setAttribute("src", "/public/channel_hash.png");

            var subChannelName = document.createElement("div");
            subChannelName.classList.add("sub-channel-name");
            subChannelName.textContent = response.name;

            subChannelDiv.appendChild(subChannelImg);
            subChannelDiv.appendChild(subChannelName);

            $(".sub-channels-container").append(subChannelDiv);

            $("#subchannel-name-input").val("");
            $("#subchannel-topic-input").val("");
            $("#channel-overlay").fadeOut();
            $("#channel-modal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   // Click event for the "Cancel" button in the "Create" tab
   $("#cancel-subchannel-creation-button").click(function () {
      $("#create-channel-overlay").fadeOut();
      $("#create-channel-modal").fadeOut();
   });

   $(document).ready(function () {
      // Handle the click event for the "Public" tab
      $("#channel-public-setting-button").click(function () {
         $(this).addClass("active").html("Herkese Açık &#10004;");
         $("#channel-inviteonly-setting-button").removeClass("active").html("Davet");
      });

      $("#channel-inviteonly-setting-button").click(function () {
         $(this).addClass("active").html("Davet &#10004;");
         $("#channel-public-setting-button").removeClass("active").html("Herkese Açık");
      });

      // Click event for the "Upload Image" button
      $("#upload-channel-image-button").click(function () {
         console.log("Image uploading...");
         // Image uploading functionality here
      });

      // Click event for the "Delete Image" button
      $("#delete-channel-image-button").click(function () {
         console.log("Image deleting...");
         // Image deleting functionality here
      });

      // Click event for the "Delete Channel" button
      $("#delete-channel").click(function () {
         const currentChannel = JSON.parse(localStorage.getItem("channel"));
         if (!currentChannel._id) return;

         $.ajax({
            url: `http://127.0.0.1:3002/api/channel/${currentChannel._id}`,
            method: "DELETE",
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            success: function () {
               // location.reload();
               fetchAllUserChannels();
               $("#channel-overlay").fadeOut();
               $("#channel-modal").fadeOut();
            },
            error: function (jqXHR) {
               alert(jqXHR.responseJSON.error);
            },
         });
      });

      // Click event for the "Leave Channel" button
      $("#leave-channel").click(function () {
         const currentChannel = JSON.parse(localStorage.getItem("channel"));
         if (!currentChannel._id) return;

         $.ajax({
            url: `http://127.0.0.1:3002/api/leave-channel/${currentChannel._id}`,
            method: "PATCH",
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            success: function () {
               fetchAllUserChannels();
               // location.reload();
               $("#channel-overlay").fadeOut();
               $("#channel-modal").fadeOut();
            },
            error: function (jqXHR) {
               alert(jqXHR.responseJSON.error);
            },
         });
      });

      // Click event for the "Cancel" button in the "Settings" tab
      $("#cancel-channel-settings").click(function () {
         $("#channe-overlay").fadeOut();
         $("#channe-modal").fadeOut();
      });

      // Click event for the "Save" button in the "Settings" tab
      $("#save-channel-settings").click(function () {
         const channelName = $("#channel-name-editor").val();
         // const isPublic = $("#channel-public-setting-button").hasClass("active");

         if (channelName === "") {
            alert("Kanal İsmi Boş Olamaz!");
            return;
         }

         const currentChannel = JSON.parse(localStorage.getItem("channel"));
         if (!currentChannel._id) return;

         // Add API call for channel settings update
         $.ajax({
            url: `http://127.0.0.1:3002/api/channel-name/${currentChannel._id}`,
            method: "PATCH",
            contentType: "application/json",
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            data: JSON.stringify({
               name: channelName,
               // isPublic: isPublic,
            }),
            success: function (response) {
               localStorage.setItem("channel", JSON.stringify(response));
               $("#channelName").text(response.name);
               $("#channel-overlay").fadeOut();
               $("#channel-modal").fadeOut();
            },
            error: function (jqXHR) {
               alert(jqXHR.responseJSON.error);
            },
         });
      });

      // ========== Channel Image Upload ==========
      // Preview the selected image
      $("#channel-image-input").on("change", function (event) {
         var input = event.target;
         if (input.files && input.files[0]) {
            var reader = new FileReader();
            reader.onload = function (e) {
               $(".channel-image").attr("src", e.target.result);
            };
            reader.readAsDataURL(input.files[0]);
         }
      });
      // Upload image
      $("#upload-channel-image-button").on("click", function () {
         var fileInput = $("#channel-image-input")[0];
         if (fileInput.files && fileInput.files[0]) {
            var formData = new FormData();
            formData.append("image", fileInput.files[0]);

            const currentChannel = JSON.parse(localStorage.getItem("channel"));
            if (!currentChannel._id) return;

            $.ajax({
               url: `http://127.0.0.1:3002/api/channel/${currentChannel._id}/image`,
               method: "PATCH",
               data: formData,
               headers: { Authorization: "Bearer " + localStorage.getItem("token") },
               processData: false,
               contentType: false,
               success: function (response) {
                  localStorage.setItem("channel", JSON.stringify(response));

                  // Update the channel image in the sidebar
                  $(".sidebar-channel-icon").each(function () {
                     if ($(this).attr("data-channel-id") === currentChannel._id) {
                        $(this).attr("src", response.image || "/public/blank_channel.png");
                     }
                  });

                  $("#channel-overlay").fadeOut();
                  $("#channel-modal").fadeOut();
               },
               error: function (jqXHR) {
                  alert(jqXHR.responseJSON.error);
               },
            });
         } else {
            alert("Lütfen Önce Bir Resim Seçin");
         }
      });
      // Delete image
      $("#delete-channel-image-button").on("click", function () {
         const currentChannel = JSON.parse(localStorage.getItem("channel"));
         if (!currentChannel._id) return;

         $.ajax({
            url: `http://127.0.0.1:3002/api/channel/${currentChannel._id}/image`,
            method: "DELETE",
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            success: function (response) {
               localStorage.setItem("channel", JSON.stringify(response));

               $(".channel-image").attr("src", "/public/blank_channel.png");

               // Update the channel image in the sidebar
               $(".sidebar-channel-icon").each(function () {
                  if ($(this).attr("data-channel-id") === currentChannel._id) {
                     $(this).attr("src", "/public/blank_channel.png");
                  }
               });

               $("#channel-overlay").fadeOut();
               $("#channel-modal").fadeOut();
            },
            error: function (jqXHR) {
               alert(jqXHR.responseJSON.error);
            },
         });
      });
   });
});

// Channel Creation Module

$(function () {
   // Click event for the "Create Channel" button
   $("#create-channel-modal-button").click(function () {
      // Fetch channels where user is not member or owner
      $.ajax({
         url: "http://127.0.0.1:3002/api/get-all-channels-not-member",
         method: "GET",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function (response) {
            // Populate the channel list with the response data
            $("#channel-list").empty();
            const defaultOption = $("<option></option>")
               .attr("value", "")
               .attr("disabled", "true")
               .attr("selected", "true")
               .text("Kanal Seçiniz");
            $("#channel-list").append(defaultOption);

            const channelList = response;
            channelList.forEach(function (channel) {
               const option = $("<option></option>").attr("value", channel._id).text(channel.name);
               $("#channel-list").append(option);
            });
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });

      $("#create-channel-overlay").fadeIn();
      $("#create-channel-modal").fadeIn();
   });

   // Click event for the "Close" button or the overlay
   $("#create-channel-overlay, .close-btn").click(function () {
      $("#create-channel-overlay").fadeOut();
      $("#create-channel-modal").fadeOut();
   });

   // Click event for the "Create" tab
   $("#create-tab").click(function () {
      $("#modal-description").text(
         "Kanallar, kullanıcıların iletişim kurabileceği ve birlikte çalışabileceği alt kanallardan oluşur. Hali hazırda ismi alınmamış bir kanal oluşturabilirsiniz."
      );
      $("#create-tab").addClass("active");
      $("#join-tab").removeClass("active");
      $("#create-content").show();
      $("#join-content").hide();
   });

   $("#join-tab").click(function () {
      $("#modal-description").text(
         "Bölümler haricinde herkese açık olan kanal listesine aşağıdan ulaşabilir ve istediğiniz kanala katılabilirsiniz."
      );
      $("#join-tab").addClass("active");
      $("#create-tab").removeClass("active");
      $("#join-content").show();
      $("#create-content").hide();
   });

   // Click event for the "Create" button
   $("#create-channel-button").click(function () {
      const channelName = $("#create-channel-name").val();

      if (channelName === "") {
         alert("Lütfen kanal için bir isim girin!");
         return; // If empty, prevent further code execution
      }

      $.ajax({
         url: "http://127.0.0.1:3002/api/channel",
         method: "POST",
         contentType: "application/json",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         data: JSON.stringify({ name: channelName }),
         success: function (response) {
            // location.reload();

            // Add the new channels to the sidebar
            var channelItem = document.createElement("img");
            channelItem.classList.add("sidebar-channel-icon");
            channelItem.setAttribute("data-channel-id", response._id);
            channelItem.src = response.image || "/public/blank_channel.png";

            $("#sidebar-content").append(channelItem);

            // Open the  channel
            openChannel(response._id);

            $("#create-channel-name").val("");
            $("#create-channel-overlay").fadeOut();
            $("#create-channel-modal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   // Click event for the "Join" button
   $("#join-channel-button").click(function () {
      const selectedChannel = $("#channel-list").val();

      $.ajax({
         url: "http://127.0.0.1:3002/api/join-channel",
         method: "PATCH",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         data: { id: selectedChannel },
         success: function (response) {
            // fetchAllUserChannels();
            // location.reload();

            // Add the new channels to the sidebar
            var channelItem = document.createElement("img");
            channelItem.classList.add("sidebar-channel-icon");
            channelItem.setAttribute("data-channel-id", response._id);
            channelItem.src = response.image || "/public/blank_channel.png";

            $("#sidebar-content").append(channelItem);

            // Open the  channel
            openChannel(response._id);

            $("#create-channel-overlay").fadeOut();
            $("#create-channel-modal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });
});

// Channel Invitation Module

function fetchAllInvitations() {
   $.ajax({
      url: "http://127.0.0.1:3002/api/invites",
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      success: function (response) {
         // Populate the invite list with the response data

         $(".invitation-list").empty();
         const inviteList = response;
         inviteList.forEach(function (invite) {
            const outerDiv = document.createElement("div");
            outerDiv.classList.add("invitation");

            const inviteImg = document.createElement("img");
            inviteImg.classList.add("channel-icon");
            inviteImg.setAttribute("src", invite.Channel.image || "/public/blank_channel.png");
            outerDiv.appendChild(inviteImg);

            const invitationInfo = document.createElement("div");
            invitationInfo.classList.add("invitation-info");
            outerDiv.appendChild(invitationInfo);

            const inviteName = document.createElement("div");
            inviteName.classList.add("channel-name");
            inviteName.innerText = invite.Channel.name;
            invitationInfo.appendChild(inviteName);

            const invitationActions = document.createElement("div");
            invitationActions.classList.add("invitation-actions");
            invitationInfo.appendChild(invitationActions);

            const acceptBtn = document.createElement("button");
            acceptBtn.setAttribute("data-invite-id", invite.id);
            acceptBtn.classList.add("btn", "btn-success", "accept-btn");
            acceptBtn.innerHTML = "&#10004;";
            invitationActions.appendChild(acceptBtn);

            const verticalLine = document.createElement("div");
            verticalLine.classList.add("vertical-line");
            invitationActions.appendChild(verticalLine);

            const declineBtn = document.createElement("button");
            declineBtn.setAttribute("data-invite-id", invite.id);
            declineBtn.classList.add("btn", "btn-danger", "decline-btn");
            declineBtn.innerHTML = "&#10008;";
            invitationActions.appendChild(declineBtn);

            $(".invitation-list").append(outerDiv);
         });
      },
      error: function (jqXHR) {
         alert(jqXHR.responseJSON.error);
      },
   });
}

$(function () {
   // Click event for the "Invite" button
   $(".invitation-button").click(function () {
      // Fetch All Invites
      fetchAllInvitations();

      $("#invitation-overlay").fadeIn();
      $("#invitation-modal").fadeIn();
   });

   // Click event for the "Close" button or the overlay
   $("#invitation-overlay, .close-btn").click(function () {
      $("#invitation-overlay").fadeOut();
      $("#invitation-modal").fadeOut();
   });

   // Handle Accept Invite
   $(document).on("click", ".accept-btn", function () {
      const inviteId = $(this).attr("data-invite-id");

      // Add API call for accepting invitation
      $.ajax({
         url: `http://127.0.0.1:3002/api/invites/${inviteId}/accept`,
         method: "POST",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function () {
            fetchAllInvitations();
            fetchAllUserChannels();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   // Handle Decline Invite
   $(document).on("click", ".decline-btn", function () {
      const inviteId = $(this).attr("data-invite-id");

      // Add API call for declining invitation
      $.ajax({
         url: `http://127.0.0.1:3002/api/invites/${inviteId}/reject`,
         method: "POST",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function () {
            fetchAllInvitations();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });
});

// User Details Module

// Function to open the user modal
function openUserModal(image, userName, userEmail, userFaculty) {
   $("#user-avatar").attr("src", image || "/public/blank_user.png");
   $("#user-name").text(userName);
   $("#user-email").text(userEmail);
   $("#user-faculty").text(userFaculty);

   $(".user-details-box").fadeIn();
}

// Function to wrap the channel name text if it exceeds the maximum length

const channelNameElement = document.getElementById("channelName");
// eslint-disable-next-line no-unused-vars
const channelHeaderElement = document.querySelector(".channel-header");
const maxLength = 20; // Text length for channel name
const minLength = 30; // Text length for channel name

// Add margin-left if text exceeds maximum length
function adjustText() {
   let text = channelNameElement.innerText;

   if (text.length > maxLength) {
      // Find the last space within the maximum length
      let wrapIndex = text.lastIndexOf(" ", maxLength);
      if (wrapIndex === -1) {
         wrapIndex = maxLength;
      }

      // Wrap the text with a line break
      let wrappedText = text.slice(0, wrapIndex) + "<br>" + text.slice(wrapIndex + 1);
      channelNameElement.innerHTML = wrappedText;
   }
   if (text.length < minLength) {
      // Add margin-top if text length is less than maxLength
      channelNameElement.style.marginTop = "10px";
   }
}

adjustText();

// ---------------------------------------------------------------

// Message Input and Listing

// Add event listeners to user name elements
function attachUserNameClickListeners() {
   $(document).on("click", ".user-name", function () {
      const userName = this.textContent;
      const image = this.getAttribute("data-image");
      const userEmail = this.getAttribute("data-email");
      const userFaculty = this.getAttribute("data-faculty");
      openUserModal(image, userName, userEmail, userFaculty);
   });

   // const userNameElements = document.querySelectorAll(".user-name");
   // userNameElements.forEach((userNameElement) => {
   //    userNameElement.addEventListener("click", function () {
   //       const userName = this.textContent;
   //       const image = this.getAttribute("data-image");
   //       const userEmail = this.getAttribute("data-email");
   //       const userFaculty = this.getAttribute("data-faculty");
   //       openUserModal(image, userName, userEmail, userFaculty);
   //    });
   // });
}

// Scrolling chat messages container to the bottom
function scrollToBottom() {
   const chatMessagesContainer = document.querySelector(".chat-messages-container");
   chatMessagesContainer.scrollTop = chatMessagesContainer.scrollHeight;
}

function addNewMessage({
   _id,
   message = "",
   attachment = null,
   image = null,
   userName,
   userAvatar,
   messageTime,
   userEmail,
   userFaculty,
}) {
   const chatMessages = document.querySelector(".chat-messages");

   // Only add message if it don't have the same id as any other existing messages
   if (chatMessages.querySelector(`[data-message-id="${_id}"]`)) {
      return;
   }

   const newMessage = document.createElement("div");
   newMessage.classList.add("chat-message");
   newMessage.setAttribute("data-message-id", _id);
   if (message) {
      newMessage.innerHTML = `
         <div class="message">
            <img src="${userAvatar}" class="user-avatar" />
            <div class="user-name" data-user-id="new_user_id" data-image="${userAvatar}" data-email="${userEmail}" data-faculty="${userFaculty}">${userName}</div>
            <div class="message-time" data-message-creation-time="new_message_time">${messageTime}</div>
         </div>
         <div class="message-content">${message}</div>`;
   } else if (image) {
      newMessage.innerHTML = `
         <div class="message">
            <img src="${userAvatar}" class="user-avatar" />
            <div class="user-name" data-user-id="new_user_id" data-image="${userAvatar}" data-email="${userEmail}" data-faculty="${userFaculty}">${userName}</div>
            <div class="message-time" data-message-creation-time="new_message_time">${messageTime}</div>
         </div>
         <div class="message-content"><img src="${image}" alt="Image"></div>`;
   } else if (attachment) {
      newMessage.innerHTML = `
         <div class="message">
            <img src="${userAvatar}" class="user-avatar" />
            <div class="user-name" data-user-id="new_user_id" data-image="${userAvatar}" data-email="${userEmail}" data-faculty="${userFaculty}">${userName}</div>
            <div class="message-time" data-message-creation-time="new_message_time">${messageTime}</div>
         </div>
         <div class="message-content attachment"><p>Sent an attachment<a href="${attachment}" download target="_blank"><img src="/public/download-icon.png"/></a></p></div>`;
   }

   chatMessages.appendChild(newMessage);
   scrollToBottom();
   attachUserNameClickListeners(); // Re-attach user name click listeners after new messages are added
}

// Startup setup
$(document).ready(function () {
   scrollToBottom();
   attachUserNameClickListeners();
});

// jQuery for managing the user details box
$(function () {
   // Click event for the "Close" button in the user details box
   $(".user-details-box .close-btn").click(function () {
      $(".user-details-box").fadeOut();
   });
});

// Image select for message
$("#image-attachment-input").change(function () {
   var file = this.files[0];
   if (file) {
      var reader = new FileReader();
      reader.onload = function (e) {
         $("#user-profile-image").attr("src", e.target.result);
      };
      reader.readAsDataURL(file);
   }
});

// Send Image when uploaded
$("#image-attachment-input").on("change", function (event) {
   const input = event.target;

   const currentChannel = JSON.parse(localStorage.getItem("channel"));
   const currentSubChannel = JSON.parse(localStorage.getItem("subchannel"));

   if (!currentChannel._id || !currentSubChannel._id) return;

   if (input.files && input.files[0]) {
      const formData = new FormData();
      formData.append("image", input.files[0]);

      $.ajax({
         url: `http://127.0.0.1:3002/api/message/image/channel/${currentChannel._id}/subchannel/${currentSubChannel._id}`,
         method: "POST",
         data: formData,
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         processData: false,
         contentType: false,
         success: function (response) {
            addNewMessage({
               _id: response.id,
               image: response.image,
               userName: response.userDetails.name,
               userAvatar: response.userDetails.image || "/public/blank_user.png",
               messageTime: formatDateTime(response.timestamp),
               userEmail: response.userDetails.email,
               userFaculty: response.userDetails.faculty,
            });

            $("#image-attachment-input").val("");
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   }
});

// Send File when uploaded
$("#file-attachment-input").on("change", function (event) {
   const input = event.target;

   const currentChannel = JSON.parse(localStorage.getItem("channel"));
   const currentSubChannel = JSON.parse(localStorage.getItem("subchannel"));
   if (!currentChannel._id || !currentSubChannel._id) return;

   if (input.files && input.files[0]) {
      const formData = new FormData();
      formData.append("file", input.files[0]);

      $.ajax({
         url: `http://127.0.0.1:3002/api/message/file/channel/${currentChannel._id}/subchannel/${currentSubChannel._id}`,
         method: "POST",
         data: formData,
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         processData: false,
         contentType: false,
         success: function (response) {
            addNewMessage({
               _id: response.id,
               attachment: response.attachment,
               userName: response.userDetails.name,
               userAvatar: response.userDetails.image || "/public/blank_user.png",
               messageTime: formatDateTime(response.timestamp),
               userEmail: response.userDetails.email,
               userFaculty: response.userDetails.faculty,
            });

            $("#file-attachment-input").val("");
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   }
});

// Send message function
function sendMessage() {
   const messageText = document.getElementById("message-input-area").value.trim();

   if (messageText === "") return;

   const currentChannel = JSON.parse(localStorage.getItem("channel"));
   const currentSubChannel = JSON.parse(localStorage.getItem("subchannel"));
   if (!currentChannel._id || !currentSubChannel._id) return;

   $.ajax({
      url: "http://127.0.0.1:3002/api/message",
      method: "POST",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      data: JSON.stringify({
         channelId: currentChannel._id,
         subChannelId: currentSubChannel._id,
         message: messageText,
      }),
      success: function (response) {
         addNewMessage({
            _id: response.id,
            message: response.message,
            userName: response.userDetails.name,
            userAvatar: response.userDetails.image || "/public/blank_user.png",
            messageTime: formatDateTime(response.timestamp),
            userEmail: response.userDetails.email,
            userFaculty: response.userDetails.faculty,
         });

         $("#message-input-area").val("");
      },
      error: function (jqXHR) {
         alert(jqXHR.responseJSON.error);
      },
   });

   // addNewMessage(
   //    messageContent,
   //    "New User",
   //    "/public/blank_user.png",
   //    new Date().toLocaleTimeString(),
   //    "newuser@example.com",
   //    "Faculty of Example"
   // );
}

// Message input area event listener for Enter and Shift+Enter
document.getElementById("message-input-area").addEventListener("keydown", function (event) {
   if (event.key === "Enter") {
      if (event.shiftKey) {
         // Allow Shift+Enter to add a new line
         event.preventDefault();
         const cursorPos = this.selectionStart;
         const textBeforeCursor = this.value.substring(0, cursorPos);
         const textAfterCursor = this.value.substring(cursorPos);
         this.value = textBeforeCursor + "\n" + textAfterCursor;
         this.selectionStart = cursorPos + 1;
         this.selectionEnd = cursorPos + 1;
      } else {
         // Send message when Enter is pressed
         event.preventDefault();
         sendMessage();
      }
   }
});

// Add new message example
document.getElementById("sendbutton").addEventListener("click", function () {
   sendMessage();
});

// Channel Description Editing

document.getElementById("channel-description-edit-button").addEventListener("click", function () {
   var descriptionText = document.getElementById("channel-description-text");
   var descriptionInput = document.getElementById("channel-description-input");
   var saveButton = document.getElementById("channel-description-save-button");

   // Hide the text and show the textarea
   descriptionText.style.display = "none";
   descriptionInput.style.display = "block";
   descriptionInput.value = descriptionText.innerText;

   // Show the save button
   saveButton.style.display = "block";
});

// Edit channel description
$("#channel-description-save-button").on("click", function () {
   const currentChannel = JSON.parse(localStorage.getItem("channel"));

   // API call
   $.ajax({
      url: `http://127.0.0.1:3002/api/channel-description/${currentChannel._id}`,
      method: "PATCH",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      data: JSON.stringify({
         description: $("#channel-description-input").val(),
      }),
      success: function (response) {
         localStorage.setItem("channel", JSON.stringify(response));
         $("#channel-description-text").text(response.description);
      },
      error: function (jqXHR) {
         alert(jqXHR.responseJSON.error);
      },
   });

   $("#channel-description-text").show();
   $("#channel-description-input").hide();
   $("#channel-description-save-button").hide();

   $("#channel-description-input").hide();
   $("#channel-description-save-button").hide();
});

// Subchannel Konu Editing
document.getElementById("subchannel-konu-edit-button").addEventListener("click", function () {
   var konuText = document.getElementById("subchannel-konu-text");
   var konuInput = document.getElementById("subchannel-konu-input");
   var subchannelSaveButton = document.getElementById("subchannel-konu-save-button");

   konuInput.value = konuText.innerText;
   konuText.style.display = "none";
   konuInput.style.display = "block";
   subchannelSaveButton.style.display = "block";
});

// Edit subchannel topic
document.getElementById("subchannel-konu-save-button").addEventListener("click", function () {
   const currentChannel = JSON.parse(localStorage.getItem("channel"));
   if (!currentChannel._id) return;

   const currentSubChannel = JSON.parse(localStorage.getItem("subchannel"));
   if (!currentSubChannel._id) return;

   // API call
   $.ajax({
      url: `http://127.0.0.1:3002/api/channels/${currentChannel._id}/subchannels/${currentSubChannel._id}`,
      method: "PATCH",
      contentType: "application/json",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      data: JSON.stringify({
         name: currentSubChannel.name,
         topic: $("#subchannel-konu-input").val(),
      }),
      success: function (response) {
         localStorage.setItem("subchannel", JSON.stringify(response));
         $("#subchannel-konu-text").text(response.topic);
         $(".chat-description span").text(response.topic);
      },
      error: function (jqXHR) {
         alert(jqXHR.responseJSON.error);
      },
   });

   $("#subchannel-konu-text").show();
   $("#subchannel-konu-input").hide();
   $("#subchannel-konu-save-button").hide();

   $("#subchannel-konu-input").hide();
   $("#subchannel-konu-save-button").hide();
});

// ----------------------- APIs Integration ------------------------------

// Fetch all owned or member channels
function fetchAllUserChannels() {
   $.ajax({
      url: "http://127.0.0.1:3002/api/channel",
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      success: function (response) {
         // Add the channels to the sidebar
         $("#sidebar-content").empty();
         response.forEach(function (channel) {
            var channelItem = document.createElement("img");
            channelItem.classList.add("sidebar-channel-icon");
            channelItem.setAttribute("data-channel-id", channel._id);
            channelItem.src = channel.image || "/public/blank_channel.png";

            $("#sidebar-content").append(channelItem);
         });

         // Open the first channel by default
         const channelToOpen = response[0];
         openChannel(channelToOpen._id);
      },
      error: function (jqXHR) {
         alert(jqXHR.responseJSON.error);
      },
   });
}

// Fetch all messages in the current subChannel
function fetchAllMessages(subChannelId) {
   const currentChannel = JSON.parse(localStorage.getItem("channel"));
   if (!currentChannel._id) return;

   if (!subChannelId) return;

   $.ajax({
      url: `http://127.0.0.1:3002/api/channels/${currentChannel._id}/subchannels/${subChannelId}/messages`,
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      success: function (response) {
         // Add the messages to the chat

         response.forEach(function (message) {
            addNewMessage({
               _id: message.id,
               message: message.message,
               attachment: message.attachment,
               image: message.image,
               userName: message.userDetails.name,
               userAvatar: message.userDetails.image || "/public/blank_user.png",
               messageTime: formatDateTime(message.timestamp),
               userEmail: message.userDetails.email,
               userFaculty: message.userDetails.faculty,
            });
         });
      },
      error: function (jqXHR) {
         alert(jqXHR.responseJSON.error);
      },
   });
}

let pollingInterval = null;

// Function to start polling
function startMessagesPolling(subChannelId, interval = 5000) {
   if (!subChannelId) return;

   // Clear any existing polling intervals
   if (pollingInterval) {
      clearInterval(pollingInterval);
   }

   // Initial call to fetch messages
   fetchAllMessages(subChannelId);

   // Set up polling
   pollingInterval = setInterval(function () {
      fetchAllMessages(subChannelId);
   }, interval);
}

$(document).ready(function () {
   // Change Password API
   $("#saveChangePassword").click(function () {
      const newPassword = $("#newPassword").val();
      const confirmPassword = $("#confirmPassword").val();

      if (!newPassword || !confirmPassword) {
         return;
      }

      if (newPassword !== confirmPassword) {
         alert("Şifreler Eşleşmiyor!");
         return;
      }

      $.ajax({
         url: "http://127.0.0.1:3002/api/password",
         method: "PATCH",
         contentType: "application/json",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         data: JSON.stringify({ newPassword }),
         success: function () {
            alert("Şifre Başarıyla Değiştirildi!");
            $("#newPassword").val("");
            $("#confirmPassword").val("");
            $("#changePasswordOverlay").fadeOut();
            $("#changePasswordModal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   // Edit Profile API
   $("#saveEditProfile").click(function () {
      const name = $("#fullName").val();
      const year = $("#year").val();
      const biography = $("#bio").val();

      $.ajax({
         url: "http://127.0.0.1:3002/api/profile/details",
         method: "PATCH",
         contentType: "application/json",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         data: JSON.stringify({ name, year, biography }),
         success: function (response) {
            localStorage.setItem("user", JSON.stringify(response));
            alert("Profil Başarıyla Güncellendi!");

            $("#editProfileOverlay").fadeOut();
            $("#editProfileModal").fadeOut();
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });
   // ========== Profile Image Upload ==========
   // Preview the selected image
   $("#profile-image-input").on("change", function (event) {
      var input = event.target;
      if (input.files && input.files[0]) {
         var reader = new FileReader();
         reader.onload = function (e) {
            $("#user-profile-image").attr("src", e.target.result);
         };
         reader.readAsDataURL(input.files[0]);
      }
   });
   // Upload image
   $("#upload-profile-image").on("click", function () {
      var fileInput = $("#profile-image-input")[0];
      if (fileInput.files && fileInput.files[0]) {
         var formData = new FormData();
         formData.append("image", fileInput.files[0]);

         $.ajax({
            url: "http://127.0.0.1:3002/api/profile/image",
            method: "PATCH",
            data: formData,
            headers: { Authorization: "Bearer " + localStorage.getItem("token") },
            processData: false,
            contentType: false,
            success: function (response) {
               localStorage.setItem("user", JSON.stringify(response));
               alert("Resim Başarıyla Yüklendi!");
            },
            error: function (jqXHR) {
               alert(jqXHR.responseJSON.error);
            },
         });
      } else {
         alert("Lüften Önce Resim Seçin");
      }
   });
   // Delete image
   $("#delete-profile-image").on("click", function () {
      $.ajax({
         url: "http://127.0.0.1:3002/api/profile/image",
         method: "DELETE",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function (response) {
            localStorage.setItem("user", JSON.stringify(response));
            $("#user-profile-image").attr("src", "/public/blank_user.png");
            alert("Resim Başarıyla Silindi!");
         },
         error: function (jqXHR) {
            alert(jqXHR.responseJSON.error);
         },
      });
   });

   fetchAllUserChannels();

   // Open Channel
   $(document).on("click", ".sidebar-channel-icon", function () {
      const channelId = $(this).attr("data-channel-id");
      console.log("Opening channel:", channelId);
      openChannel(channelId);
   });

   // Open SubChannel
   $(document).on("click", ".sub-channel", function () {
      const subchannelId = $(this).attr("data-sub-channel-id");
      console.log("Opening subchannel:", subchannelId);
      openSubChannel(subchannelId);
   });
});

// Open Channel
function openChannel(channelId) {
   // Get The Selected channelId
   $.ajax({
      url: `http://127.0.0.1:3002/api/channel/${channelId}`,
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      success: function (response) {
         localStorage.setItem("channel", JSON.stringify(response));
         $("#channelName").text(response.name);
         const user = JSON.parse(localStorage.getItem("user"));

         const subChannelsJoined = response.subChannels.filter((subChannel) => subChannel.members.includes(user._id));
         const subChannelsNotJoined = response.subChannels.filter(
            (subChannel) => !subChannel.members.includes(user._id)
         );

         // Add SubChannels Joined to the sidebar
         $(".sub-channels-container").empty();
         subChannelsJoined.forEach(function (subChannel) {
            var subChannelDiv = document.createElement("div");
            subChannelDiv.classList.add("sub-channel");
            subChannelDiv.setAttribute("data-sub-channel-id", subChannel._id);

            var subChannelImg = document.createElement("img");
            subChannelImg.classList.add("sub-channel-icon");
            subChannelImg.setAttribute("src", "/public/channel_hash.png");

            var subChannelName = document.createElement("div");
            subChannelName.classList.add("sub-channel-name");
            subChannelName.textContent = subChannel.name;

            subChannelDiv.appendChild(subChannelImg);
            subChannelDiv.appendChild(subChannelName);

            $(".sub-channels-container").append(subChannelDiv);
         });

         // Add SubChannels Not Joined to the sidebar
         $("#other-channel-collapse").empty();
         subChannelsNotJoined.forEach(function (subChannel) {
            const subChannelDiv = document.createElement("div");
            subChannelDiv.setAttribute("data-other-subchannel-id", subChannel._id);
            subChannelDiv.classList.add("other-channel");

            subChannelDiv.innerHTML = `<img src="/public/channel_hash.png" class="other-channel-icon" />
            <div class="other-channel-name">${subChannel.name}</div>
            <input type="image" src="/public/join_button.png" class="other-channel-join" alt="Join" />`;

            $("#other-channel-collapse").append(subChannelDiv);
         });

         // Open the "General" subchannel by default
         const subChannelToOpen = response.subChannels.find((subChannel) => subChannel.name === "Genel");
         openSubChannel(subChannelToOpen._id);
      },
      error: function (jqXHR) {
         alert(jqXHR.responseJSON.error);
      },
   });
}

// Open SubChannel
function openSubChannel(subChannelId) {
   const currentChannel = JSON.parse(localStorage.getItem("channel"));
   if (!currentChannel._id) return;

   // Clear the previos messages
   $(".chat-messages").empty();

   $.ajax({
      url: `http://127.0.0.1:3002/api/channels/${currentChannel._id}/subchannels/${subChannelId}`,
      method: "GET",
      headers: { Authorization: "Bearer " + localStorage.getItem("token") },
      success: function (response) {
         localStorage.setItem("subchannel", JSON.stringify(response));

         console.log(response);

         $(".current-subchannel-name").text(response.name);
         $(".chat-description span").text(response.topic);

         // Start polling for new messages
         startMessagesPolling(subChannelId);
      },
      error: function (jqXHR) {
         alert(jqXHR.responseJSON.error);
      },
   });
}

// Format Date to dd/mm/yyyy
function formatDate(date) {
   const options = { year: "numeric", month: "2-digit", day: "2-digit" };
   return new Date(date).toLocaleDateString("tr-TR", options);
}

// Format Date to dd/mm/yyyy - hour/minute
function formatDateTime(date) {
   const options = { year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" };
   return new Date(date).toLocaleDateString("tr-TR", options);
}

// Logout
function logout() {
   localStorage.removeItem("token");
   localStorage.removeItem("user");
   localStorage.removeItem("subchannel");
   localStorage.removeItem("channel");
   window.location.href = "login.html";
}
$(document).ready(function () {
   $(".logout").on("click", function () {
      logout();
   });
});
