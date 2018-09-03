
var images = [null, null, null, null, null, null];

function customMessage(){
	this.warning = function warning(message){
		return '<div style=\'padding:12px; opacity:.99\'><div style=\'color:#F48622; font-size:16px; background:#FBE9BD; border-left:#F48622 thick solid; width:90%; max-width:500px; padding:15px; font-family:Helvetica Neue,Helvetica,Arial,sans-serif;\'><i class=\'fa fa-exclamation-circle\'></i> '+message+'</div></div>';
	}
	this.error = function(message){
		return '<div style=\'padding:12px;\'><div align=\'left\' style=\'color:#ED050B; opacity:.99;width:90%; max-width:500px; font-size:15px; background:#F9B4B0; border-left:#ED050B thick solid; padding:15px; font-family:Helvetica Neue,Helvetica,Arial,sans-serif; \' ><i class=\'fa fa-warning\'></i> '+message+'</div></div>';
	}
	this.success = function(message){
		return '<div style=\'padding:12px;\'><div style=\'color:#2B8E11; width:90%; max-width:500px; opacity:.99; font-size:16px; background:#BCF8AD; border-left:#2B8E11 thick solid; padding:15px; font-family:Helvetica Neue,Helvetica,Arial,sans-serif;\'><i class=\'fa fa-check-square-o\'></i> '+message+'</div></div>';
	}
}
function mCra(message){
    clearMessage(true);
	$(document).ready(function(){
		document.getElementById("stow").style.display = "block";
		$("#stow").html(message);
		clearMessage();
	});
}
delay = 5;
function clearMessage(force = false){
    if(!force){
        if(delay === 0){
            clearTimeout(timer);
            delay = 5;
            $("#stow").fadeOut(2000, function(){
                $("#stow").html('');
            });
        }else{
            delay--;
            timer = setTimeout("clearMessage()",1000);
        }
    }else{
        //clearTimeout(timer);
        delay = 5;
        document.getElementById("stow").style.display = "none";
    }	
}
function surrogate(name){
    $("#"+name).click();
}
function postFunc(url, datum, callback){
    try{
        $.ajax({
            url: url,    //Your api url
            type: 'POST', //type is any HTTP method
            data: datum,      //Data as js object
            contentType: 'application/json',
            dataType: "json",
            success: function (response) {
                callback(response);
            },
            error: function(e){
                var response = {
                    "error":{
                        "status":1,
                        "message":e.responseText
                    }
                }
                callback(response);
            }
        });
    }catch(e){
        var response = {
            "error":{
                "status":1,
                "message":e.responseText
            }
        }
        callback(response);
    }	
}
function readImage(obj, index){
    var custom = new customMessage(); 
    var imageURL = obj.files[0];
    imageName = obj.files[0].name;
    var reader  = new FileReader();
    var image = document.getElementById("preview");
    // it's onload event and you forgot (parameters)
    reader.onload = function(e)  {
		// the result image data
		if(imageURL.size/1024 <= 5000000){
			if(e.target.error == null){
				if(e.target.result.substr(0, 10) == "data:image"){
					image.src = e.target.result;
                    images[index] = image.src.replace(/^data:image\/(png|jpg);base64,/, "");
                    updateImageStatus(index, imageName);
                    //lastObj.innerHTML = '<i class="fa fa-camera"></i> '+imageName+' Selected';
                    imageSet = true;
				}else{
                    mCra(custom.error("The image is invalid"));
					//alert("The image is invalid");
				}				
			}else{
                mCra(custom.error("The image selected is invalid!"));
				//alert("The image selected is invalid!");
			}
		}else{
            mCra(custom.error("The Max. allowed file size is 5Mb"));
			//alert("The Max. allowed file size is 150Kb");
		}
     }
     // you have to declare the file loading
     reader.readAsDataURL(imageURL);
}
function updateImageStatus(index, filename){
    var former = $("#stat"+index).html();
    var K = former.substr(former.indexOf('<i class="fa fa-times hand"'), former.length - index);
    $("#stat"+index).html(filename+" "+K);
    document.getElementById("stat"+index).style.display = "block";
}
function remove(index){
    images[index] = null;
    document.getElementById("stat"+index).style.display = "none";
}
function submitForm(){
    var custom = new customMessage();
    var enroleeID = $("#enroleeID").val();
    var reason = $("#reason").val();
    var bank = $("#bank").val();
    var account = $("#account").val();
    var amount = $("#amount").val();
    var isreceiveTreatment = $("#isreceiveTreatment").find(":selected").val();
    var treatDate = $("#treatDate").val();
    var why = $("#why").val();
    var ishaveplan = $("#ishaveplan").find(":selected").val();
    var company = $("#company").val();
    isImagePresent = false;
    for(i = 0; i < images.length; i++ ){
        if(images[i] !== null){
            isImagePresent = true;
        }
    }
    if(!isImagePresent){
        mCra(custom.error("At least An Image to support claim is required!"));
        return false;
    }
    if(isreceiveTreatment == "-"){
        mCra(custom.error("Please answer the question: Have you received any treatment/clinical evaluation in the facility( hospital, clinic or diagnostic centre) in question before?"));
        return false;
    }
    if(ishaveplan == "-"){
        mCra(custom.error("Please answer the question: Are you under any other plan or package which covers the requested refund benefit either directly, as a spouse or dependant?"));
        return false;
    }
    var data = {
        "data":{
            "enroleeID":enroleeID,
            "reason":reason,
            "bank":bank,
            "nuban":account,
            "amount":amount,
            "receipt":images[0],
            "report":images[1],
            "costAnalysis":images[2],
            "labresult":images[3],
            "prescription":images[4],
            "others":images[5],
            "isrecievetreatment":isreceiveTreatment,
            "treatDate":treatDate,
            "diagnosis":why,
            "iseligible":ishaveplan,
            "coverCompany":company

        }
    }
    document.getElementById("gear").style.display = "block";
    document.getElementById("button").disabled = "disabled";
    postFunc("http://127.0.0.1/healthTouch/public/api/hmo/open/reimbursement", JSON.stringify(data), function(response){
        if(response.error.status == 1){
            mCra(custom.error(response.error.message));
            document.getElementById("gear").style.display = "none";
            document.getElementById("button").disabled = "";
        }else{
            mCra(custom.success(response.success.message));
            document.getElementById("gear").style.display = "none";
            document.getElementById("button").disabled = "disabled";
            document.getElementById("fform").style.display = "none";
            document.getElementById("sform").style.display = "block";
        }
    });
    return false;
}
