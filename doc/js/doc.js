function opManual() {
  document.getElementById('opManualDiv').style.display="block";
  document.getElementById('webAppsDiv').style.display="none";
  document.getElementById('slideDeckDiv').style.display="none";
}

function webApps() {
  document.getElementById('opManualDiv').style.display="none";
  document.getElementById('webAppsDiv').style.display="block";
  document.getElementById('slideDeckDiv').style.display="none";
}

function slideDeck() {
  document.getElementById('opManualDiv').style.display="none";
  document.getElementById('webAppsDiv').style.display="none";
  document.getElementById('slideDeckDiv').style.display="block";
}

window.onload = function() {
  if (getCookie(pdfReminderOffCookieName) != "OFF") {
    Swal.fire({
      icon: 'info',
      title: PDF_TITLE_STR,
      html: PDF_MESSAGE_STR,
      width: 600,
      showConfirmButton: false,
      color: 'white',
      background: '#2C94BC',
      showConfirmButton: true,
      confirmButtonColor: '#0D3E51',
      confirmButtonText: 'DISMISS',
      showCancelButton: true,
      cancelButtonColor: '#B22222',
      cancelButtonText: "No More Reminders!",
      timer: 5000
    }).then((result) => {
       if (result.isDismissed) {
        setCookie(pdfReminderOffCookieName, "OFF");
       }
    })
  }
}
