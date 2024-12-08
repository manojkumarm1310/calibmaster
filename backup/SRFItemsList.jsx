await fetch(config.Calibmaster.URL + "/api/delivery-challan/create", requestOptions)
    .then(response => response.blob())
    .then(blob => {
        let base64String;

        let reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            base64String = reader.result;
            const fileName = "delivery-challan-" + new Date().getTime() + ".pdf";
            const aTag = document.createElement('a');
            aTag.href = base64String;
            aTag.setAttribute('download', fileName);
            document.body.appendChild(aTag);
            aTag.click();
            aTag.remove();
        };
        closeDCModalHandler();
    })
    .catch((err) => {
        console.log(err);
        const errNotification = {
            title: data?.message,
            icon: "error",
            state: true,
            timeout: 15000,
        };
        dispatch(notificationActions.changenotification(errNotification));
        setloading(false);
    });