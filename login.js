var modalWindows = function(){/*
<div class="modal" id="loginwindow">
  <div class="modal-wrapper">
    <div class="xbutton"><a onclick="closeModalWindows();">&times;</a></div>
    <input type="text" placeholder="username" id="loginusername"></input>
    <input type="password" placeholder="password" id="loginpassword"></input>
    <a onclick="attemptLogin();" class="button" href="javascript:void(0)">log in</a>
  </div>
</div>
<div class="modal" id="signupwindow">
  <div class="modal-wrapper">
    <div class="xbutton"><a onclick="closeModalWindows();">&times;</a></div>
    <input type="text" placeholder="username" id="signupusername"></input>
    <input type="password" placeholder="password" id="signuppassword"></input>
    <input type="password" placeholder="confirm" id="signupconfirm"></input>
    <a onclick="attemptSignup();" class="button" href="javascript:void(0)">sign up</a>
  </div>
</div>
<div class="modal-mask"></div>
*/}.toString().slice(14,-3);

//alert(modalWindows)

var windowState = 0;

function openLoginForm() {
  $('#loginwindow').addClass('is-visible');
  $('.modal-mask').addClass('is-visible');
  $("#loginusername").focus();
  windowState = 1;
  validateForm();
  return false;
}

function openSignupForm() {
  $('#signupwindow').addClass('is-visible');
  $('.modal-mask').addClass('is-visible');
  $("#signupusername").focus();
  windowState = 2;
  validateForm();
  return false;
}

function closeModalWindows() {
  $(".modal").removeClass('is-visible');
  $('.modal-mask').removeClass('is-visible');
  windowState = 0;
  return false;
}


function handleKeyup(k) {
  if (k.which === 13) {
    if (windowState === 1) {
      attemptLogin();
    } else if (windowState === 2) {
      attemptSignup();
    }
  } else {
    validateForm();
  }
}

var loginIsValid = false;
var signupIsValid = false;
function validateForm() {
  if (windowState === 1) { //login
    loginIsValid = (!!$("#loginusername").val() && !!$("#loginpassword").val());
    $("#loginwindow .button").toggleClass("disabled", !loginIsValid);
  } else if (windowState === 2) { //signup
    signupIsValid = (!!$("#signupusername").val() && !!$("#signuppassword").val() && ($("#signuppassword").val() === $("#signupconfirm").val()));
    $("#signupwindow .button").toggleClass("disabled", !signupIsValid);
  }
}


//var loggedInAs = "";

function attemptLogin() {
  var username = $("#loginusername").val();
  var password = $("#loginpassword").val();
  if (username && password) {
    localStorage.setItem("loggedInAs", username);
    closeModalWindows();
    $("#loginusername").val("");
    $("#loginpassword").val("");
    updateLoginButtons();
    location.reload();
  }
}

function attemptSignup() {
  var username = $("#signupusername").val();
  var password = $("#signuppassword").val();
  var confirm = $("#signupconfirm").val();
  if (username && password && (password === confirm)) {
    localStorage.setItem("loggedInAs", username);
    $("#signupusername").val("");
    $("#signuppassword").val("");
    $("#signupconfirm").val("");
    closeModalWindows();
    updateLoginButtons();
    location.reload();
  }
}

function attemptLogout() {
  console.log("logging out");
  localStorage.removeItem("loggedInAs");
  updateLoginButtons();
  location.reload();
}

function validateLogin() {
  console.log("LOGIN CHANGED");
}

function validateSignup() {
  console.log("SIGNUP CHANGED");
}


function updateLoginButtons() {
  var loggedInAs = localStorage.getItem("loggedInAs");
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

  $('#loginwindow').on("keyup", handleKeyup);
  $('#signupwindow').on("keyup", handleKeyup);
  /*$('#loginwindow input').on("change", validateLogin);
  $('#signupwindow input').on("change", validateSignup);*/
  //$('.modal-mask').on("keypress", handleKeypress);

});
