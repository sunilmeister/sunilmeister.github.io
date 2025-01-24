// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class KeypressEnterSubmit {
  // containerBodyDiv is an HTML object
  constructor(inputElemId, submitButtonId) {
    this.inputElemId = inputElemId;
    this.submitButtonId = submitButtonId;
    this.inputElem = document.getElementById(inputElemId);
		if (!this.inputElem) return;
    this.submitButton = document.getElementById(submitButtonId);
		if (!this.submitButton) return;
    this.inputElem.addEventListener("keypress", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        //console.log("SUBMIT");
        this.submitButton.click();
      }
    });
  }
}

