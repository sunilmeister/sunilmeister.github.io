// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function enable(btn, img) {
  let bgd = palette.mediumblue;
  document.getElementById(btn).style.backgroundColor = bgd;
  document.getElementById(btn).style.color = 'white';
  document.getElementById(btn).style.cursor = "pointer";
  document.getElementById(img).style.cursor = "pointer";
}

function disable(btn, img) {
  let bgd = palette.lightblue;
  let fgd = palette.mediumblue;
  document.getElementById(btn).style.backgroundColor = bgd;
  document.getElementById(btn).style.color = fgd;
  document.getElementById(btn).style.cursor = "not-allowed";
  document.getElementById(img).style.cursor = "not-allowed";
}

function faqManual() {
  document.getElementById('faqManualDiv').style.display = "block";
  document.getElementById('opManualDiv').style.display = "none";
  document.getElementById('webAppsDiv').style.display = "none";
  document.getElementById('slideDeckDiv').style.display = "none";
  document.getElementById('firmwareDeckDiv').style.display = "none";

  disable('btnFaqManual', 'faqManualImg');
  enable('btnOpManual', 'opManualImg');
  enable('btnWebApps', 'webAppsImg');
  enable('btnSlideDeck', 'slideDeckImg');
  enable('btnFirmwareDeck', 'firmwareDeckImg');
}

function opManual() {
  document.getElementById('faqManualDiv').style.display = "none";
  document.getElementById('opManualDiv').style.display = "block";
  document.getElementById('webAppsDiv').style.display = "none";
  document.getElementById('slideDeckDiv').style.display = "none";
  document.getElementById('firmwareDeckDiv').style.display = "none";

  enable('btnFaqManual', 'faqManualImg');
  disable('btnOpManual', 'opManualImg');
  enable('btnWebApps', 'webAppsImg');
  enable('btnSlideDeck', 'slideDeckImg');
  enable('btnFirmwareDeck', 'firmwareDeckImg');
}

function webApps() {
  document.getElementById('opManualDiv').style.display = "none";
  document.getElementById('faqManualDiv').style.display = "none";
  document.getElementById('webAppsDiv').style.display = "block";
  document.getElementById('slideDeckDiv').style.display = "none";
  document.getElementById('firmwareDeckDiv').style.display = "none";

  enable('btnFaqManual', 'faqManualImg');
  enable('btnOpManual', 'opManualImg');
  disable('btnWebApps', 'webAppsImg');
  enable('btnSlideDeck', 'slideDeckImg');
  enable('btnFirmwareDeck', 'firmwareDeckImg');
}

function slideDeck() {
  document.getElementById('faqManualDiv').style.display = "none";
  document.getElementById('opManualDiv').style.display = "none";
  document.getElementById('webAppsDiv').style.display = "none";
  document.getElementById('slideDeckDiv').style.display = "block";
  document.getElementById('firmwareDeckDiv').style.display = "none";

  enable('btnFaqManual', 'faqManualImg');
  enable('btnOpManual', 'opManualImg');
  enable('btnWebApps', 'webAppsImg');
  disable('btnSlideDeck', 'slideDeckImg');
  enable('btnFirmwareDeck', 'firmwareDeckImg');
}

function firmwareDeck() {
  document.getElementById('faqManualDiv').style.display = "none";
  document.getElementById('opManualDiv').style.display = "none";
  document.getElementById('webAppsDiv').style.display = "none";
  document.getElementById('slideDeckDiv').style.display = "none";
  document.getElementById('firmwareDeckDiv').style.display = "block";

  enable('btnFaqManual', 'faqManualImg');
  enable('btnOpManual', 'opManualImg');
  enable('btnWebApps', 'webAppsImg');
  enable('btnSlideDeck', 'slideDeckImg');
  disable('btnFirmwareDeck', 'firmwareDeckImg');
}

window.onload = function () {
  if (getCookie(pdfReminderOffCookieName) != "OFF") {
    let modalColor = palette.modal;

    Swal.fire({
      icon: 'info',
      title: PDF_TITLE_STR,
      html: PDF_MESSAGE_STR,
      width: 650,
      showConfirmButton: true,
      color: 'white',
      background: modalColor,
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
      timerProgressBar: true,
      timer: 5000
    }).then((result) => {
      if (result.isDenied) {
        setCookie(pdfReminderOffCookieName, "OFF");
      }
    })
  }
  //var menuBar = document.getElementById("sideMenuBar");
  //menuBarHeight = menuBar.offsetHeight;
  //menuBarWidth = menuBar.offsetWidth;
  //var nonMenuArea = document.getElementById("nonMenuArea");
  //nonMenuArea.style.marginTop = String(0 - menuBarHeight) + "px";
  //nonMenuArea.style.marginLeft = String(menuBarWidth + 50) + "px";
  //console.log("menuBarHeight = " + menuBarHeight);
  //console.log("menuBarWidth = " + menuBarWidth);
}
