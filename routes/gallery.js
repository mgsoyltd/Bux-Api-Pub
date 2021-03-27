const express = require("express");
const router = express.Router();
const fs = require('fs');

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { validateKey } = require("../middleware/apikeys");
const utils = require("../src/utils");

global.appRoot = path.resolve(__dirname);
const imageDir = global.appRoot + '/public/images/';

router.get("/", [validateKey, auth], async (req, res) => {

    const imageUrl = `${req.connection.encrypted ? "https" : "http"}://${req.headers.host}/images/`;

    getImages(imageDir, function (err, files) {
        if (err) {
            console.log(err);
            res.writeHead(204, { 'Content-type': 'text/html' })
            console.log(err);
            return res.end("No images found");
        }
        let imageLists = '<ul style="padding: 0; margin: 0;">';
        for (let i = 0; i < files.length; i++) {
            imageLists += `<li style="list-style-type: none;"><a href="${imageUrl}${files[i]}"><img src="${imageUrl}${files[i]}"></li>`;
        }
        imageLists += '</ul>';
        res.writeHead(200, { 'Content-type': 'text/html' });
        res.end(imageLists);
    });
});

router.get("/:id", [validateKey, auth], async (req, res) => {

    // Read the image using fs and send the image content back in the response
    fs.readFile(imageDir + req.params.id, function (err, content) {
        if (err) {
            res.writeHead(400, { 'Content-type': 'text/html' })
            console.log(err);
            res.end("No such image");
        } else {
            const file = content;
            let imageLists = '<ul style="padding: 0; margin: 0;">';
            imageLists += `<li style="list-style-type: none;"><img src="${imageUrl}${file}"></li>`;
            imageLists += '</ul>';
            res.writeHead(200, { 'Content-type': 'text/html' });
            res.end(imageLists);
        }
    });
});

// Delete an image
router.delete("/:id", [validateKey, auth, admin], async (req, res) => {
    // Read the image using fs and delete it
    const file = imageDir + req.params.id;
    console.log("File to delete:", file);
    fs.readFile(file, function (err, content) {
        if (err) {
            res.writeHead(400, { 'Content-type': 'text/html' })
            console.log(err);
            res.end("No such image");
        } else {
            fs.unlink(file, (err => {
                if (err) {
                    res.writeHead(400, { 'Content-type': 'text/html' })
                    console.log(err);
                    res.end("No such image");
                }
                else {
                    console.log(`Image ${file} deleted successfully.`);
                    res.writeHead(200, { 'Content-type': 'text/html' });
                    res.end(`Image ${file} deleted successfully.`);
                }
            }));
        }
    });
});

module.exports = router;

// Get the list of supported image files in the image dir
function getImages(imageDir, callback) {
    var files = [], i;
    fs.readdir(imageDir, function (err, list) {
        for (i = 0; i < list.length; i++) {
            if (utils.isImage(list[i])) {
                files.push(list[i]); //store the file name into the array files
            }
        }
        callback(err, files);
    });
}