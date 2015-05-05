var modalWindows = function(){/*
<div class="modal" id="loginwindow">
  <div class="modal-wrapper">
      <div style="text-align: right"><a onclick="closeModalWindows();">X</a></div>
      <input type="text" placeholder="username" id="loginusername"></input><br/>
      <input type="password" placeholder="password" id="loginpassword"></input><br/>
      <button onclick="attemptLogin();">log in</button>
  </div>
</div>
<div class="modal" id="signupwindow">
  <div class="modal-wrapper">
      <div style="text-align: right"><a onclick="closeModalWindows();">X</a></div>
      <input type="text" placeholder="username" id="signupusername"></input><br/>
      <input type="password" placeholder="password" id="signuppassword"></input><br/>
      <input type="password" placeholder="confirm" id="signupconfirm"></input><br/>
      <button onclick="attemptSignup();">sign up</button>
  </div>
</div>
<div class="modal-mask"></div>
*/}.toString().slice(14,-3);

//alert(modalWindows)


function openLoginForm() {
  $('#loginwindow').addClass('is-visible');
  $('.modal-mask').addClass('is-visible');
  return false;
}

function openSignupForm() {
  $('#signupwindow').addClass('is-visible');
  $('.modal-mask').addClass('is-visible');
  return false;
}



function closeModalWindows() {
  $(".modal").removeClass('is-visible');
  $('.modal-mask').removeClass('is-visible');
  return false;
}

var loggedInAs = "";

function attemptLogin() {
  var username = $("#loginusername").val();
  var password = $("#loginpassword").val();
  if (username && password) {
    loggedInAs = username;
    closeModalWindows();
    $("#loginusername").val("");
    $("#loginpassword").val("");
    updateLoginButtons();
  }
}

function attemptSignup() {
  var username = $("#signupusername").val();
  var password = $("#signuppassword").val();
  var confirm = $("#signupconfirm").val();
  if (username && password && (password === confirm)) {
    loggedInAs = username;
    $("#signupusername").val("");
    $("#signuppassword").val("");
    $("#signupconfirm").val("");
    closeModalWindows();
    updateLoginButtons();
  }
}

function attemptLogout() {
  console.log("logging out");
  loggedInAs = "";
  updateLoginButtons();
}


function updateLoginButtons() {
  if (loggedInAs) {
    $("#firstlogin").text(loggedInAs).addClass("bold").unbind("click");
    $("#secondlogin").text("log out").unbind("click").on("click", attemptLogout);
  } else {
    $("#firstlogin").text("log in").removeClass("bold").unbind("click").on("click", openLoginForm);
    $("#secondlogin").text("sign up").unbind("click").on("click", openSignupForm);
  }
}

$(function(){
  $("body").prepend(modalWindows);
  updateLoginButtons();
});
