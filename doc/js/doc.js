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
      position: 'bottom-end',
      title: PDF_TITLE_STR,
      html: PDF_MESSAGE_STR,
      //width: 600,
      showConfirmButton: true,
      color: 'white',
      background: '#2C94BC',
      showConfirmButton: true,
      confirmButtonColor: '#0D3E51',
      confirmButtonText: 'DISMISS',
      showDenyButton: true,
      denyButtonColor: '#B22222',
      denyButtonText: "STOP Reminders!",
      showCloseButton: true,
      showClass: {
        popup: `
          animate__animated
          animate__fadeInUp
          animate__faster
        `
      },
      hideClass: {
        popup: `
          animate__animated
          animate__fadeOutDown
          animate__faster
        `
      },
      grow: 'row',
      timerProgressBar: true,
      timer: 5000
    }).then((result) => {
       if (result.isDenied) {
        setCookie(pdfReminderOffCookieName, "OFF");
       }
    })
  }
}
