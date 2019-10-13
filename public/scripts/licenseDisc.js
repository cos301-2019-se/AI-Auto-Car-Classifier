function getLicenseDisc()
{

}

function handleFiles(f)
{
    var img = $('img');
    img[0].src = URL.createObjectURL(f.target.files[0]);
}

function scanLicenseDisc(imageUrl)
{
    $.ajax({
        method: "POST",
        url: "/classify/scan_license_disc",
        data:
            {
                imageURL: imageUrl
            },
        success: function (res)
        {
            if(res.status === "success")
            {
                console.log("Disc: " + res.licenseDisc);
                if( res.licenseDisc.includes("%"))
                {
                    var disc = parseRawInfo(res.licenseDisc);
                    setLicenseDiscDetails(disc);
                }
                else
                {
                    displayError("Unable to scan disc");
                    clearLoadingImages();
                }
            }
            else
            {
                displayError("Unable to scan disc");
                clearLoadingImages();
            }



        },
        error: function (jqXHR, exception)
        {
            console.log("Error in getting Car: " + jqXHR.status);
        },
        beforeSend: function (xhr)
        {
            xhr.setRequestHeader("Authorization", "Bearer " + localStorage.getItem("authToken"));
        }
    });
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
        {
            licenseNum: licenseNo,
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

