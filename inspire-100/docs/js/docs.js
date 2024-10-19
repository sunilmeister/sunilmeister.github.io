const ACCESS_KEY = "Docs@Inspire-100";

function checkDocPassword(pwd) {
  return (pwd == ACCESS_KEY);
}

function submitDocPassword() {
  let pwd = document.getElementById("password").value;
	if (!checkDocPassword(pwd)) {
  	document.getElementById("pwdError").style.display = "block";
		return;
	}
 	document.getElementById("pwdError").style.display = "none";
  document.getElementById("passwordDiv").style.display = "none";
}

window.onload = function () {
	setRootFontSize("wrapper", "wrapper");
  new KeypressEnterSubmit('password', 'passwordBtn');

 	document.getElementById("passwordDiv").style.display = "block";
}

