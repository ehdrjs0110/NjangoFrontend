import React, { useState , useRef , useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import SelectEditor from '../../components/Inven/SelectEditor';

import Navigation from '../../components/Nav/Navigation'
import axios from "axios";

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Inven/Excel.module.scss'

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Excel() {
    
    const navigate = useNavigate();

    //페이지 변화
    const [isChange, setChange] = useState(false);
    //재료 데이터
    const [isData, setData] = useState([]);

    const items = Array(10).fill(0);


    //columns 변수에는 테이블의 제목에 들어갈 내용을 배열에 객체 요소로 담는다.
    const columns = [
        { field: "ingredientname", headerName: "재료명", width: 150},
        { 
            field: "size", 
            headerName: "재료양", 
            width: 150, 
            editable: true,
            renderEditCell: (params) => <SelectEditor {...params} />
        },
        { field: "count", headerName: "개수", type: "number", width: 130, editable: true },
        { field: "dateofuse", headerName: "사용기한", type: "Date", width: 200, editable: true },
        { field: "lastuse", headerName: "마지막 사용 날짜", type: "Date", width: 200, editable: true },
        { field: "lastget", headerName: "마지막 구입 날짜", type: "Date", width: 200, editable: true },
        { field: "memo", headerName: "기타", width: 300, editable: true },
    ];

    useEffect(() => {

      const fetchData = async () => {
  
        const params = { userid:"ehdrjs0110"};
  
        try{
          const res = await axios.get("http://localhost:8080/inven/manage", {params});
          console.log(res.data);
          setData(res.data);        
  
        }catch(err){
          console.log("err message : " + err);
        }
      }
  
      fetchData();
  
    }, [isChange]);
    
    const handleProcessRowUpdate = (newRow, oldRow) => {
        setData((prevRows) => prevRows.map((row) => (row.ingredientname === newRow.ingredientname ? newRow : row)));
        return newRow;
    };

    const normalmode = () => {
        navigate('/Inven');
    };
  
    return (
    <>
        <Navigation></Navigation>
        <Container fluid className={styles.container}>
          <div className={styles.main}>
          <Row className={styles.controllerRow}>
            <Col md={{span: 10, offset: 1}} className={styles.controller}>
              <Row className={styles.controllerRow}>
                <Col className={styles.controlform}>
                  <div className={styles.serch}>
                    <Form.Control type="text" placeholder="재료검색" />
                  </div>
                  <Button className={styles.serchbtn} variant="none">검색</Button>
                  <Button className={styles.btn} onClick={normalmode} variant="none">일반 모드</Button>
                  <Button className={styles.btn} variant="none">나의 재료로 요리하기</Button>
                  <Button className={styles.btn} variant="none">일괄 저장</Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={styles.contentRow}>
            <Col md={{span: 10, offset: 1}} className={styles.content}>
              <Row className={styles.row}>
                <Col>
                  <div className={styles.excel}>
                    <DataGrid
                        rows={isData}
                        columns={columns}
                        getRowId={(row) => row.ingredientname}
                        processRowUpdate={handleProcessRowUpdate}
                        checkboxSelection
                        disableColumnFilter
                        disableColumnSelector
                        disableDensitySelector
                        slots={{ toolbar: GridToolbar }}
                        slotProps={{
                        toolbar: {
                            showQuickFilter: true,
                        },
                        }}
                    />
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
        </Container>
    </>
  );
}

export default Excel;