const spinner = document.getElementById("spinner");
const { ipcRenderer } = require("electron");
const fs = require("fs");
const { readdir } = require("node:fs/promises");
const fs_extra = require("fs-extra");
const path = require("path");
const { join } = require("path");

const convertButton = document.getElementById("convertButton");
const leftContainer = document.getElementById("leftContainer");
const listOfFiles = document.getElementById("listOfFiles");
let listOfFilesToCopy = [];

let loading = false;

const onOffSpinnerEvent = (toggle = Boolean) => {
  if (toggle) spinner.classList.replace("spinner-off", "spinner-on");
  else spinner.classList.replace("spinner-on", "spinner-off");
};

const container = document.createElement("div");
container.setAttribute("class", "container-element");
listOfFiles.appendChild(container);

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

const addNewFile = (fileName, path = null) => {
  const wrapperElements = document.createElement("wrapperElements");
  wrapperElements.setAttribute("class", "wrapper-elements");

  // create and add new input checkbox
  const checkbox = document.createElement("input");
  checkbox.value = path;
  checkbox.addEventListener("change", async (e) => {
    listOfFilesToCopy.push(e.target.value);
  });
  checkbox.type = "checkbox";
  checkbox.setAttribute("class", "checkbox-input");

  // create and add new li in files list
  const item = document.createElement("li");
  item.setAttribute("class", "item-added");

  wrapperElements.append(checkbox);
  wrapperElements.append(item);

  item.textContent = fileName; // fileName.length < 30 ? fileName : fileName.slice(0, 30) + "...";

  return wrapperElements;
};

function readAllFile(directoriesSelected) {
  directoriesSelected.forEach((directory) => {
    const indexOfLastSlash = directory.lastIndexOf("\\");
    const folderName = directory.slice(indexOfLastSlash + 1);
    container.append(addNewDirectory(folderName));

    const res = fs.readdirSync(directory);

    const folders = res.filter((file) =>
      fs.lstatSync(path.resolve(directory, file)).isDirectory()
    );
    res.map((file) => {
      if (fs.lstatSync(path.resolve(directory, file)).isFile()) {
        container.append(addNewFile(file, path.resolve(directory, file)));
      }
    });

    const innerDirectory = folders.map((folder) =>
      path.resolve(directory, folder)
    );

    if (innerDirectory.length === 0) {
      return;
    }

    // innerDirectory.forEach(innerFile => console.log('innerFile', innerFile))

    readAllFile(innerDirectory);
  });
}

const readAllFileAsync = async (directoriesSelected) => {
  loading = true;
  onOffSpinnerEvent(loading);
  listOfFilesToCopy.length = 0;
  // container.innerHTML = "";

  let innerDirectory = [];
  directoriesSelected.map(async (directory) => {
    const indexOfLastSlash = directory.lastIndexOf("\\");
    const folderName = directory.slice(indexOfLastSlash + 1);
    container.append(addNewDirectory(folderName));

    const files = await readdir(directory.toString(), { withFileTypes: true });

    files.map((file) => {
      const path = join(directory.toString(), file.name);
      // console.log("file", file);

      if (file.isFile()) container.append(addNewFile(file.name, path));
      if (file.isDirectory()) innerDirectory.push(path);
    });

    // const folders = files.filter((file) => file.isDirectory());

    // innerDirectory = folders.map((folder) => join(folder.path, folder.name));

    console.log("innerDirectory", innerDirectory);

    if (innerDirectory.length === 0) {
      return;
    }
    await readAllFileAsync(innerDirectory);
  });
};

ipcRenderer.on("open-file", async (event, result) => {
  loading = true;
  onOffSpinnerEvent(loading);

  // result.directoriesSelected.map(async (path) => await readAllFileAsync(path));
  // readAllFile(result.directoriesSelected);
  await readAllFileAsync(result.directoriesSelected);

  loading = false;
  onOffSpinnerEvent(loading);
});

convertButton?.addEventListener("click", async () => {
  console.log(listOfFilesToCopy);
  // if (directoriesSelected !== '' && directoriesSelected !== null && directoriesSelected !== undefined) manipulateFile();
});
