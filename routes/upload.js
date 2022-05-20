var express = require('express');
var router = express.Router();

const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: 'uploads',
	filename: (req, file, cb) => {
		cb(null, '/' + file.fieldname + '-' + Date.now() + path.extname(file.originalname));
	}
});

module.exports.upload = multer({
	storage: storage,
	limits: { fileSize: 10000000 },
	fileFilter: (req, file, cb) => {
		checkFileType(file, cb);
	}
}).single('uploaded_file');

let checkFileType = (file, cb) => {
	const fileTypes = /jpeg|jpg|png|gif/;
	const extname = fileTypes.test(path.extname(file.originalname).toLocaleLowerCase());
	const mimetype = fileTypes.test(file.mimetype)

	if (extname && mimetype) {
		return (cb(null, true))
	} else {
		cb(`Error: fle was not of type 'jpeg','jpg','png' or 'gif'`);
	}
}
