export const filterbyId = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.id);
  });
};

export const filterbysrfNo = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.srfId);
  });
};

export const filterbyName = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.name);
  });
};

export const filterbyEmail = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.email);
  });
};

export const filterbyDepartment = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.department);
  });
};

export const filterbycustomerDC = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.customer_dc);
  });
};

export const filterbyCompanyName = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.Company.companyname);
  });
};
export const filterbyCustomerName = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.contact_name);
  });
};

export const filterbyIdNo = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.idno);
  });
};

export const filterbySerialNo = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.serialno);
  });
};

export const filterbyDispatchDC = (query, options) => {
  return options.filter((item) => {
    const regex = new RegExp(query, "i");
    return regex.test(item.dispatch_dc);
  });
};
