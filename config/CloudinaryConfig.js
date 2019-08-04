const cloudinary = require('cloudinary').v2;
cloudinary.config(
    {
        cloud_name: 'dso2wjxjj',
        api_key: '339794676141491',
        api_secret: 'jx-qN3UhYw7kbfzc0IGwHVYgLEc'
    });

exports.uploads = (file) =>
{
    return new Promise(resolve =>
    {
        cloudinary.uploader.upload(file, (result) =>
        {
            resolve({url: result.url, id: result.public_id})
        }, {resource_type: "auto"})
    })
};