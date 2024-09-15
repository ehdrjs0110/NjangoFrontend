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

import {useCookies} from "react-cookie";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";

import {jwtDecode} from "jwt-decode";
import {containEmail} from "../../Store/userEmailSlice";
import {containNickName} from "../../Store/userNickName";

import {axiosInstance} from "../../middleware/customAxios";
import {arrayNestedArray, makeFlatArray} from "../../services/arrayChecker";

function Excel() {
    
    const navigate = useNavigate();

    //페이지 변화
    const [isChange, setChange] = useState(false);
    //재료 데이터
    const [isData, setData] = useState([]);
     //재료 포맷 데이터
     const [isRows, setRows] = useState([]);
    //추가 재료 데이터
    const [isNewData, setNewData] = useState({
      ingredientname: "",
      status: {
        size: 0,
      }
    });
    //select박스 체크
    const [selectedRows, setSelectedRows] = useState([]);

    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    
  let reduxEmail = useSelector(state => state.userEmail.value);
  let reduxNickname = useSelector( state => state.userNickName.value);


    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);  // 헤더에 추가
    let userId = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();

    //columns 변수에는 테이블의 제목에 들어갈 내용을 배열에 객체 요소로 담는다.
    const columns = [
        { field: "ingredientname", headerName: "재료명", width: 150},
        { field: "size", headerName: "재료 양", type: "number", width: 130, editable: true },
        { 
            field: "unit", 
            headerName: "단위", 
            width: 150, 
            editable: true,
            renderEditCell: (params) => <SelectEditor {...params} />
        },
        { field: "dateofuse", headerName: "사용기한", type: "Date", width: 200, editable: true },
        { field: "lastuse", headerName: "마지막 사용 날짜", type: "Date", width: 200, editable: true },
        { field: "lastget", headerName: "마지막 구입 날짜", type: "Date", width: 200, editable: true },
        { field: "memo", headerName: "기타", width: 600, editable: true },
    ];


    useEffect(() => {

      const fetchData = async () => {
  
        const params = { userId:userId};
  
        try{

          await tokenHandler();
          const res = await axiosInstance.get("inven/manage/all", {params});
          console.log(res.data);
          setData(res.data); 
          
          // fetchData 성공적으로 완료 후 formatData 호출
          formatData(res.data);
  
        }catch(err){
          console.log("err message : " + err);
        }
      }

      const formatData = (data) => {
        setRows(data.map((item) => ({
          ingredientname: item.ingredientname,
          size: item.status.size,
          unit: item.status.unit,
          dateofuse: item.status.dateofuse,
          lastuse: item.status.lastuse,
          lastget: item.status.lastget,
          memo: item.status.memo,
        })));
    };

      fetchData();    
  
    }, [isChange]);


    async function tokenHandler() {

      const isExpired = expired();
      if(isExpired){
  
          let refreshToken = cookies.refreshToken;
          try {
  
              // getNewToken 함수 호출 (비동기 함수이므로 await 사용)
              const result = await getNewToken(refreshToken);
              refreshToken = result.newRefreshToken;
  
              // refresh token cookie에 재설정
              setCookie(
                  'refreshToken',
                  refreshToken,
                  {
                      path:'/',
                      maxAge: 7 * 24 * 60 * 60, // 7일
                      // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                  }
              )
  
              // Redux access token 재설정
              dispatch(containToken(result.newToken));
  
          } catch (error) {
              console.log(error);
              navigate('/Sign');
          }
      }
  }

    //재료 추가
    //재료명 입력
    const setIngredName = (e) => {
      setNewData((isNewData) => ({
        ...isNewData,
        [e.target.id] : e.target.value,
      }));

    };

    const setInsertData = (e) => {
      setNewData((isNewData) => ({
        ...isNewData,
        "status" : {
          ...isNewData?.status,
          [e.target.id] : e.target.value,
        }
      }));

    };

    const addData = async () => {

      const data = isNewData;
  
      try{
        console.log(data);

      if (!data || !data.ingredientname) {
        alert("재료명을 입력해주세요.");
        return;
      }
      
      if (!data.status || !data.status.size) {
        alert("재료의 양을 입력해주세요.");
        return;
      }
        await tokenHandler();
        await axiosInstance.patch(`inven/manage/add/${userId}`, data);
        setChange(!isChange);
  
      }catch(err){
        console.log("err message : " + err);
      }
  
      setNewData((isNewData) => ({
        "ingredientname" : "",
        "status" : {
          "size" : isNewData.status.size,
          "unit" : "g",
        }
      }));

    };

    //재료 선택 삭제
    const handleSelectionModelChange = (newSelection) => {
      console.log("New selection: ", newSelection);
      setSelectedRows(newSelection);
  };

    //입력 재료 업데이트
    const handleProcessRowUpdate = (newRow, oldRow) => {

        const updateRow = {
            ingredientname: newRow.ingredientname,
            status: {
              size: newRow.size,
              unit: newRow.unit,
              dateofuse: newRow.dateofuse,
              lastuse: newRow.lastuse,
              lastget: newRow.lastget,
              memo: newRow.memo,
            }
          };

        setData((prevRows) => prevRows.map((row) => (row.ingredientname === newRow.ingredientname ? updateRow : row)));
        return newRow;
    };

    //재료 수정
    const updateData = async () => {

      const data = Object.values(isData);

      if(window.confirm("수정 하시겠습니까?")){
        try{
            await tokenHandler();
            await axiosInstance.patch(`inven/manage/update/${userId}`, data);
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

    const params = selectedRows.map(item => `ingredientname=${encodeURIComponent(item)}`).join('&');
    const showdata = selectedRows
    .map(item => `${item}`)
    .join(', ');

    if(window.confirm(`정말 ${showdata}를 삭제하시겠습니까?`)){
      try{ 
        console.log(params);
        await tokenHandler();
        await axiosInstance.delete(`inven/manage/deleteAll/${userId}?${params}`);
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
  
    const cookmode = () => {
      const selectRow = selectedRows.map(item => item);
      navigate('/AiSimpleSearch', {state:selectRow});
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
                  <Button className={styles.btn} onClick={cookmode} variant="none">나의 재료로 요리하기</Button>
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
              <Form.Control type="text" id='ingredientname' className={styles.ingredientname} onChange={setIngredName} value={isNewData.ingredientname} placeholder="재료명"/>
              </Col>
              <Col>
              <p className={styles.text}>재료 양</p>
              <Form.Control type="number" id='size' className={styles.count} onChange={setInsertData} value={isNewData.status.size} placeholder="0"/>
              </Col>
              <Col>
                <p className={styles.text}>단위</p>
                <Form.Select id='unit' className={styles.selectSize} onChange={setInsertData} defaultValue={isNewData.status.unit}>
                  <option  value={"g"}>g</option>
                  <option value={"개"}>개</option>
                  <option value={"ml"}>ml</option>
                  <option value={"통"}>통</option>
                </Form.Select>
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
                        rows={isRows}
                        columns={columns}
                        getRowId={(row) => row.ingredientname}
                        processRowUpdate={handleProcessRowUpdate}
                        checkboxSelection
                        disableRowSelectionOnClick
                        disableColumnFilter
                        disableColumnSelector
                        disableDensitySelector
                        onRowSelectionModelChange={(newSelection) => handleSelectionModelChange(newSelection)}
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