import React, {useEffect, useState} from 'react';
import { ListGroup } from 'react-bootstrap';
import styles from "../../styles/Management/ManagementSearch.module.scss"
import {axiosInstance} from "../../middleware/customAxios";

const TableForDashBoard = ({ columns, url }) => {
    const [data, setData] = useState([]);  // 초기 상태를 빈 배열로 설정

    useEffect(() => {
        axiosInstance.get(url).then((res) => {
            setData(res.data);
            console.log(res.data);
        }).catch((error) => {
            console.error("Error fetching data: ", error);
        });
    }, [url]);  // 의존성을 `url`로 설정, data 변경에 의존하지 않도록 수정

    return (
        <>
            {/* Header Row */}
            <ListGroup horizontal className={styles.listGroupHorizontal}>
                {columns.map((col, index) => (
                    <ListGroup.Item key={index} className={styles.tableHeader}>
                        {col}
                    </ListGroup.Item>
                ))}
            </ListGroup>

            {/* Data Rows */}
            {data && data.length > 0 ? (  // data가 존재하고, 빈 배열이 아닐 때만 map 호출
                data.map((row, rowIndex) => (
                    <ListGroup horizontal key={rowIndex} className={styles.listGroupHorizontal}>
                        {columns.map((col, colIndex) => (
                            <ListGroup.Item key={colIndex} className={styles.item}>
                                {row[col]}
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                ))
            ) : (
                <p>No data available</p>  // 데이터가 없을 때 표시할 메시지
            )}
        </>
    );
};

export default TableForDashBoard;
