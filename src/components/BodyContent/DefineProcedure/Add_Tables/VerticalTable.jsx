import React, { useEffect, useState, useRef } from 'react';
import { Button, FileSelector } from 'react-rainbow-components';
import alphabet from '../procedureHelpers/alphabet';

const VerticalTable = ({ fromId, setArraydata, unique_id, deleteTable }) => {

    const divOneRef = useRef(null);
    const divTwoRef = useRef(null);
    const [divOneWidth, setDivOneWidth] = useState(0);

    const [isSet, setIsSet] = useState(false);
    const [rows, setRows] = useState(3); // Initial rows
    const [columns, setColumns] = useState(3); // Initial columns

    const [headerTypes, setHeaderTypes] = useState(Array(columns).fill('textWithInput')); // Dropdown values
    const [headerTexts, setHeaderTexts] = useState(Array(columns).fill('')); // Header input values
    const [secondRowHeaders, setSecondRowHeaders] = useState(Array(columns).fill('')); // Second row header input values

    const [cellTexts, setCellTexts] = useState(Array(rows).fill(Array(columns).fill(''))); // Cell input values

    const [printOnCertificate, setPrintOnCertificate] = useState('');
    const [tableImage, setTableImage] = useState([]);

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

    // TODO: Add Row
    const addRow = () => {
        setRows(rows + 1);
        setCellTexts([...cellTexts, Array(columns).fill('')]);
    };

    // TODO: Add Column
    const addColumn = () => {
        if (columns < 15) {
            setColumns(columns + 1);
            setHeaderTypes([...headerTypes, 'textWithInput']);
            setHeaderTexts([...headerTexts, '']);
            setSecondRowHeaders([...secondRowHeaders, '']);
            setCellTexts(cellTexts.map((row) => [...row, '']));
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
            setHeaderTypes(headerTypes.slice(0, -1));
            setHeaderTexts(headerTexts.slice(0, -1));
            setSecondRowHeaders(secondRowHeaders.slice(0, -1));
            setCellTexts(cellTexts.map((row) => row.slice(0, -1)));
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
            setTableImage(imageFiles);
            setImageFiles([]);
        }
    };

    // TODO: Handle Input Changes
    const handleCellChange = (rowIndex, colIndex, value) => {
        const updatedTexts = cellTexts.map((row, rIndex) =>
            rIndex === rowIndex
                ? row.map((col, cIndex) => (cIndex === colIndex ? value : col))
                : row
        );
        setCellTexts(updatedTexts);
        setIsSet(false);
    };

    // TODO: Generate Cell ID Handler
    function generateCellID(rowIndex, colIndex, value) {
        const key = `${alphabet[colIndex]}${rowIndex + 1}`;
        return key;
    }

    // *** Render Main Input Cells
    const renderRows = () => {
        return cellTexts.map((row, rowIndex) => (
            <tr key={rowIndex}>
                {row.map((col, colIndex) => {
                    let getCellID = generateCellID(rowIndex, colIndex);
                    return <td key={colIndex} id={getCellID}>
                        <input
                            type="text"
                            id={getCellID}
                            placeholder={getCellID}
                            onChange={(e) => handleCellChange(rowIndex, colIndex, e.target.value)}
                        />
                    </td>
                })}
            </tr>
        ));
    };

    // TODO: helper Function For Adding Each index as an key value pair
    async function helperFunction(rowIndex, colIndex, value) {
        const alphabet = await 'abcdefghijklmnopqrstuvwxyz'.toUpperCase().split('');
        const key = `${alphabet[colIndex]}${rowIndex + 1}`;
        return key;
    }

    // TODO: Handle From Submit
    const handleSetData = async (e) => {

        const childTable = [...cellTexts];

        childTable.map((eachRow, rowIndex) => {
            const eachRowObj = {};
            eachRow.map(async (eachColumn, colIndex) => {
                let eachObjKey = await helperFunction(rowIndex, colIndex, eachColumn);
                eachRowObj[`${eachObjKey}`] = eachColumn;
            });
            childTable[rowIndex] = eachRowObj;
        });
        // return;
        // console.log(cellTexts);
        // console.log(childTable);
        // return;

        if (printOnCertificate == '') {
            return alert('Please Select table either it is printable or not ?');
        }

        const bodyData = {
            fromId: fromId,
            rows: rows,
            columns: columns,
            header_types: headerTypes,
            header_texts: headerTexts,
            second_row_headers: secondRowHeaders,
            cell_texts: childTable,
            table_type: "vertical",
            unique_id: unique_id,
            print_on_certifcate: printOnCertificate,
            procedure_image_filename: tableImage
        }
        // return console.log(bodyData);

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
                        src={image}
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

                <p style={{ color: "red" }}>
                    *After Entering all data you need to set data
                </p>
            </div>

            {/* table Delete Button */}
            <Button
                label="Delete"
                variant="destructive"
                className="btn btn-danger delete_table_btn"
                onClick={() => { deleteTable(unique_id) }}
            />

            {/* Print On Certifcate Area */}
            <div className='print_on_certifcate_area'>
                <label htmlFor="printOnCertifcate" class="form-label">Print On Certifcate:</label>
                <select id='printOnCertifcate' onChange={(e) => setPrintOnCertificate(e.target.value)}>
                    <option value="">--Select--</option>
                    <option value="YES">YES</option>
                    <option value="NO">NO</option>
                </select>
            </div>

        </div>
    )
}

export default VerticalTable;