import React, { useState , useRef , useEffect } from 'react';
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


function Inven() {
    const navigate = useNavigate();

  //페이지 변화
  const [isChange, setChange] = useState(false);
  //재료 데이터
  const [isData, setData] = useState([]);
  //추가 재료 데이터
  const [isNewData, setNewData] = useState([]);
  //수정 재료 데이터
  const [isUpdateData, setUpdateData] = useState([]);
  //추가 사이즈 선택 버튼
  const [isClickSize, setClickSize] = useState("");
  //재료 선택
  const [isIngred, setIngred] = useState([]);
  //재료 선택 인덱스
  const [isIndex, setIndex] = useState(0);

  const userid = "ehdrjs0110";


  useEffect(() => {
    setNewData({      
      userid : "ehdrjs0110",
    });
  },[]);

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

  const addData = async () => {

    const data = isNewData;

    try{
      console.log(data);
      const res = await axios.post("http://localhost:8080/inven/manage/add", data, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      setChange(!isChange);

    }catch(err){
      console.log("err message : " + err);
    }

  };

  //재료 삭제
  const deleteData = async (selectIndex) => {

    const selectedItem = isData[selectIndex];

    const params = {
      userid: "ehdrjs0110",
      ingredientname: selectedItem.ingredientname
    };

    if(window.confirm(`정말 ${selectedItem.ingredientname}를 삭제하시겠습니까?`)){
      try{ 
        console.log(params);
        await axios.delete("http://localhost:8080/inven/manage/delete", {params});
        alert("삭제 되었습니다.");
        setChange(!isChange);
      }catch(err){
        console.log("err message : " + err);
      }
    }else {
      alert("취소 되었습니다.");
    }
    
  };

  //재료 수정
  const updateData = async () => {

    const data = Object.values(isUpdateData);
    
    const showdata = data
    .map(item => `${item.ingredientname} - ` + (item.size == null ? "" : `양 : ${item.size},`) + (item.count == null ? "" : ` 수량 : ${item.count} `))
    .join('\n ');

    if(window.confirm(`수정내용 확인 \n ${showdata}`)){
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

  const updateCount = (index,e) => {
    setUpdateData((isUpdateData) => ({
      ...isUpdateData,
      [index] : {
        ...isUpdateData[index],
        "ingredientname" : isData[index].ingredientname,
        "count" : e.target.value,
      }
    }));
  };

  const updateSize = (index,e) => {
    isData[index].size = e.target.value;
    setData(isData);
    
    setUpdateData((isUpdateData) => ({
      ...isUpdateData,
      [index] : {
        ...isUpdateData[index],
        "ingredientname" : isData[index].ingredientname,
        "size" : e.target.value,
      }
    }));
  };

  //재료명 입력
  const setIngredName = (e) => {
    setNewData((isNewData) => ({
      ...isNewData,
      "ingredientname" : e.target.value,
    }));

  };

  //재료양 입력
  const setSize = (e) => {
    setClickSize(e.target.value);
    setNewData((isNewData) => ({
      ...isNewData,
      "size" : e.target.value,
    }));

  };
  
  //재료수량 입력
  const setCount = (e) => {
    setNewData((isNewData) => ({
      ...isNewData,
      "count" : e.target.value,
    }));

  };

  //재료 선택

  const selectIngred = (ingred) => {
    setIngred((isIngred) => ({
      ...isIngred,
      [isIndex] : ingred,
    }));
    setIndex(isIndex+1);
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
                <Button className={styles.btn} onClick={excelmode} variant="none">전문가 모드</Button>
                <Button className={styles.btn} onClick={cookmode} variant="none">나의 재료로 요리하기</Button>
                <Button className={styles.btn} onClick={updateData} variant="none">일괄 저장</Button>
              </Col>
            </Row>
          </Col>
        </Row>
        <Row className={styles.addContentRow}>
          <Col md={{span: 10, offset: 1}} className={styles.addContent}>
            <Row className={styles.addline}>
              <Col>
              <Form.Control type="text" className={styles.ingredientname} onChange={setIngredName} placeholder="재료명"/>
              </Col>
              <Col>
                <Button className={styles.btn} variant="none" onClick={setSize} value={"없음"} disabled={isClickSize==="없음"} >없음</Button>
              </Col>
              <Col>
                <Button className={styles.btn} variant="none" onClick={setSize} value={"적음"} disabled={isClickSize==="적음"} >적음</Button>
                <Button className={styles.btn} variant="none" onClick={setSize} value={"적당함"} disabled={isClickSize==="적당함"} >적당함</Button>
                <Button className={styles.btn} variant="none" onClick={setSize} value={"많음"} disabled={isClickSize==="많음"} >많음</Button>
              </Col>
              <Col>
                <p className={styles.text}>수량</p>
                <Form.Control type="number" className={styles.count} onChange={setCount} placeholder="0"/>
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
            {isData.map((item, index) => {
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
                      <Button className={styles.btn} variant="none" value={"없음"} disabled={item.size==="없음"} onClick={(e) => updateSize(index,e)}>없음</Button>
                    </Col>
                    <Col>
                      <Button className={styles.btn}  variant="none" value={"적음"} disabled={item.size==="적음"} onClick={(e) => updateSize(index,e)}>적음</Button>
                      <Button className={styles.btn} variant="none" value={"적당함"} disabled={item.size==="적당함"} onClick={(e) => updateSize(index,e)}>적당함</Button>
                      <Button className={styles.btn} variant="none" value={"많음"} disabled={item.size==="많음"} onClick={(e) => updateSize(index,e)}>많음</Button>
                    </Col>
                    <Col>
                      <p className={styles.text}>수량</p>
                      <Form.Control type="number" className={styles.count} placeholder={item.count} onChange={(e) => updateCount(index, e)} />
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