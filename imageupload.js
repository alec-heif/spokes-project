$(function(){
	$("body").prepend(function(){/*
<div class="modal" id="imagewindow">
  <div class="modal-wrapper">
  	<h1 style="display: inline; float: left; margin-top: 0px">Upload photo</h1>
    <div class="xbutton" style="float:right; width: 50%"><a onclick="closeModalWindows();">&times;</a></div>
    <div style="clear:both"></div>
    <br/>
    <input type='file' style="margin-bottom: 10px"/>
    <img id="myimg" width=300 height=300/>
    <a id="uploadimagebutton" class="button disabled" href="javascript:void(0)" onclick="uploadImage()">Upload</a>
  </div>
</div>
*/}.toString().slice(14,-3));
});

function openImageWindow() {
  $('#imagewindow').addClass('is-visible');
  $('.modal-mask').addClass('is-visible');
  return false;
}

$(function () {
    $(":file").change(function () {
        if (this.files && this.files[0]) {
            var reader = new FileReader();
            reader.onload = imageIsLoaded;
            reader.readAsDataURL(this.files[0]);
        }
    });
});

function imageIsLoaded(e) {
    $('#myimg').attr('src', e.target.result);
    $("#uploadimagebutton").removeClass("disabled");
};

var currentlyWorking = false;

function uploadImage() {
	var img = $('#myimg').attr('src');
	if (img && !currentlyWorking) {
    dummy = false;
		currentlyWorking = true;
		imagesRef = new Firebase('https://spokes-project.firebaseio.com/routes/'+thisTrailID+'/images');
		imagesRef.push(img, function(a,b,c) {
			//location.reload();
      location.href="trail.html?trail="+thisTrailID;
		});
	}

}

