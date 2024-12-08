// *** bad code ***
const requestOptions1 = {
  method: "POST",
  headers: {
    Authorization: "Bearer " + auth.token,
  },
  body: data,
};
fetch(config.CustomerPortal.URL + "/api/certificate/upload", requestOptions1)
  .then(async (response) => {
    const data = await response.json();
    const code = data.code;
    if (code !== 200) {
      setNewFileError(data.message);
    } else {
      setNewFileMessage(data.message);
    }
  })
  .catch((err) => {
    console.log(err);
  });