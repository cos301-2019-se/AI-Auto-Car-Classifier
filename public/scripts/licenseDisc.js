function getLicenseDisc()
{

}

function handleFiles(f)
{
    var img = $('img');
    img[0].src = URL.createObjectURL(f.target.files[0]);
}

function scanLicenseDisc(image)
{
    var
        canvas = document.createElement('canvas'),
        canvas_context = canvas.getContext('2d'),
        source,
        binarizer,
        bitmap;

    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    canvas_context.drawImage(image, 0, 0, canvas.width, canvas.height);

    try
    {
        source = new ZXing.BitmapLuminanceSource(canvas_context, image);
        binarizer = new ZXing.Common.HybridBinarizer(source);
        bitmap = new ZXing.BinaryBitmap(binarizer);

        var result = ZXing.PDF417.PDF417Reader.decode(bitmap, null, false);


        console.log("Text: " + JSON.stringify(result[0].Text));

        return parseRawInfo(result[0].Text);
    }
    catch (err)
    {
        console.log("Unable to scan disc: " + err);
        return null;
    }
}

function parseRawInfo(raw)
{
    let arr = raw.split('%');

   let licenseNo = arr[5];
   let plate = arr[6];
   let regNum = arr[7];
   let body = arr[8];
   let make = arr[9];
   let model = arr[10];
   let colour = arr[11].split('/')[0];
   let vin = arr[12];
   let engineNum = arr[13];
   let expiryDate = arr[14];

   let disc =
       { licenseNum: licenseNo,
           numberPlate: plate,
           registerNum: regNum,
           bodyType: body,
           make: make,
           model: model,
           colour: colour,
           vin: vin,
           engineNum: engineNum,
           expiryDate: expiryDate

       };


   return disc;

}

