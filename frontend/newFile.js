// Channel Invitation Module
$(function () {
   // Click event for the "Invite" button
   $(".invitation-button").click(function () {
      // Fetch All Invites
      $.ajax({
         url: "http://127.0.0.1:3002/api/invites",
         method: "GET",
         headers: { Authorization: "Bearer " + localStorage.getItem("token") },
         success: function (response) {
            // Populate the invite list with the response data
            // $(".invitation-list").empty();
            const inviteList = response;
            inviteList.forEach(function (invite) {
               const outerDiv = document.createElement("div");
               outerDiv.classList.add("invitation");

               const inviteImg = document.createElement("img");
               inviteImg.classList.add("channel-icon");
               inviteImg.setAttribute("src", invite.channel.image || "/public/blank_channel.png");
               outerDiv.appendChild(inviteImg);

               const invitationInfo = document.createElement("div");
               invitationInfo.classList.add("invitation-info");
               outerDiv.appendChild(invitationInfo);

               const inviteName = document.createElement("div");
               inviteName.classList.add("channel-name");
               inviteName.innerText = invite.channel.name;
               invitationInfo.appendChild(inviteName);

               const invitationActions = document.createElement("div");
               invitationActions.classList.add("invitation-actions");
               invitationInfo.appendChild(invitationActions);

               const acceptBtn = document.createElement("button");
               acceptBtn.setAttribute("data-invite-id", invite._id);
               acceptBtn.classList.add("btn", "btn-success", "accept-btn");
               acceptBtn.innerHTML = "&#10004;";
               invitationActions.appendChild(acceptBtn);

               const verticalLine = document.createElement("div");
               verticalLine.classList.add("vertical-line");
               invitationActions.appendChild(verticalLine);

               const declineBtn = document.createElement("button");
               declineBtn.setAttribute("data-invite-id", invite._id);
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

      $("#invitation-overlay").fadeIn();
      $("#invitation-modal").fadeIn();
   });

   // Click event for the "Close" button or the overlay
   $("#invitation-overlay, .close-btn").click(function () {
      $("#invitation-overlay").fadeOut();
      $("#invitation-modal").fadeOut();
   });

   // Click event for the "Accept" and "Decline" buttons
   $(".accept-btn").click(function () {
      const channelName = $(this).closest(".invitation").find(".channel-name").text();
      console.log("Davet kabul edildi:", channelName);
      // Add API call for accepting invitation
      $(this).closest(".invitation").remove();
   });

   Handle;
   Decline;
   Invite;
   $(document).on("click", ".decline-btn", function () {
      const inviteId = $(this).attr("data-invite-id");
      console.log("Davet reddedildi:", inviteId);
      // Add API call for declining invitation
      // $(this).closest(".invitation").remove();
   });
});
