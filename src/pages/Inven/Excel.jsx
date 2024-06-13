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
    //추가 재료 데이터
    const [isNewData, setNewData] = useState([]);
    //추가 사이즈 선택 버튼
    const [isClickSize, setClickSize] = useState("");
    //select박스 체크
    const [selectedRows, setSelectedRows] = useState([]);

    const userid = "ehdrjs0110";

    useEffect(() => {
      setNewData({      
        userid : "ehdrjs0110",
      });
    },[]);

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
        { field: "memo", headerName: "기타", width: 600, editable: true },
    ];

    //데이터 가져오기
    useEffect(() => {

      const fetchData = async () => {
  
        const params = { userid:"ehdrjs0110"};
  
        try{
          const res = await axios.get("http://localhost:8080/inven/manage/all", {params});
          console.log(res.data);
          setData(res.data);        
  
        }catch(err){
          console.log("err message : " + err);
        }
      }
  
      fetchData();
  
    }, [isChange]);

    //재료 추가
    //재료명 입력
    const setInsertData = (e) => {
      setNewData((isNewData) => ({
        ...isNewData,
        [e.target.id] : e.target.value,
      }));

      if(e.target.id==="size"){
        setClickSize(e.target.value);
      }

    };

    const addData = async () => {

      const data = isNewData;
  
      try{
        console.log(data);
        await axios.post("http://localhost:8080/inven/manage/add", data, {
          headers: {
            'Content-Type': 'application/json'
          }
        });
        setChange(!isChange);
  
      }catch(err){
        console.log("err message : " + err);
      }
  
    };

    //재료 선택 삭제
    const handleSelectionModelChange = (newSelection) => {
      console.log("New selection: ", newSelection);
      setSelectedRows(newSelection);
  };

    //입력 재료 업데이트
    const handleProcessRowUpdate = (newRow, oldRow) => {
        setData((prevRows) => prevRows.map((row) => (row.ingredientname === newRow.ingredientname ? newRow : row)));
        return newRow;
    };

    //재료 수정
    const updateData = async () => {

      const data = Object.values(isData);

      if(window.confirm("수정 하시겠습니까?")){
        try{
            await axios.put(`http://localhost:8080/inven/manage/update/${userid}`, data);
          alert("수정 되었습니다.");
          setChange(!isChange);
        }catch(err){
          console.log("err message : " + err);
        }
        
      }else {
        alert("취소 되었습니다.");
      }
      
    };

    //재료 삭제
  const deleteData = async () => {

    const params = selectedRows;
    console.log(selectedRows);
    const showdata = params
    .map(item => `${item}`)
    .join(', ');

    if(window.confirm(`정말 ${showdata}를 삭제하시겠습니까?`)){
      try{ 
        console.log(params);
        await axios.delete(`http://localhost:8080/inven/manage/delete/${userid}`, {params});
        alert("삭제 되었습니다.");
        setChange(!isChange);
      }catch(err){
        console.log("err message : " + err);
      }
    }else {
      alert("취소 되었습니다.");
    }
    
  };

    const normalmode = () => {
        navigate('/Inven');
    };
  
    return (
    <>
        <Navigation></Navigation>
        <Container fluid className={styles.container}>
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
                  <Button className={styles.btn} onClick={updateData} variant="none">일괄 저장</Button>
                  <Button className={styles.btn} onClick={deleteData} variant="none">선택 삭제</Button>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row className={styles.addContentRow}>
          <Col md={{span: 10, offset: 1}} className={styles.addContent}>
            <Row className={styles.addline}>
              <Col>
              <Form.Control type="text" id='ingredientname' className={styles.ingredientname} onChange={setInsertData} placeholder="재료명"/>
              </Col>
              <Col>
                <Form.Select id='size' className={styles.selectSize} onChange={setInsertData} aria-label="Default select example">
                  <option value={"없음"}>없음</option>
                  <option value={"적음"}>적음</option>
                  <option value={"적당함"}>적당함</option>
                  <option value={"많음"}>많음</option>
                </Form.Select>
              </Col>
              <Col>
                <p className={styles.text}>수량</p>
                <Form.Control type="number" id='count' className={styles.count} onChange={setInsertData} placeholder="0"/>
              </Col>
              <Col>
                <p className={styles.text}>사용기한</p>
                <Form.Control type="date" id='dateofuse' className={styles.day} onChange={setInsertData} />
              </Col>
              <Col>
                <p className={styles.text}>마지막 구입날짜</p>
                <Form.Control type="date" id='lastget' className={styles.day} onChange={setInsertData} />
              </Col>
              <Col>
              <Button className={styles.addBtn} variant="none" onClick={addData}>추가</Button>
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
                        onSelectionModelChange={(newSelection) => handleSelectionModelChange(newSelection)}
                        selectionModel={selectedRows}
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
        </Container>
    </>
    );
}

export default Excel;