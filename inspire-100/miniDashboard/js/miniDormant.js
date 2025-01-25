// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

function autoCloseDormantPopup() {
  if (dormantPopupDisplayed) {
    Swal.close();
    dormantPopupManualCloseTime = null;
  }
}

function showDormantPopup() {
	if (dashboardSessionClosed) return;

  dormantPopupDisplayed = true;
  dormantPopupManualCloseTime = null;
  let modalColor = palette.modal;
  
  let dormantTimerInterval;
  Swal.fire({
    icon: 'info',
    title: DORMANT_TITLE_STR,
    html: DORMANT_MESSAGE_STR,
    color: 'white',
    background: modalColor,
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showCloseButton: true,
    showClass: {
      popup: `animate__animated animate__fadeInDown`
    },
    hideClass: {
      popup: `animate__animated animate__fadeOutUp`
    },
    didOpen: () => {
      const b = Swal.getHtmlContainer().querySelector('b');
      dormantTimerInterval = setInterval(() => {
        b.textContent = msToHHMMSS(1000*dormantTimeInSec);
      }, 1000)
    },
    willClose: () => {
      clearInterval(dormantTimerInterval)
      dormantPopupDisplayed = false;
      dormantPopupManualCloseTime = new Date();
    }
  }).then((result) => {
    if (result.isConfirmed) {
      dormantPopupDisplayed = false;
      dormantPopupManualCloseTime = new Date();
    }
  })
}

setInterval(() => {
  dormantTimeInSec++;
}, 1000)


