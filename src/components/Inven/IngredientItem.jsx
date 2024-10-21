import React from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle, faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";
import classNames from 'classnames';
import styles from '../../styles/Inven/Inven.module.scss';
import Col from "react-bootstrap/Col";
import OverlayTrigger from 'react-bootstrap/OverlayTrigger';
import Tooltip from 'react-bootstrap/Tooltip';

const IngredientItem = ({ item, index, isIngred, selectIngred, updateUnit, deleteData, handleShow, setChange, message }) => {
    const combinedClassName = item.ingredientname!=="추가" ? classNames(
        styles.line,
        {
            [styles.select]: Object.values(isIngred).includes(item.ingredientname),
        }
    ) : null;

    const checkExpiredDate = (dateofuse) => {
        if(dateofuse=== null) return false;
        // 문자열인 경우 Date 객체로 변환
        const dateOfUseObj = new Date(dateofuse);
        const today = new Date();
        const fiveDaysLater = new Date(today);
        fiveDaysLater.setDate(today.getDate() + 5);
        return dateOfUseObj >= today && dateOfUseObj <= fiveDaysLater;
    }

    const tooltip = (
        <Tooltip id="tooltip">
            유통기한이 지났거나 얼마 남지 않았어요!
        </Tooltip>
    );

    return (
        item.ingredientname === "추가" ?
            <Col key={"추가"} xs={12} sm={6} md={4} lg={3} xl={2} className="item">
                <div className={`${styles.line} ${styles.addIngredient}`}
                     onClick={handleShow}>
                    <div className={styles.ingredient}
                         style={{backgroundImage: `url('/image/plus-104-512-grey.png')`, backgroundPositionY: "center"}}>
                    </div>
                </div>
            </Col>
            : <Col key={index} xs={12} sm={6} md={4} lg={3} xl={2} className="item">
                <div className={`${combinedClassName} ${item.status.size !== 0 ? "" : styles.zeroCount}`}
                     onClick={(e) => selectIngred(item.ingredientname)}>
                    <div className={styles.ingredient}
                         style={{backgroundImage: `url('/ingredients/${item.ingredientname}.webp')`}}>
                        <h3 className={styles.title}>{item.ingredientname}</h3>
                    </div>
                    <Button className={styles.btn} variant="none" value={"없음"} disabled={item.status.size === "없음"}
                            onClick={async (e) => {
                                e.stopPropagation();
                                await updateUnit(item.ingredientname, {target: {value: (item.status.size > 0 ? 0 : 1)}});
                                setChange(prev => (prev + 1));
                            }}>{message}</Button>
                    <Button className={styles.delBtn} onClick={async (e) => {
                        e.stopPropagation();
                        await deleteData(item.ingredientname);
                    }} variant="danger">삭제</Button>
                    <Button className={styles.infoBtn} variant="info" onClick={(e) => {
                        e.stopPropagation();
                        handleShow(item);
                    }}>
                        <FontAwesomeIcon icon={faInfoCircle}/>
                    </Button>
                    {item.status.size > 0 && checkExpiredDate(item.status.dateofuse) && (
                        <OverlayTrigger placement="top" overlay={tooltip}>
                            <FontAwesomeIcon icon={faExclamationTriangle} className={styles.expired} />
                        </OverlayTrigger>
                    )}
                </div>
            </Col>
    );
};

export default IngredientItem;