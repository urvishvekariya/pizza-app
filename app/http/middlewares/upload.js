const aws = require("aws-sdk");
const multer = require("multer");
const multerS3 = require("multer-s3");

const s3 = new aws.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY,
    secretAccessKey: process.env.AWS_S3_SECRET_KEY,
    region: process.env.AWS_S3_BUCKET_REGION,

});

function uploadFile(req, res, next) {

    const multerFilter = (req, file, cb) => {
        if (file.mimetype.split("/")[1] === "jpg" || file.mimetype.split("/")[1] === "jpeg" || file.mimetype.split("/")[1] === "png") {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg and .jpeg format allowed!"));
        }
    };

    //Calling the "multer" Function
    const upload = multer({
        fileFilter: multerFilter,
        storage: multerS3({
            s3,
            bucket: process.env.AWS_S3_BUCKET_NAME,
            metadata: function (req, file, cb) {
                cb(null, { fieldName: file.fieldname });
            },
            key: function (req, file, cb) {
                const ext = file.mimetype.split("/")[1];
                cb(null, `image-${Date.now()}.${ext}`);
            },
        }),
    }).single('iimage')

    upload(req, res, function (err) {

        const { iname, iprice, isize } = req.body
        if (err instanceof multer.MulterError) {

            // A Multer error occurred when uploading.
            req.flash('error', 'Please select a proper image')
            if (req.params.id) {
                return res.redirect('/admin/product/update/' + req.params.id)
            }

            return res.redirect('/admin/product')
        } else if (err) {
            // An unknown error occurred when uploading.
            req.flash('error', 'Please select a proper image')
            if (req.params.id) {
                return res.redirect('/admin/product/update/' + req.params.id)
            }

            return res.redirect('/admin/product')
        }
        if (!req.params.id) {
            if (typeof req.file === "undefined") {
                req.flash('error', 'All fields are required')
                req.flash('iname', iname)
                req.flash('iprice', iprice)
                req.flash('isize', isize)
                if (req.params.id) {
                    return res.redirect('/admin/product/update/' + req.params.id)
                }
                return res.redirect('/admin/product')
            }
        }

        next()
    })
}



module.exports = uploadFile