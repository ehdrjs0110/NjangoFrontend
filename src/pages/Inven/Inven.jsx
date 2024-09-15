import React, {useState, useRef, useEffect, useContext} from 'react';
import { useNavigate } from "react-router-dom";
import Scrollbars from '../../components/Inven/CustomScrollbar';
import classNames from 'classnames';

import Navigation from '../../components/Nav/Navigation'
import axios from "axios";

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Inven/Inven.module.scss'

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import {useCookies} from "react-cookie";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";

import {jwtDecode} from "jwt-decode";
import {containEmail} from "../../Store/userEmailSlice";
import {containNickName} from "../../Store/userNickName";

import {axiosInstance} from "../../middleware/customAxios";
import {arrayNestedArray, makeFlatArray} from "../../services/arrayChecker";

function Inven() {
    const navigate = useNavigate();

  //페이지 변화
  const [isChange, setChange] = useState(false);
  //재료 데이터
  const [isData, setData] = useState([]);
  //추가 재료 데이터
  const [isNewData, setNewData] = useState({
    ingredientname: "",
    status: {
      size: 0,
    }
  });
  
  //재료 선택
  const [isIngred, setIngred] = useState([]);
  //재료 선택 인덱스
  const [isIndex, setIndex] = useState(0);

  const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

  let reduxEmail = useSelector(state => state.userEmail.value);
  let reduxNickname = useSelector( state => state.userNickName.value);

  // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let userId = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();

  useEffect(() => {
    // setChange(true);

    const fetchData = async () => {

      const params = { userId:userId};

      try{
        console.log("출력");

        // await tokenHandler();
        const res = await axiosInstance.get("inven/manage", {params});

        if(res!=null){
          console.log(res.data);
          setData(res.data);
        }
      }catch(err){
        console.log("err message : " + err);
      }
    }

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
  const addData = async () => {

    const data = isNewData;

    try{
      console.log(data);

      if (!data || !data.ingredientname) {
        alert("재료명을 입력해주세요.");
        return;
      }

      await tokenHandler();
      await axiosInstance.patch(`inven/manage/add/${userId}`, data);
      setChange(!isChange);

    }catch(err){
      console.log("err message : " + err);
    }
  };

  //재료 삭제
  const deleteData = async (selectIndex) => {

    const selectedItem = isData[selectIndex];

    const params = {
      userId: userId,
      ingredientname: selectedItem.ingredientname
    };

    if(window.confirm(`정말 ${selectedItem.ingredientname}를 삭제하시겠습니까?`)){
      try{ 
        console.log(params);
        await tokenHandler();
        await axiosInstance.delete("inven/manage", {params});
        alert("삭제 되었습니다.");
        setChange(!isChange);
      }catch(err){
        console.log("err message : " + err);
      }
    }else {
      alert("취소 되었습니다.");
    }
    
  };

  //재료명 입력
  const setIngredName = (e) => {
    setNewData((isNewData) => ({
      ...isNewData,
      "ingredientname" : e.target.value,
    }));

  };

  //재료 선택
  const selectIngred = (ingred) => {
    if(Object.values(isIngred).includes(ingred)){
      // Remove the ingredient if it already exists
      const newIsIngred = { ...isIngred };
      const keyToDelete = Object.keys(newIsIngred).find(key => newIsIngred[key] === ingred);
      delete newIsIngred[keyToDelete];
      setIngred(newIsIngred);
    }else{
      setIngred((isIngred) => ({
        ...isIngred,
        [isIndex] : ingred,
      }));
      setIndex(isIndex+1);
    }
  };

  const excelmode = () => {
    navigate('/Excel');
  };

  const cookmode = () => {
    navigate('/AiSimpleSearch', {state:isIngred});
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
                <Button className={styles.serchbtn} variant="primary">검색</Button>
                <Button className={styles.btn} onClick={excelmode} variant="none">재료 상세보기</Button>
                <Button className={styles.btn} onClick={cookmode} variant="none">나의 재료로 요리하기</Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles.addContentRow}>
          <Col md={{span: 10, offset: 1}} className={styles.addContent}>
            <Row className={styles.addline}>
              <Col>
              <Form.Control type="text" className={styles.ingredientname} onChange={setIngredName} value={isNewData.ingredientname} placeholder="재료명"/>
              </Col>
              <Col>
              <Button className={styles.addBtn} variant="none" onClick={addData}>추가</Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles.contentRow}>
          <Col md={{span: 10, offset: 1}} className={styles.content}>
          <Scrollbars className={styles.scroll}>
            <div className={styles.item}>
              
            {isData && isData.map((item, index) => {
              // 클래스 네임 결합
              const combinedClassName = classNames(
                styles.line,
                {
                  [styles.select]: Object.values(isIngred).includes(item.ingredientname),
                }
              );

              return (
                <div key={index} className="item">
                  <Row className={combinedClassName} onClick={(e) => selectIngred(item.ingredientname)}>
                    <Col>
                      <h3 className={styles.title}>{item.ingredientname}</h3>
                    </Col>
                    <Col>
                      {item.status.size}
                      {item.status.unit}
                    </Col>
                    <Col>
                      <Button className={styles.delBtn} onClick={() => deleteData(index)} variant="danger">삭제</Button>
                    </Col>
                  </Row>
                </div>
              );
            })}   
            </div>
            </Scrollbars>
          </Col>
        </Row>
        </div>
      </Container>
    </>
  );
}

export default Inven;