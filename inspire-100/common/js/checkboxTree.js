// ////////////////////////////////////////////////////
// Author: Sunil Nanda
// ////////////////////////////////////////////////////

class CheckboxTree {
  constructor(treeRootId) {
    this.treeRootId = treeRootId;
    this.treeRoot = document.getElementById(treeRootId);
    this.leafCheckboxes = [];
    this.CollectLeafCboxes(this.treeRoot);
  }

  CheckboxClicked(cbox) {
    this.PropagateClickDownwards(cbox.parentNode, cbox.checked);
    this.PropagateBottomUp(this.treeRoot);
  }

  PropagateFromLeafCheckboxes() {
    this.PropagateBottomUp(this.treeRoot);
  }

  GetLeafCheckboxes() {
    return this.leafCheckboxes;
  }

  CollectLeafCboxes(elem) {
    let foundDivChild = false;
    for (let i = 0; i < elem.childNodes.length; i++) {
      let child = elem.childNodes[i];
      if (child.tagName == "DIV") {
        foundDivChild = true;
        this.CollectLeafCboxes(child);
      }
    }
    if (!foundDivChild) {
      let cbox = this.GetCboxForDiv(elem);
      this.leafCheckboxes.push(cbox);
    }
  }

  GetCboxForDiv(elem) {
    for (let i = 0; i < elem.childNodes.length; i++) {
      let child = elem.childNodes[i];
      if (child.type == "checkbox") return child;
    }
    return null;
  }

  CollectChildCboxes(elem) {
    let cboxes = [];
    for (let i = 0; i < elem.childNodes.length; i++) {
      let child = elem.childNodes[i];
      if (child.tagName == "DIV") {
        let arr = child.childNodes;
        if (!arr) continue;
        for (let j = 0; j < arr.length; j++) {
          let cbox = arr[j];
          if (cbox.type == "checkbox") cboxes.push(cbox);
        }
      }
    }
    return cboxes;
  }

  CollectChildDivs(elem) {
    let divs = [];
    for (let i = 0; i < elem.childNodes.length; i++) {
      let child = elem.childNodes[i];
      if (child.tagName == "DIV") divs.push(child);
    }
    return divs;
  }

  PropagateClickDownwards(elem, checked) {
    let divs = this.CollectChildDivs(elem);
    for (let i = 0; i < divs.length; i++) {
      let cDiv = divs[i];
      this.PropagateClickDownwards(cDiv, checked);
    }

    let cboxes = this.CollectChildCboxes(elem);
    for (let i = 0; i < cboxes.length; i++) {
      let cbox = cboxes[i];
      cbox.checked = checked;
    }
  }

  createSpace(width) {
    let sp = String('..');
    return sp.repeat(width);
  }

  PropagateBottomUp(elem) {
    if (!elem) return;
    let elemCbox = null;

    if (elem.id != this.treeRootId) elemCbox = this.GetCboxForDiv(elem);

    // must create a local copy of the array else recusion wont work!
    let divs = this.CollectChildDivs(elem);
    let localDivs = divs.concat([]);

    for (let i = 0; i < localDivs.length; i++) {
      this.PropagateBottomUp(localDivs[i]);
    }

    let cboxStatus = null;
    let cboxes = this.CollectChildCboxes(elem);
    for (let i = 0; i < cboxes.length; i++) {
      let cbox = cboxes[i];
      if (cbox.indeterminate) {
        cboxStatus = "indeterminate";
        break;
      }
      if (cboxStatus == null) {
        if (cbox.checked) cboxStatus = "checked";
        else cboxStatus = "unchecked";
      } else if (cboxStatus == "checked") {
        if (!cbox.checked) {
          cboxStatus = "indeterminate";
          break;
        }
      } else if (cboxStatus == "unchecked") {
        if (cbox.checked) {
          cboxStatus = "indeterminate";
          break;
        }
      }
    }

    if (cboxStatus == "indeterminate") {
      if (elemCbox) elemCbox.indeterminate = true;
    } else if (cboxStatus == "checked") {
      if (elemCbox) {
        elemCbox.checked = true;
        elemCbox.indeterminate = false;
      }
    } else if (cboxStatus == "unchecked") {
      if (elemCbox) {
        elemCbox.checked = false;
        elemCbox.indeterminate = false;
      }
    }

    return cboxStatus;
  }

}
