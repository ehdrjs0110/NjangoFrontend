import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import classNames from 'classnames';
import styles from '../../styles/Inven/Inven.module.scss';
import Col from "react-bootstrap/Col";

const IngredientItem = ({ item, index, isIngred, selectIngred, updateUnit, deleteData, handleShow, setChange, message }) => {
    const combinedClassName = classNames(
        styles.line,
        {
            [styles.select]: Object.values(isIngred).includes(item.ingredientname),
        }
    );

    return (
        <Col key={index} xs={12} sm={6} md={4} lg={3} xl={2} className="item">
            <div className={`${combinedClassName} ${item.status.size !== 0 ? "" : styles.zeroCount}`} onClick={(e) => selectIngred(item.ingredientname)}>
                <div className={styles.ingredient} style={{ backgroundImage: `url('/ingredients/${item.ingredientname}.webp')` }}>
                    <h3 className={styles.title}>{item.ingredientname}</h3>
                </div>
                <Button className={styles.btn} variant="none" value={"없음"} disabled={item.status.size === "없음"} onClick={async (e) => {
                    e.stopPropagation();
                    await updateUnit(item.ingredientname, { target: { value: (item.status.size > 0 ? 0 : 1) } });
                    setChange(prev => !prev);
                }}>{message}</Button>
                <Button className={styles.delBtn} onClick={async (e) => {
                    e.stopPropagation();
                    await deleteData(item.ingredientname);
                }} variant="danger">삭제</Button>
                <Button className={styles.infoBtn} variant="info" onClick={(e) => {
                    e.stopPropagation();
                    handleShow(item);
                }}>
                    <FontAwesomeIcon icon={faInfoCircle} />
                </Button>
            </div>
        </Col>
    );
};

export default IngredientItem;