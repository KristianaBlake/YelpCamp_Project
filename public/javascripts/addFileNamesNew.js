// this function will run inside the Input of Form Control, 
// it will show the images, one by one, with the links of the
// images uploaded 

function previewMultiple(event) {
    var images = document.getElementById("image");
    var number = images.files.length;
    for (i = 0; i < number; i++) {
        var urls = URL.createObjectURL(event.target.files[i]);
        document.getElementById("formFile").innerHTML += '<img src="' + urls + '">';
    }
}