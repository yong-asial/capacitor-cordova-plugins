

const getLocation = function() {
    const suc = function(p) {
        alert(p.coords.latitude + " " + p.coords.longitude);
    };
    const locFail = function() {
    };
    navigator.geolocation.getCurrentPosition(suc, locFail);
};

const vibrate = function() {
    navigator.vibrate(500);
};

const preventBehavior = function(e) {
    e.preventDefault();
};

function dump_pic(data) {
    const viewport = document.getElementById('viewport');
    viewport.style.display = "";
    viewport.style.position = "absolute";
    viewport.style.top = "10px";
    viewport.style.left = "10px";
    document.getElementById("test_img").src = "data:image/jpeg;base64," + data;
}

function fail(msg) {
    alert(msg);
}

function show_pic() {
    navigator.camera.getPicture(dump_pic, fail, {
        quality : 50,
        destinationType: Camera.DestinationType.DATA_URL,
        targetWidth: 100,
        targetHeight: 100
    });
}

function close() {
    const viewport = document.getElementById('viewport');
    viewport.style.position = "relative";
    viewport.style.display = "none";
}

function check_network() {
    const networkState = navigator.connection.type;

    const states = {};
    states[Connection.UNKNOWN]  = 'Unknown connection';
    states[Connection.ETHERNET] = 'Ethernet connection';
    states[Connection.WIFI]     = 'WiFi connection';
    states[Connection.CELL_2G]  = 'Cell 2G connection';
    states[Connection.CELL_3G]  = 'Cell 3G connection';
    states[Connection.CELL_4G]  = 'Cell 4G connection';
    states[Connection.CELL]     = 'Cell generic connection';
    states[Connection.NONE]     = 'No network connection';

    confirm('Connection type:\n ' + states[networkState]);
}

function onBatteryStatus(status) {
    if (status) {
        document.getElementById("battery").innerHTML = status.level + "%" + (status.isPlugged ? ' (charging)' : '');
    }
}

// file-plugin
let globalFileEntry;

function onErrorFile(error) {
    console.log(error);
}

function onFileWrite() {
    function writeFile(fileEntry, dataObj) {
        console.log('writeFile');
        fileEntry.createWriter(function (fileWriter) {
            fileWriter.onwriteend = function() {
                alert("Successful file write...");
            };
            fileWriter.onerror = function (e) {
                alert("Failed file write: " + e.toString());
            };
            if (!dataObj) {
                const data = (new Date()).toString();
                dataObj = new Blob([data], { type: 'text/plain' });
            }
            fileWriter.write(dataObj);
        });
    }
    function createFile(dirEntry, fileName, isAppend) {
        // Creates a new file or returns the file if it already exists.
        console.log('createFile');
        dirEntry.getFile(fileName, {create: true, exclusive: false}, function(fileEntry) {
            globalFileEntry = fileEntry; // for reading later
            writeFile(fileEntry, null, isAppend);
        }, onErrorFile);
    }


    window.requestFileSystem(window.TEMPORARY, 5 * 1024 * 1024, function (fs) {
        console.log('file system open: ' + fs.name);
        createFile(fs.root, "newTempFile.txt", true);
    }, onErrorFile);
}

function onFileRead() {
    if (!globalFileEntry) {
        alert('please write file first');
        return;
    }
    function readFile(fileEntry) {
        fileEntry.file(function (file) {
            const reader = new FileReader();
            reader.onloadend = function() {
                console.log("Successful file read: " + this.result);
                alert(fileEntry.fullPath + ": " + this.result);
            };
            reader.readAsText(file);
        }, onErrorFile);
    } 
    readFile(globalFileEntry);
}

// media capture
let globalAudioPath;

function onSuccessMedia(mediaFiles) {
    let i, fullPath, len;
    for (i = 0, len = mediaFiles.length; i < len; i += 1) {
        fullPath = mediaFiles[i].fullPath;
        // save audio path for later use
        if (mediaFiles[i] && mediaFiles[i].type && mediaFiles[i].type.includes("audio")) {
            if (cordova.platformId == 'android') {
                globalAudioPath = mediaFiles[i].fullPath;
            } else {
                globalAudioPath = mediaFiles[i].localURL;
            }
            console.log('save audio', globalAudioPath);
        }
        console.log(JSON.stringify(mediaFiles));
    }
    if (fullPath) {
        alert('saved here ' + fullPath);
    }
}

function onErrorMedia(error) {
    alert('Error code: ' + error.code);
}

function onMediaCaptureImage() {
    const options = {
        limit: 1
    };
    navigator.device.capture.captureImage(onSuccessMedia, onErrorMedia, options);
}

function onMediaCaptureAudio() {
    globalAudioPath = null;
    const options = {
        limit: 1,
        duration: 10
    };
    navigator.device.capture.captureAudio(onSuccessMedia, onErrorMedia, options);
}

function onMediaCaptureVideo() {
   const options = {
      limit: 1,
      duration: 10
   };
   navigator.device.capture.captureVideo(onSuccessMedia, onErrorMedia, options);
}

function onScreenOrientation() {
    alert('Orientation is ' + screen.orientation.type);
}

function onDialog() {
    function alertDismissed() {
        alert('You dismissed the alert!');
    }
    
    navigator.notification.alert(
        'You are the winner!',  // message
        alertDismissed,         // callback
        'Game Over',            // title
        'Done'                  // buttonName
    );
}

function onMedia() {
    if (!globalAudioPath) {
        alert('please record voice first');
        return;
    }
    const my_media = new Media(globalAudioPath,
        // success callback
        function() {
            console.log("playAudio():Audio Success");
        },
        // error callback
        function(err) {
            console.log("playAudio():Audio Error: ");
            console.log(JSON.stringify(err));
    });
    my_media.play();
}

const deviceInfo = function() {
    console.log("Monaca is ready");
    document.getElementById("platform").innerHTML = device.platform;
    document.getElementById("version").innerHTML = device.version;
    document.getElementById("uuid").innerHTML = device.uuid;
    document.getElementById("name").innerHTML = device.model;
    document.getElementById("width").innerHTML = screen.width;
    document.getElementById("height").innerHTML = screen.height;
    document.getElementById("colorDepth").innerHTML = screen.colorDepth;
    // register events
    window.addEventListener("batterystatus", onBatteryStatus, false);
};

function init() {
    document.addEventListener("deviceready", deviceInfo, true);
}
