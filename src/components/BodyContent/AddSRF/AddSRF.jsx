import "./AddSRF.css";
import { Card, CheckboxToggle, Spinner, Input, DatePicker, Select } from "react-rainbow-components";
import { useContext, useEffect, useState } from "react";

import CustomDatePicker from "../../Inputs/CustomDatePicker";
import CustomLookup from "../../Inputs/CustomLookup";
import CompanyLookUp from "./CompanyLookUp";
import CustomButton from "../../Inputs/CustomButton";
import CustomInput from "../../Inputs/CustomInput";
import CustomTextArea from "../../Inputs/CustomTextArea";
import CustomSelect from "../../Inputs/CustomSelect";
import AddCompany from "../AddCompany/AddCompany";
import { useDispatch, useSelector } from "react-redux";
import { AuthContext } from "../../../context/auth-context";
import config from "../../../utils/config.json";
import { companiesActions } from "../../../store/companies";
import { notificationActions } from "../../../store/nofitication";
import ItemsList from "../ItemsList/ItemsList";
import { srfSchema } from "../../../Schemas/srf";
import { sidebarActions } from "../../../store/sidebar";
import { masterlistActions } from "../../../store/masterlist";
import { itemsActions } from "../../../store/items";
import { formattedDate } from "../../helpers/Helper";

const AddSRF = () => {

  const [srfdate, setSrfDate] = useState(new Date());
  const [company, setCompany] = useState("");
  const [contactperson, setContactPerson] = useState("");
  const [contactnumber, setContactNumber] = useState("");
  const [addcompanymodel, setAddCompanyModal] = useState(false);
  const [ruscflag, setRusc] = useState(true);
  const [department, setDepartment] = useState("");
  const [customerdc, setCustomerDC] = useState("");
  const [repcompany, setrepCompany] = useState();
  const [customerdcdate, setCustomerDcDate] = useState("");
  const [agreeddate, setagreedDate] = useState();
  const [srfno, setSRFNo] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [statementofconflag, setStatementofConFlag] = useState(false);
  const [statmentofconfirmity, setStatementofConfirmity] = useState("");
  const [uncertainityflag, setUncertainityFlag] = useState(false);
  const [issueno, setIssueNo] = useState("");
  const [issuedate, setIssueDate] = useState();
  const [amendno, setAmendNo] = useState("");
  const [amenddate, setAmendDate] = useState();
  const [sendsrf, setSendSRF] = useState(false);
  const [error, setError] = useState("");
  const [isLoaded, setIsLoaded] = useState(true);
  const [type, setType] = useState("I");
  const [dc_remarks, setDC_remarks] = useState("Returned after Calibration");
  const [returnable_material, setReturnable_material] = useState(false);

  const auth = useContext(AuthContext);
  const dispatch = useDispatch();
  const items = useSelector((state) => state.items.list);
  const companies = useSelector((state) => state.companies.list);

  const types = [
    { label: "I", value: "I" },
    { label: "N", value: "N" },
    { label: "S", value: "S" },
  ];

  // Error State
  const [companyErr, setCompanyErr] = useState("");
  const [srfNoErr, setSrfNoErr] = useState("");
  const [contactPersonNameErr, setContactPersonNameErr] = useState("");
  const [contactPersonNumberErr, setContactPersonNumberErr] = useState("");
  const [contactPersonEmail, setContactPersonEmail] = useState("");
  const [cutomerDCDateErr, setcutomerDCDateErr] = useState("");

  // Check if input error
  useEffect(() => {
    setError();
  }, [
    srfno,
    srfdate,
    company,
    contactperson,
    contactnumber,
    contactEmail,
    department,
    repcompany,
    customerdc,
    customerdcdate,
    agreeddate,
    statementofconflag,
    statmentofconfirmity,
    uncertainityflag,
    sendsrf,
    issueno,
    issuedate,
    amendno,
    amenddate,
  ]);

  // Fetch SRF Configuration
  const fetchSRFConfig = async () => {
    try {
      const data = await fetch(config.Calibmaster.URL + `/api/srf-config/fetch/${auth.labId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: "Bearer " + auth.token,
        },
      });

      let response = await data.json();
      const { result } = response;
      // console.log(result);

      if (result?.length > 0) {
        setIssueNo(result[0]?.issue_no);
        setAmendNo(result[0]?.amend_no);

        setIssueDate(new Date(result[0]?.issue_date));
        setAmendDate(new Date(result[0]?.amend_date));
      }

    } catch (error) {
      console.log(error);
    }
  }

  // Fetch Companies
  useEffect(() => {
    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify({ labId: auth.labId }),
    };

    fetch(config.Calibmaster.URL + "/api/customers/list", requestOptions)
      .then(async (response) => {
        const data = await response.json();
        dispatch(companiesActions.changecompanies(data.data));
      })
      .catch((err) => {
        const errornotification = {
          title: "Error while getting Companies!!",
          description: "Getting list of companies from server failed!!",
          icon: "error",
          state: true,
          timeout: 15000,
        };
        dispatch(notificationActions.changenotification(errornotification));

        setError("Error While Getting Companies");
      });

    fetchSRFConfig();
  }, []);

  const addCompanyHandler = () => {
    const isopen = addcompanymodel;
    setAddCompanyModal(!isopen);
  };

  //  Send SRF through Email Toggle Handler
  const sendsrfHandler = () => {
    const sendsrfl = sendsrf;
    setSendSRF(!sendsrfl);
  };

  // Report under Same Company Toggle Handler
  const ruscHandler = () => {
    const ruscnow = ruscflag;
    setRusc(!ruscnow);
  };

  //  Statement of confirmity Toggle
  const statmentofconfHandler = () => {
    const isset = statementofconflag;
    setStatementofConFlag(!isset);
  };

  // Uncertainty should be consider for the declaration of statement of the confirmity Toggle
  const uncertainityflagHandler = () => {
    const isset = uncertainityflag;
    setUncertainityFlag(!isset);
  };

  // Company 3 Address Handler 
  const companyAddressesHandler = (company) => {

    let fullAddress = "";

    if (company?.address1) {
      fullAddress = company?.address1;
    }
    if (company?.address2) {
      fullAddress = `${company?.address1}, ${company?.address2}`;
    }
    if (company?.address3) {
      fullAddress = `${company?.address1}, ${company?.address2}, ${company?.address3}`;
    }
    return fullAddress;
  }

  // Add SRF Handler Function
  const addsrfHandler = async () => {
    setIsLoaded(false);
    let reportcompany;

    if (ruscflag) {
      reportcompany = company;
    } else {
      if (repcompany) {
        reportcompany = repcompany;
      } else {
        setIsLoaded(true);
        setError("Report Company Not Selected");
        return;
      }
    }

    if (srfno == "" || !srfno) {
      setIsLoaded(true);
      setSrfNoErr("SRF Number is required !!!");
      return false;
    }

    if (!company || !reportcompany) {
      setIsLoaded(true);
      setCompanyErr("Company Not Selected");
      return;
    }

    if (contactperson == "") {
      setIsLoaded(true);
      setContactPersonNameErr("Contact Person Name is required");
      return;
    }

    if (contactnumber == "") {
      setIsLoaded(true);
      setContactPersonNumberErr("Contact Person Number is required");
      return;
    }

    if (contactEmail == "") {
      setIsLoaded(true);
      setContactPersonEmail("Contact Person Email is required");
      return;
    }

    if (customerdcdate == "") {
      setIsLoaded(true);
      setcutomerDCDateErr("Customer DC Date is required");
      return;
    }

    const newsrf = {
      srfno: parseInt(srfno),
      type: type,
      symbol: auth.symbol,
      date: srfdate,
      CompanyId: company.customer_id,
      contact_name: contactperson,
      contact_number: contactnumber,
      contact_email: contactEmail,
      department: department,
      reportcompanyId: reportcompany.customer_id,
      customer_dc: customerdc,
      customer_dc_date: customerdcdate,
      agreed_date: agreeddate,
      statement_of_confirmity_flag: statementofconflag,
      statement_of_confirmity: statmentofconfirmity,
      uncertainity_consider_flag: uncertainityflag,
      issue_no: issueno,
      issue_date: issuedate,
      amend_no: amendno,
      amend_date: amenddate,
      sendsrf,
      dc_remarks, returnable_material
    };

    const requestBody = {
      srf: newsrf,
      items: items,
      labId: auth.labId,
    };

    // return console.log(requestBody);

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer " + auth.token,
      },
      body: JSON.stringify(requestBody),
    };

    fetch(config.Calibmaster.URL + "/api/srf/add", requestOptions)
      .then(async (response) => {
        const data = await response.json();

        setIsLoaded(true);
        // return console.log(data);

        if (data.code === 201) {
          const newnotification = {
            title: "SRF Added Successfully!!",
            icon: "success",
            state: true,
            timeout: 15000,
          };
          setIsLoaded(true);
          dispatch(itemsActions.removeAllItem());
          dispatch(notificationActions.changenotification(newnotification));
          dispatch(sidebarActions.changesidebar("SRFs"));
        } else {
          setIsLoaded(true);
          const errornotification = {
            title: data.message,
            icon: "error",
            state: true,
            timeout: 15000,
          };
          dispatch(notificationActions.changenotification(errornotification));
        }
      })
      .catch((err) => {
        console.log(err);
        setIsLoaded(true);
        const errornotification = {
          title: "Error while Adding SRF!!",
          description: "Adding SRF Failed!!",
          icon: "error",
          state: true,
          timeout: 15000,
        };
        dispatch(notificationActions.changenotification(errornotification));
      });
  };

  return (
    <div className="add__srf__container">

      <div className="add__srf__form__container">
        <Card className="add__srf__card">

          {/* Title  */}
          <div className="add__srf__label">
            <h3>New SRF</h3>
          </div>

          {/* SRF Type */}
          <div className="add__srf__item__container">
            <CustomSelect
              options={types}
              onselect={(v) => setType(v)}
              label={"SRF Type"}
              required={true}
              value={type}
            />
          </div>

          {/* SRF Date */}
          <div className="add__srf__item__container">
            <CustomDatePicker
              label={"SRF Date"}
              setDate={(v) => setSrfDate(v)}
              date={srfdate}
              required={true}
            />
          </div>

          {/* SRF Number */}
          <div className="add__srf__item__container">
            <Input
              label="SRF Number"
              placeholder="SRF Number"
              type="number"
              required={true}
              onChange={(e) => {
                setSRFNo(e.target.value);
                setSrfNoErr("");
              }}
            />
            <span className="red center w_100">{srfNoErr}</span>
          </div>

          {/* Companies */}
          <div className="add__srf__item__container">
            <CompanyLookUp
              options={companies}
              onselect={(e) => { setCompany(e) }}
              setContactPerson={(e) => { setContactPerson(e) }}
              setContactNumber={(e) => { setContactNumber(e) }}
              setContactEmail={(e) => { setContactEmail(e) }}
              setCompanyErr={setCompanyErr}
              label={"Customer"}
              required={true}
            />
            <span className="red center w_100">{companyErr}</span>
          </div>

          {/* Company Address */}
          <div className="add__srf__item__container">
            <CustomTextArea
              label="Customer Address"
              value={companyAddressesHandler(company)}
              rows={5}
              required={true}
              disabled={true}
            />
          </div>

          {/* Contact Person Name */}
          <div className="add__srf__item__container">
            <Input
              label="Contact Person Name"
              placeholder="Contact Person Name"
              type="text"
              required={true}
              value={company ? company.customer_contact.contact_fullname : ""}
              onChange={(e) => {
                setContactPerson(e.target.value);
                setContactPersonNameErr("");
              }}
            />
            <span className="red center w_100">{contactPersonNameErr}</span>
          </div>

          {/* Contact Person Number */}
          <div className="add__srf__item__container">
            <Input
              label="Contact Person Number"
              placeholder="Contact Person Number"
              type="number"
              min={10}
              max={10}
              required={true}
              value={company ? company.customer_contact.contact_phone_1 : ""}
              onChange={(e) => {
                setContactNumber(e.target.value);
                setContactPersonNumberErr("");
              }}
            />
            <span className="red center w_100">{contactPersonNumberErr}</span>
          </div>

          {/* Contact Person Email */}
          <div className="add__srf__item__container">
            <Input
              label="Contact Person Email"
              placeholder="Contact Person Email"
              type="text"
              required={true}
              value={company ? company.customer_contact.contact_email : ""}
              onChange={(e) => {
                setContactEmail(e.target.value);
                setContactPersonEmail("")
              }}
            />
            <span className="red center w_100">{contactPersonEmail}</span>
          </div>

          {/* Send SRF through Email Toggle */}
          <div className="add__srf__item__container">
            <CheckboxToggle
              label="Send SRF through Email"
              value={sendsrf}
              onChange={sendsrfHandler}
            />
          </div>

          {/* Report under Same Company Toggle */}
          {/* 
            <div className="add__srf__item__container">
              <CheckboxToggle
                label="Report under Same Company"
                value={ruscflag}
                onChange={ruscHandler}
              />
            </div> 
          */}

          {/* Report Company Name */}
          {!ruscflag ? (
            <div className="add__srf__item__container">
              <CustomLookup
                options={companies}
                onselect={(v) => setrepCompany(v)}
                label={"Report Company Name"}
                required={true}
              />
            </div>
          ) : null}

          {/* Report Company Address */}
          {!ruscflag ? (
            <div className="add__srf__item__container">
              <CustomTextArea
                label="Report Company Address"
                value={
                  repcompany
                    ? repcompany.address1 +
                    ", " +
                    repcompany.address2 +
                    ", " +
                    repcompany.address3
                    : ""
                }
                rows={5}
                required={true}
                disabled={true}
              />
            </div>
          ) : null}

          {/* Department */}
          <div className="add__srf__item__container">
            <CustomInput
              label="Department"
              value={department}
              type="text"
              onchange={(v) => setDepartment(v)}
            />
          </div>

          {/* Customer DC No */}
          <div className="add__srf__item__container">
            <CustomInput
              label="Customer DC No"
              value={customerdc}
              type="text"
              onchange={(v) => setCustomerDC(v)}
            />
          </div>

          {/* Customer DC Date */}
          <div className="add__srf__item__container">
            <DatePicker
              label={"Customer DC Date"}
              date={customerdcdate}
              value={customerdcdate}
              required={true}
              maxDate={srfdate}
              formatStyle="medium"
              locale="en-IN"
              onChange={(v) => {
                setCustomerDcDate(formattedDate(v));
                setcutomerDCDateErr("");
              }}
            />
            <span className="red center w_100">{cutomerDCDateErr}</span>
          </div>

          {/* Agreed Date of Completion */}
          <div className="add__srf__item__container">
            <CustomDatePicker
              label={"Agreed Date of Completion"}
              setDate={(v) => setagreedDate(v)}
              date={agreeddate}
              minDate={srfdate}
            />
          </div>

          {/* Statement of confirmity Toggle */}
          <div className="add__srf__item__container">
            <CheckboxToggle
              label="Statement of confirmity"
              value={statementofconflag}
              onChange={statmentofconfHandler}
            />
          </div>

          {/* Statement of Confirmity */}
          {statementofconflag ? (
            <div className="add__srf__item__container">
              <CustomTextArea
                label="Statement of Confirmity"
                value={statmentofconfirmity}
                onchange={(v) => setStatementofConfirmity(v)}
                rows={5}
                required={true}
                disabled={false}
              />
            </div>
          ) : null}

          {/* Uncertainty should be consider for the declaration of statement of the confirmity Toggle */}
          <div className="add__srf__item__container">
            <CheckboxToggle
              label="Uncertainty should be consider for the declaration of statement of the confirmity"
              value={uncertainityflag}
              onChange={uncertainityflagHandler}
            />
          </div>

          {/* Issue No */}
          <div className="add__srf__item__container">
            <CustomInput
              label="Issue No"
              value={issueno}
              type="text"
              onchange={(v) => setIssueNo(v)}
            />
          </div>

          {/* Issue Date */}
          <div className="add__srf__item__container">
            <CustomDatePicker
              label={"Issue Date"}
              setDate={(v) => setIssueDate(v)}
              date={issuedate}
            />
          </div>

          {/* Amend No */}
          <div className="add__srf__item__container">
            <CustomInput
              label="Amend No"
              value={amendno}
              type="text"
              onchange={(v) => setAmendNo(v)}
            />
          </div>

          {/* Amend Date */}
          <div className="add__srf__item__container">
            <CustomDatePicker
              label={"Amend Date"}
              setDate={(v) => setAmendDate(v)}
              date={amenddate}
            />
          </div>

          <p className="red center w_100">{error}</p>
        </Card>
      </div>

      <ItemsList addsrf={addsrfHandler} isLoaded={isLoaded}/>

      {!isLoaded ? <Spinner size="medium" /> : null}
    </div>
  );
};

export default AddSRF;
