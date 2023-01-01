function enable(btn, img) {
  var style = getComputedStyle(document.body)
  bgd = style.getPropertyValue('--rsp_lightblue');
  document.getElementById(btn).style.backgroundColor=bgd;
  document.getElementById(btn).style.cursor="pointer";
  document.getElementById(img).style.cursor="pointer";
}

function disable(btn, img) {
  document.getElementById(btn).style.backgroundColor="white";
  document.getElementById(btn).style.cursor="not-allowed";
  document.getElementById(img).style.cursor="not-allowed";
}

function opManual() {
  document.getElementById('opManualDiv').style.display="block";
  document.getElementById('webAppsDiv').style.display="none";
  document.getElementById('slideDeckDiv').style.display="none";

  disable('opManualBtn', 'opManualImg');
  enable('webAppsBtn', 'webAppsImg');
  enable('slideDeckBtn', 'slideDeckImg');
}

function webApps() {
  document.getElementById('opManualDiv').style.display="none";
  document.getElementById('webAppsDiv').style.display="block";
  document.getElementById('slideDeckDiv').style.display="none";

  enable('opManualBtn', 'opManualImg');
  disable('webAppsBtn', 'webAppsImg');
  enable('slideDeckBtn', 'slideDeckImg');
}

function slideDeck() {
  document.getElementById('opManualDiv').style.display="none";
  document.getElementById('webAppsDiv').style.display="none";
  document.getElementById('slideDeckDiv').style.display="block";

  enable('opManualBtn', 'opManualImg');
  enable('webAppsBtn', 'webAppsImg');
  disable('slideDeckBtn', 'slideDeckImg');
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
  var menuBar = document.getElementById("sideMenuBar");
  menuBarHeight = menuBar.offsetHeight;
  menuBarWidth = menuBar.offsetWidth;
  var nonMenuArea = document.getElementById("nonMenuArea");
  nonMenuArea.style.marginTop = String(0-menuBarHeight) + "px";
  nonMenuArea.style.marginLeft = String(menuBarWidth+50) + "px";
  //console.log("menuBarHeight = " + menuBarHeight);
  //console.log("menuBarWidth = " + menuBarWidth);
}
