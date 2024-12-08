import { Table, Spinner, Card, } from "react-rainbow-components";
import { useState, useEffect, useContext, Fragment, useMemo } from "react";
import { AuthContext } from "../../../context/auth-context";
import { useDispatch } from "react-redux";
import { notificationActions } from "../../../store/nofitication";
import config from "../../../utils/config.json";
import DueDateItemList from "./DueDateItemList";
import YearDropdown from "./YearDropdown";

const DueDateChecker = () => {
    const [error, setError] = useState("");
    const [isLoaded, setIsLoaded] = useState(true);
    const auth = useContext(AuthContext);
    const dispatch = useDispatch();
    const [itemsCount, setItemsCount] = useState(Array(12).fill().map(() => Array(32).fill(0)));
    const [addItemModel, setAddItemModel] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState("");
    const [selectedDate, setSelectedDate] = useState("");
    const [count, setCount] = useState(0);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const handleYearChange = (event) => {
        setSelectedYear(event.target.value);
    };

    const fetchDueDateCount = async () => {
        setIsLoaded(false);
        setItemsCount(Array(12).fill().map(() => Array(32).fill(0)));

        try {
            const response = await fetch(config.Calibmaster.URL + `/api/due-date/get-calibration-due-date`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + auth.token,
                },
                body: JSON.stringify({ labId: auth.labId, selectedYear })
            });

            const result = await response.json();

            if (result.items.length) {
                const updatedState = Array(12).fill().map(() => Array(32).fill(0));
                result.items.forEach(({ due_date, due_date_count }) => {
                    const date = new Date(due_date);
                    updatedState[date.getMonth()][date.getDate()] = due_date_count || 0;
                });
                setItemsCount(updatedState);
                dispatch(notificationActions.changenotification({
                    title: "Calibration Detail fetched Successfully",
                    icon: "success",
                    state: true,
                    timeout: 1500,
                }));
            } else {
                setItemsCount(Array(12).fill().map(() => Array(32).fill(0)));
            }
        } catch (error) {
            dispatch(notificationActions.changenotification({
                title: "Items Detail not Found",
                icon: "error",
                state: true,
                timeout: 15000,
            }));
        } finally {
            setIsLoaded(true);
        }
    };

    useEffect(() => {
        fetchDueDateCount();
    }, [selectedYear]);

    const monthNames = useMemo(() => ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"], []);
    const columns = useMemo(() => {
        const cols = [{ header: 'Month\\Date', field: 'month' }];
        for (let i = 1; i <= 31; i++) {
            cols.push({ header: i.toString(), field: `date_${i}` });
        }
        return cols;
    }, []);

    const data = useMemo(() => {
        return itemsCount.map((row, rowIndex) => {
            const monthData = { month: monthNames[rowIndex] || '' };
            for (let i = 1; i <= 31; i++) {
                monthData[`date_${i}`] = row[i] || 0;
            }
            return monthData;
        });
    }, [itemsCount, monthNames]);

    const handleCellClick = (month, day, value) => {
        if (isLoaded) {
            setCount(value);
            setSelectedDate(day);
            setSelectedMonth(month);
            setAddItemModel(prev => !prev);
        }
    };

    const customCellRenderer = ({ row, colIndex }) => {
        const value = row[columns[colIndex + 1].field];
        const month = row.month;
        const day = colIndex + 1;

        return (
            <div onClick={() => handleCellClick(month, day, value)} style={{ cursor: isLoaded ? 'pointer' : 'default', paddingLeft: '8px' }}>
                {value}
            </div>
        );
    };

    return (
        <div style={{ width: '100%' }}>
            <Card>
                <div style={{ alignItems: "center", padding: '15px' }}>
                    <div style={{ display: 'flex' }}>
                        <YearDropdown startYear={2001} endYear={2100} onChange={handleYearChange} />
                        <h3 className='title'>Due Date for Calibration</h3>
                    </div>
                    {isLoaded ? (
                        <Table data={data} keyField="month">
                            <Table header={columns[0].header} field={columns[0].field} width={130} />
                            {columns.slice(1).map((col, colIndex) => (
                                <Table key={col.field} header={col.header} field={col.field} component={({ row }) => customCellRenderer({ row, colIndex })} />
                            ))}
                        </Table>
                    ) : (
                        <Fragment>
                            <div>There are no items</div>
                            <Spinner size="large" />
                        </Fragment>
                    )}
                </div>
            </Card>
            {addItemModel && <DueDateItemList onclose={handleCellClick} isopen={addItemModel} month={selectedMonth} date={selectedDate} count={count} year={selectedYear} />}
        </div>
    );
}

export default DueDateChecker;
