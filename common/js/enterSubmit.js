// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class KeypressEnterSubmit {
  // containerBodyDiv is an HTML object
  constructor(inputElemId, submitButtonId) {
    this.inputElemId = inputElemId;
    this.submitButtonId = submitButtonId;
    this.inputElem = document.getElementById(inputElemId);
    this.submitButton = document.getElementById(submitButtonId);
    this.inputElem.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      this.submitButton.click();
    }
  });
}

}

