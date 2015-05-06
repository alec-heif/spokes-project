$(function(){
$("body").prepend(function(){/*
<div id="topbar">
  <div class="topbar_main">
    <a href="/spokes-project/">
      <div class="logo">
        <span class="logo_text">Spokes</span>
        <img class="logo_image" src="content/icons/bicycle_color.png"/>
      </div>
    </a>
    <span class="username">
      <a id="firstlogin"></a> | <a id="secondlogin"></a>
    </span>
  </div>
</div>
*/}.toString().slice(14,-3));
});

