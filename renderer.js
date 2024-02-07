const spinner = document.getElementById("spinner");
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

const onOffSpinner = (toggle = Boolean) => {
  console.log(toggle);
  if (toggle) spinner.setAttribute("class", "spinner-on");
  if (!toggle) spinner.setAttribute("class", "spinner-off");
};

const ReadFile = async (directoriesSelected, callback) => {
  //we check if there are already open files and if there are, we clear the list before adding other files
  spinner.classList.replace("spinner-off", "spinner-on");
  // create and add new div
  const div = document.createElement("div");
  div.setAttribute("class", "container-element");
  // if (!emptyList) listOfFiles.innerHTML = "";

  //foreach directory from selected path
  directoriesSelected.map((directory) => {
    const wrapperLabelNameFolder = document.createElement("div");
    wrapperLabelNameFolder.setAttribute("class", "wrapper-label-name-folder");

    // create img element,assign an image and add the element in files list
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
      files.map(async(file) => {
        fs.lstat(path.join(directory, file), (err, stats) => {
          // console.log(directory + "  =>  " + file);
          if (err) return console.log(err); //Handle error

          //manipulate the directory path to extract the name of folder
          const indexOfLastSlash = directory.lastIndexOf("\\");
          const folderName = directory.slice(indexOfLastSlash + 1);

          labelNameFolder.innerText = folderName.toString();

          if (stats.isFile()) {
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

            item.textContent =
              file.length < 30 ? file : file.slice(0, 30) + "...";
            listOfFiles.appendChild(div);
          }

          if (stats.isDirectory()) {
            ReadFile([directory + "\\" + file]);
          }
        });
      });
    })
  });
};

const manipulateFile = () => {
  fs.readdir(directoriesSelected, (err, files) => {
    if (err) return console.error(err.message);
    console.log(files);
    files.forEach((file) => {
      fs.lstat(path.join(directoriesSelected, file), async (err, stats) => {
        if (err) return console.log(err); //Handle error

        // const item = document.createElement("li");
        // item.textContent = file;
        // listOfFiles.appendChild(item);

        if (stats.isFile()) {
          const newDirectory = file.split(".")[0].toString();

          fs_extra
            .copy(
              path.join(directoriesSelected, file.toString()),
              path.join(directoriesSelected, newDirectory + "\\" + file)
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

function start(startFunc, callback) {
  startFunc();
}

ipcRenderer.on("open-file", async (event, result) => {
  directoriesSelected = result.directoriesSelected;
  ReadFile(directoriesSelected);
});

convertButton?.addEventListener("click", async () => {
  // if (directoriesSelected !== '' && directoriesSelected !== null && directoriesSelected !== undefined) manipulateFile();
});
// spinner.classList.replace("spinner-on","spinner-off")

// const getPathDirectory = () => {
//   let newInput = document.createElement("input");
//   newInput.type = "file";
//   newInput.webkitdirectory = "true";
//   newInput.onchange = (_) => {
//     let files = Array.from(newInput.files);
//     const path = String(newInput.value);
//     const indexOfLastSlash = path.lastIndexOf("\\");
//     directorySelected = path.slice(0, indexOfLastSlash + 1);

//     console.log("_", directorySelected);
//     // console.log(path);
//     // console.log(indexOfLastSlash);
//     // console.log(directorySelected);
//   };

//   newInput.click();
// };
