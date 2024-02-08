const spinner = document.getElementById("spinner");
const { ipcRenderer } = require("electron");
const fs = require("fs");
const { readdir } = require("node:fs/promises");
const fs_extra = require("fs-extra");
const path = require("path");
const glob = require("glob");

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

const ReadFile = (directoriesSelected) => {
  //we check if there are already open files and if there are, we clear the list before adding other files
  spinner.classList.replace("spinner-off", "spinner-on");
  let copyDirectoriesSelected = directoriesSelected.length;
  // create and add new div
  console.log("folder", directoriesSelected);

  const div = document.createElement("div");
  div.setAttribute("class", "container-element");
  // if (!emptyList) listOfFiles.innerHTML = "";

  //foreach directory from selected path
  directoriesSelected.map((directory) => {
    console.log("dir", directory);
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
      files.map(async (file) => {
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
    });
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

function start(source) {
  console.log("loading start");
  spinner.classList.replace("spinner-off", "spinner-on");
  return new Promise((resolve, reject) => {
    console.log("loaded data");
    resolve(ReadFile(source));
  });
}

const addNewDirectory = (folderName) => {
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
  labelNameFolder.innerText = folderName.toString();

  return wrapperLabelNameFolder;
};

const addNewFile = (fileName) => {
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

  item.textContent =
    fileName.length < 30 ? fileName : fileName.slice(0, 30) + "...";

  return wrapperElements;
};

ipcRenderer.on("open-file", async (event, result) => {
  directoriesSelected = result.directoriesSelected;

  // const container = document.createElement("div");
  // container.setAttribute("class", "container-element");
  // listOfFiles.appendChild(container);

readAllFile(directoriesSelected);
  // ReadFile(result.directoriesSelected)
  // spinner.classList.replace("spinner-on", "spinner-off");
  // console.log("loading finished");
});

function readAllFile(directoriesSelected) {

  directoriesSelected.forEach(directory => {
    
    const files = fs.readdirSync(directory)
    console.log('files',files);
    const folders = files.filter( file => {fs.lstatSync(path.resolve(directory,file)).isDirectory()})

    const innerDirectory = folders.map(folder => path.resolve(directory,folder));
    console.log('innerDirectory',innerDirectory);

    if(innerDirectory.length === 0)return

    innerDirectory.forEach(innerFile => console.log('innerFile',innerFile))

    
    readAllFile(innerDirectory);

  });

}


const readFiles = async (directoriesSelected) => {
  try {
    directoriesSelected.map(async (directory) => {
      const indexOfLastSlash = directory.lastIndexOf("\\");
      const firstFolderName = directory.slice(indexOfLastSlash + 1);
      container.append(addNewDirectory(firstFolderName));

      const files = await readdir(directory.toString());
      files.map((file) => {
        fs.lstat(path.join(directory.toString(), file), (err, stats) => {
          // const indexOfLastSlash = directory.lastIndexOf("\\");
          // const firstFolderName = directory.slice(indexOfLastSlash + 1);

          if (stats.isFile() && !file.toString().includes("\\")) {
            container.append(addNewFile(file.toString()));
            console.log(file.toString());
          }

          if (stats.isDirectory()) {
            //manipulate the directory path to extract the name of folder
            const indexOfLastSlash = file.lastIndexOf("\\");
            const folderName = file.slice(indexOfLastSlash + 1);
            console.log(folderName);
            readFiles([path.join(directory.toString(), file)]);
          }
        });
      });
    });
  } catch (err) {
    console.error(err);
  }
};
// readFiles(directoriesSelected);
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
