const { ipcRenderer } = require("electron");
const fs = require("fs");
const fs_extra = require("fs-extra");
const path = require("path");

const convertButton = document.getElementById("convertButton");
const leftContainer = document.getElementById("leftContainer");
const listOfFiles = document.getElementById("listOfFiles");
// const pathDirectory = document.getElementById("path-directory")

let directoriesSelected = null;
let emptyList = true;
// let src_path = path.join(__dirname,'./testFile');

getPathDirectory = () => {
  let newInput = document.createElement("input");
  newInput.type = "file";
  newInput.webkitdirectory = "true";
  newInput.onchange = (_) => {
    let files = Array.from(newInput.files);
    const path = String(newInput.value);
    const indexOfLastSlash = path.lastIndexOf("\\");
    directorySelected = path.slice(0, indexOfLastSlash + 1);

    console.log("_", directorySelected);
    // console.log(path);
    // console.log(indexOfLastSlash);
    // console.log(directorySelected);
  };

  newInput.click();
};

const showReadFile = (directoriesSelected) => {
  //we check if there are already open files and if there are, we clear the list before adding other files
  if (!emptyList) listOfFiles.innerHTML = "";

  //foreach directory from selected path
  directoriesSelected.map((directory) => {
    // create and add new div
    const div = document.createElement("div");
    div.setAttribute("class", "container-element");

    const wrapperLabelNameFolder = document.createElement("div");
    wrapperLabelNameFolder.setAttribute("class", "wrapper-label-name-folder");

    const imageLabelNameFolder = document.createElement("img");
    imageLabelNameFolder.src = "./assets/folder.svg";
    imageLabelNameFolder.setAttribute("class", "image-label-name-folder");
    wrapperLabelNameFolder.append(imageLabelNameFolder);

    // create and add new li in files list
    const labelNameFolder = document.createElement("label");
    labelNameFolder.setAttribute("class", "label-name-folder");
    wrapperLabelNameFolder.append(labelNameFolder);
    div.append(wrapperLabelNameFolder);

    fs.readdir(directory, (err, files) => {
      files.forEach((file) => {
        fs.lstat(path.join(directory, file), async (err, stats) => {
          if (err) return console.log(err); //Handle error

          //manipulate the directory path to extract the name of folder
          const indexOfLastSlash = directory.lastIndexOf("\\");
          const folderName = directory.slice(indexOfLastSlash + 1);

          labelNameFolder.innerText = folderName.toString();

          // create and add new div
          const wrapperElements = document.createElement("wrapperElements");
          wrapperElements.setAttribute("class", "wrapper-elements");

          // create and add new checkbox
          const checkbox = document.createElement("input");
          checkbox.type = "checkbox";
          checkbox.setAttribute("class", "checkbox-input");

          // create and add new li in files list
          const item = document.createElement("li");
          item.setAttribute("class", "item-added");

          wrapperElements.append(checkbox);
          wrapperElements.append(item);
          div.append(wrapperElements);

          item.textContent = file.length < 30 ? file : file.slice(0, 30) + "...";
          listOfFiles.appendChild(div);
          emptyList = false;
        });
      });
    });
  });
};

const manipulateFile = () => {
  fs.readdir(directorySelected, (err, files) => {
    if (err) return console.error(err.message);

    files.forEach((file) => {
      fs.lstat(path.join(directorySelected, file), async (err, stats) => {
        if (err) return console.log(err); //Handle error

        // const item = document.createElement("li");
        // item.textContent = file;
        // listOfFiles.appendChild(item);

        if (stats.isFile()) {
          const newDirectory = file.split(".")[0].toString();

          fs_extra
            .copy(
              path.join(directorySelected, file.toString()),
              path.join(directorySelected, newDirectory + "\\" + file)
            )
            .then(() =>
              console.log(
                `File(s) copied to the destination" + " folder successfully`
              )
            )
            .catch((e) => console.log(e));

          // fs_extra.move(path.join(src_path, file.toString()) , path.join(src_path, newDirectory + '\\' + file ) , { overwrite: true })
          // .then(() =>console.log("File(s) moved to the destination" + " folder successfully"))
          // .catch((e) => console.log(e));
        }
      });
    });
  });
};

ipcRenderer.on("open-file", (event, result) => {
  directoriesSelected = result.directoriesSelected;
  showReadFile(directoriesSelected);
});

convertButton?.addEventListener("click", async () => {
  //   if (directorySelected !== '' && directorySelected !== null && directorySelected !== undefined) manipulateFile();
});
