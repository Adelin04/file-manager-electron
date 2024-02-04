const { ipcRenderer } = require("electron");
const fs = require("fs");
const fs_extra = require("fs-extra");
const path = require("path");

const convertButton = document.getElementById("convertButton");
const leftContainer = document.getElementById("leftContainer");
const listOfFiles = document.getElementById("listOfFiles");
// const pathDirectory = document.getElementById("path-directory")

let directorySelected = null;
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

    console.log(path);
    console.log(indexOfLastSlash);
    console.log(directorySelected);
  };

  newInput.click();
};

const showReadFile = (directorySelected) => {
  fs.readdir(directorySelected, (err, files) => {
    files.forEach((file) => {
      fs.lstat(path.join(directorySelected, file), async (err, stats) => {
        if (err) return console.log(err); //Handle error

        // create and add new li in files list
        const item = document.createElement("li");
        item.textContent = file;
        listOfFiles.appendChild(item);
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
        console.log(file);

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
  directorySelected = result.directorySelected;
  showReadFile(directorySelected);
});

convertButton?.addEventListener("click", async () => {
  //   if (directorySelected !== '' && directorySelected !== null && directorySelected !== undefined) manipulateFile();
});
