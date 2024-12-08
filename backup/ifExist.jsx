if (ifExist) {
    const mainTable = await cell_texts.map((eachRow, rowIndex) => (
        eachRow.map((eachColumn, colIndex) => (
            header_types[colIndex] === 'Formula' ? (
                { val: eachColumn.val, columnFormula: eachColumn.columnFormula, constFormular: eachColumn.constFormular }
            ) : (
                eachColumn
            )
        ))
    ))
    setCellTexts(mainTable);
    console.log("Exist");
} else {
    const mainTable = await cell_texts.map((eachRow) => (
        eachRow.map((eachColumn, colIndex) => (
            header_types[colIndex] === 'Formula' ? (
                { val: 0, columnFormula: eachColumn, constFormular: eachColumn }
            ) : (
                eachColumn
            )
        ))
    ))
    setCellTexts(mainTable);
    console.log("not Exist");
}