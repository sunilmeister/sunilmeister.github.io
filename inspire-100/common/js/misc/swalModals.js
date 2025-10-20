/* ********************************************************
                   Author : Sunil Nanda
   ******************************************************** */

///////////////////////////////////////////////////////
// For modal warnings errors, confirmations etc.
///////////////////////////////////////////////////////
var modalWidth = "45rem"; // default modal width
var modalId = null;

const dontShowButtonHTML = 
"<button class=dontShowButton onclick='dontShowButton(modalId)'>Dont show again</button>" ;

function dontShowButton(modalId) {
  if (modalId && !session.dontShowModals.includes(modalId)) {
    session.dontShowModals.push(modalId);
  }
  Swal.close();
  // console.log("dontShowButton", modalId);
}

function extractModalId(msg) {
  const index = msg.indexOf("\n");
  return index === -1 ? msg : msg.substring(0, index);
}

function modalWarning(title, msg) {
  let modalHtml = 
    "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>";
  Swal.close();
  Swal.fire({
    icon: 'warning',
    title: "<span style='font-size:var(--swalTitleFontSize);'>" + title + "</span>",
    html: modalHtml,
    width: modalWidth,
    color: 'white',
    background: '#4D5656',
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showCloseButton: true,
  })
}

const INFO_TIMER_INTERVAL = 10000;
var infoTimerInterval;
function modalInfo(title, msg) {
  let modalColor = palette.modal;
  modalId = extractModalId(msg);
  if (session.dontShowModals.includes(modalId)) {
    return;
  }

  let modalHtml = 
    "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>";
  if (modalId) {
    modalHtml += dontShowButtonHTML;
  }

  Swal.close();
  Swal.fire({
    icon: 'info',
    title: "<span style='font-size:var(--swalTitleFontSize);'>" + title + "</span>",
    html: modalHtml,
    width: modalWidth,
    color: 'white',
    background: modalColor,
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showCloseButton: true,
    timer: INFO_TIMER_INTERVAL,
    timerProgressBar: true,
    showClass: {
      popup: `animate__animated animate__fadeInDown`
    },
    hideClass: {
      popup: `animate__animated animate__fadeOutUp`
    },
    willClose: () => {
      clearInterval(infoTimerInterval);
    }
  })
}

function modalAlert(title, msg) {
  let modalHtml = 
    "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>";
  Swal.close();
  Swal.fire({
    icon: 'error',
    title: "<span style='font-size:var(--swalTitleFontSize);'>" + title + "</span>",
    html: modalHtml,
    width: modalWidth,
    color: 'white',
    background: '#D35400',
    showConfirmButton: true,
    confirmButtonColor: '#0D3E51',
    confirmButtonText: 'DISMISS',
    showCloseButton: true,
  })
}

function modalConfirm(title, msg, confirmFn, cancelFn, callbackArgs, confirmText, cancelText) {
  if (typeof confirmText == 'undefined') {
    confirmText = "CONFIRM";
  }
  if (typeof cancelText == 'undefined') {
    cancelText = "CANCEL";
  }

  let modalColor = palette.modal;
  
  Swal.close();
  Swal.fire({
    icon: 'question',
    title: title,
    html: "<span style='font-size:var(--swalTextFontSize);'><pre>" + msg + "</pre></span>",
    width: modalWidth,
    color: 'white',
    background: modalColor,
    showConfirmButton: true,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#0D3E51',
    cancelButtonColor: '#B22222',
    showCloseButton: true,
  }).then((result) => {
    if (result.isConfirmed) {
      if (confirmFn) confirmFn(callbackArgs);
    } else if (result.isDismissed || result.isDenied) {
      if (cancelFn) cancelFn(callbackArgs);
      else Swal.fire({
        icon: 'info',
        title: 'Cancelled!',
        text: 'No action taken',
        width: modalWidth,
        color: 'white',
        background: modalColor,
        showConfirmButton: false,
      })
    }
  })
}
