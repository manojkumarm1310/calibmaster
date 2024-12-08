import React, { useEffect, useState, useRef } from 'react'
import { Button, FileSelector } from 'react-rainbow-components';
import alphabet from '../procedureHelpers/alphabet';
import config from "../../../../utils/config.json";

const ExistVerticalTable = ({ fromId, setArraydata, eachItem, eachBodyArray, unique_id, deleteTable }) => {

  const divOneRef = useRef(null);
  const divTwoRef = useRef(null);
  const [divOneWidth, setDivOneWidth] = useState(0);

  const [isSet, setIsSet] = useState(false);
  const [rows, setRows] = useState(parseInt(eachItem?.rows)); // Initial rows
  const [columns, setColumns] = useState(parseInt(eachItem?.columns)); // Initial columns

  const [headerTexts, setHeaderTexts] = useState(eachItem?.header_texts); // Header input values
  const [secondRowHeaders, setSecondRowHeaders] = useState(eachItem?.second_row_headers); // Second row header input values
  const [headerTypes, setHeaderTypes] = useState(eachItem?.header_types); // Dropdown values

  const [tablePrefix, setTablePrefix] = useState('');

  const [cellTexts, setCellTexts] = useState(eachBodyArray); // Cell input values

  const [printOnCertificate, setPrintOnCertificate] = useState(eachItem?.print_on_certifcate);
  const [tableImage, setTableImage] = useState(eachItem?.procedure_image_filename);

  const [isProcedureImage, setIsProcedureImage] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);
  const [imageFilesErr, setImageFilesErr] = useState(false);

  const containerStyles = {
    maxWidth: 300,
    maxHeight: 30
  };

  useEffect(() => {
    if (divOneRef.current && divTwoRef.current) {
      const width = divOneRef.current.offsetWidth;
      setDivOneWidth(width);
      divTwoRef.current.style.width = `${width}px`;
    }
  }, [divOneWidth]);

  useEffect(() => {
    const getFirstIndex = eachBodyArray[0];
    const getFirstObjectKey = Object.keys(getFirstIndex)[0];
    const getPrefix = getFirstObjectKey.slice(0, 2);
    setTablePrefix(getPrefix);
  }, []);

  // TODO: Generate Cell ID Handler
  function generateCellID(rowIndex, colIndex) {
    const key = `${alphabet[colIndex]}${rowIndex + 1}`;
    return key;
  }

  function generateCellIDForColumn(columns, colIndex) {
    const key = `${alphabet[columns]}${colIndex}`;
    return key;
  }

  // TODO: Add Row
  const addRow = () => {
    const eachRowObj = {};
    for (let i = 0; i < columns; i++) {
      let res = generateCellID(rows, i);
      eachRowObj[`${tablePrefix}${res}`] = '';
    }
    cellTexts.push(eachRowObj)

    setRows(rows + 1);
    setCellTexts(cellTexts);
  };

  // TODO: Add Column
  const addColumn = () => {
    if (columns < 15) {
      setColumns(columns + 1);
      cellTexts.map((row, rowIndex) => {
        let res = generateCellIDForColumn(columns, rowIndex + 1);
        row[`${tablePrefix}${res}`] = '';
      })
      setCellTexts(cellTexts)
    }
  };

  // TODO: Delete Row
  const deleteRow = () => {
    if (rows > 1) {
      setRows(rows - 1);
      setCellTexts(cellTexts.slice(0, -1));
    }
  };

  // TODO: Delete Column
  const deleteColumn = () => {
    if (columns > 1) {
      setColumns(columns - 1);

      cellTexts.map((row, rowIndex) => {
        let keys = Object.keys(row);
        delete row[keys[keys.length - 1]];
        return row;
      });
      setCellTexts([...cellTexts]);
    }
  };

  function getBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file); // Convert file to Base64
    });
  }

  // TODO: Handles image uploads
  const UploadImageHandler = async (files) => {
    setImageFilesErr('');
    if (files.length > 0 && files.length <= 2) {
      const validFilesSize = Array.from(files).filter(file => file.size <= (2 * 1024 * 1024)); //Max Size 2MB

      if (validFilesSize.length !== files.length) {
        return setImageFilesErr('File too large. Max size is 2MB.');
      }

      try {
        const imageData = await Promise.all(Array.from(files).map(file => getBase64(file)));
        setImageFiles(imageData);
        setIsSet(false);
      } catch (error) {
        console.error('Error converting files to Base64:', error);
        setImageFilesErr('Failed to process images.');
      }
    } else if (files.length === 0) {
      setImageFiles([]);
      setTableImage([]);
    } else {
      setImageFilesErr('You can only upload 1 to 2 images.');
    };
  }

  // TODO: Stores images in the procedure table
  const UploadHandler = () => {
    if (imageFiles.length) {
      setIsProcedureImage(true)
      setTableImage(imageFiles);
      setImageFiles([]);
    }
  };


  // TODO: Handle Input Changes
  const handleCellChange = (keyName, event) => {
    let inputValue = event.target.value;
    try {
      for (let obj of cellTexts) {
        if (obj.hasOwnProperty(keyName)) {
          obj[keyName] = inputValue;
          break;
        }
      }
      setCellTexts(cellTexts);
    } catch (error) {
      console.log(error);
    }
  };

  // *** Render Main Input Cells
  const renderRows = () => {
    return cellTexts.map((row, rowIndex) => {
      const eachRow = [];

      for (const key in row) {
        const eachObjectKey = key;
        const eachObjectColumnValue = row[key];

        let eachTd = <td key={eachObjectKey}>
          <input type="text"
            placeholder={eachObjectKey}
            defaultValue={eachObjectColumnValue}
            onChange={(event) => handleCellChange(eachObjectKey, event)}
          />
        </td>

        eachRow.push(eachTd);
      }

      return <tr key={`${rowIndex + 1}`}>
        {eachRow}
      </tr>
    });
  };

  // TODO: Handle From Submit
  const handleSetData = async (e) => {

    e.preventDefault();

    if (printOnCertificate == '') {
      return alert('Please Select table either it is printable or not ?');
    }

    const bodyData = {
      design_procedure_id: eachItem.design_procedure_id,
      fromId: fromId,
      rows: rows,
      columns: columns,
      header_types: headerTypes,
      header_texts: headerTexts,
      second_row_headers: secondRowHeaders,
      cell_texts: cellTexts,
      table_type: "vertical",
      unique_id: unique_id,
      print_on_certifcate: printOnCertificate,
      procedure_image_filename: tableImage

    }

    setIsSet(true);

    setArraydata(bodyData);
  }

  return (
    <div ref={divOneRef} style={{ position: 'relative' }}>
      <div className="child_controller_btn_area" style={{ height: '80px', alignItems: 'center', margin: '0 0 1rem 1rem ' }}>
        <FileSelector
          className="rainbow-m-vertical_x-large rainbow-p-horizontal_medium rainbow-m_auto file_selector_width"
          style={containerStyles}
          size="small"
          label="File selector"
          placeholder="Drag & Drop or Click to Browse"
          bottomHelpText={!imageFilesErr ? "Only jpg, jpeg, png allowed." : ''}
          error={imageFilesErr}
          multiple
          accept="image/jpg, image/jpeg, image/png"
          onChange={UploadImageHandler}
        />
        <Button
          label="Upload"
          variant="success"
          className="rainbow-m-around_medium"
          size='small'
          disabled={!imageFiles.length}
          onClick={UploadHandler}
        />
        <div className='child_controller_btn_area' style={{ justifyContent: 'center' }}>{tableImage.map((image) => {
          return <img
            src={isProcedureImage ? image : `${config.Calibmaster.URL}/procedure_images/${image}`}
            alt="table-image"
            width={100}
            height={80}
          />
        })}</div>
      </div>

      {/* Add | Remove => Colum & Row  */}
      <div className="child_controller_btn_area">
        <Button
          label="Add Row"
          onClick={addRow}
          variant="success"
          className="rainbow-m-around_medium"
          size='small'
        />
        <Button
          label="Add Column"
          onClick={addColumn}
          variant="success"
          className="rainbow-m-around_medium"
          size='small'
        />

        <Button
          label="Delete Row"
          variant="destructive"
          className="rainbow-m-around_medium"
          onClick={deleteRow}
          size='small'
        />
        <Button
          label="Delete Column"
          variant="destructive"
          className="rainbow-m-around_medium"
          onClick={deleteColumn}
          size='small'
        />
      </div>

      {/* Table Area */}
      <div className='table-responsive' ref={divTwoRef} >
        <table>
          <tbody>
            {renderRows()}
          </tbody>
        </table>
      </div>

      {/* table Set Button */}
      <div className="eachBottomSection">
        <Button
          label={isSet ? "Data Added" : "Set Data"}
          variant={`${isSet ? "outline-brand" : "border-filled"}`}
          className="rainbow-m-around_medium"
          onClick={handleSetData}
        />
        <p style={{ color: "red" }}>*After Entering all data you need to set data</p>
      </div>

      {/* table Delete Button */}
      <Button label="Delete" variant="destructive" className="btn btn-danger delete_table_btn"
        onClick={() => { deleteTable(unique_id) }}
      />

      {/* Print On Certifcate Area */}
      <div className='print_on_certifcate_area'>
        <label htmlFor="printOnCertifcateId" class="form-label">Print On Certifcate: {printOnCertificate}</label>
        <select id='printOnCertifcateId' value={printOnCertificate} onChange={(e) => setPrintOnCertificate(e.target.value)}>
          <option value="">--Select--</option>
          <option value="YES">YES</option>
          <option value="NO">NO</option>
        </select>
      </div>
    </div>
  )
}

export default ExistVerticalTable