const URL = require("url").URL;

const stringIsAValidUrl = (s) => {
    try {
        new URL(s);
        return true;
    } catch (err) {
        return false;
    }
};

const getExtension = (filename) => {
    var parts = filename.split('.');
    return parts[parts.length - 1];
}

const isImage = (filename) => {
    var ext = getExtension(filename);
    switch (ext.toLowerCase()) {
        case 'jpg':
        case 'jpeg':
        case 'gif':
        case 'bmp':
        case 'png':
            //etc
            return true;
    }
    return false;
}

// const isVideo = (filename) => {
//     var ext = getExtension(filename);
//     switch (ext.toLowerCase()) {
//         case 'm4v':
//         case 'avi':
//         case 'mpg':
//         case 'mp4':
//             // etc
//             return true;
//     }
//     return false;
// }

module.exports = { stringIsAValidUrl, getExtension, isImage };