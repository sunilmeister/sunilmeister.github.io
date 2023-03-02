// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class ModalPopup {
  constructor(popupDivId, width, height, fontSize, displayTimeInSecs) {
    this.div = document.getElementById(popupDivId);
    this.div.style.width = width;
    this.div.style.height = height;
    this.div.style.fontSize = fontSize;
    this.displayTime = displayTimeInSecs;
    this.secCounter = 0;
    this.secTimer = null;
    this.timerIntervalInMs = 250;
  }

  show() {
    this.div.style.display = 'block';
    this.div.style.opacity = 1;
    this.secCounter = 0;
    this.secTimer = setInterval(this.count.bind(this), this.timerIntervalInMs);
  }

  count() {
    this.secCounter++;
    //if ((this.secCounter%4)==0) this.div.style.opacity = 1;
    //else this.div.style.opacity = this.div.style.opacity - 0.02;

    if (this.timerIntervalInMs * (this.secCounter) >= 1000 * this.displayTime) {
      clearInterval(this.secTimer);
      this.close();;
    }
  }

  close() {
    this.div.style.display = 'none';
  }
}
