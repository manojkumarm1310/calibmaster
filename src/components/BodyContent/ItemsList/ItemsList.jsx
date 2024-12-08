import { useEffect, useState } from "react";
import {
  Card,
  TableWithBrowserPagination,
  Column,
  Button,
} from "react-rainbow-components";
import { useDispatch, useSelector } from "react-redux";
import { itemsActions } from "../../../store/items";
import "./ItemsList.css";
import CustomButton from "../../Inputs/CustomButton";
import AddItem from "../AddItem/AddItem";

const ItemsList = (props) => {

  const items = useSelector((state) => state.items.list);
  const [modifiedItems, setModifiedItems] = useState([]);
  const [addItemModel, setAddItemModel] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    if (items) {
      const modifieditems = items.map((v, i) => ({
        ...v,
        sno: i + 1
      }));
      setModifiedItems(modifieditems);
      //console.log(modifiedItems);
    }
  }, [items]);

  const addItemHandler = () => {
    const isopen = addItemModel;
    setAddItemModel(!isopen);
  };

  const itemdeleteHandler = (v) => {
    const delindex = v - 1;
    //console.log(delindex);
    dispatch(itemsActions.removeitem(delindex));
  };

  const DeleteButton = ({ value }) => (
    <Button
      variant="destructive"
      label="Delete"
      onClick={() => itemdeleteHandler(value)}
    />
  );

  return (
    <div className="srf__items__container">
      <Card className="items__table__card">
        <div className="items__label">
          <h2>SRF Items</h2>
        </div>

        <TableWithBrowserPagination
          className="srf__items__table"
          pageSize={5}
          data={modifiedItems}
          keyField="sno"
        >
          <Column header="S.No" field="sno" />
          <Column header="Description of Item" field="description" />
          <Column header="Make" field="make" />
          <Column header="Model" field="model" />
          <Column header="Serial Number" field="serialno" />
          <Column header="Id Number" field="idno" />
          <Column header="Remarks" field="remarks" />
          <Column header="Delete" field="sno" component={DeleteButton} />
        </TableWithBrowserPagination>

        <div className="srf__submit__container">
          <div className="add__button__container">
            <CustomButton
              label="Add Item"
              onclick={addItemHandler}
              variant="success"
            />
          </div>
          {items.length > 0 ? (
            <div className="add__button__container">
              <Button variant="brand" label="Add SRF" onClick={props.isLoaded && props.addsrf} />
            </div>
          ) : null}
        </div>
      </Card>

      {
        addItemModel
          ? (
            <AddItem onclose={addItemHandler} isopen={addItemModel} />
          ) : null
      }
    </div>
  );
};

export default ItemsList;
