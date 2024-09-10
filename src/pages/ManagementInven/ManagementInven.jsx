import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Scrollbars from '../../components/Inven/CustomScrollbar';
import classNames from 'classnames';

import Navigation from '../../components/Nav/Navigation'

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Inven/Inven.module.scss'

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Card from 'react-bootstrap/Card';

import { useCookies } from "react-cookie";
import { expired, getNewToken } from "../../services/auth2";
import { containToken } from "../../Store/tokenSlice";
import { useDispatch, useSelector } from "react-redux";

import { axiosInstance } from "../../middleware/customAxios";

function ManagementInven() {
  const location = useLocation();
  const navigate = useNavigate();

  const { selectedMyIngredientList } = location.state || {}; // 넘어온 state 값

  //페이지 변화
  const [isChange, setChange] = useState(false);
  //재료 데이터
  const [isData, setData] = useState([]);

  //수정 재료 데이터
  const [isUpdateData, setUpdateData] = useState([]);
  //재료 선택
  const [isIngred, setIngred] = useState([]);
  //재료 선택 인덱스
  const [isIndex, setIndex] = useState(0);

  const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

  // redux에서 가져오기
  let userId = useSelector(state => state.userEmail.value);
  const dispatch = useDispatch();

  useEffect(() => {
    // setChange(true);

    const fetchData = async () => {

      const params = { userId: userId };

      try {
        console.log("출력");

        // await tokenHandler();
        const res = await axiosInstance.get("inven/manage", { params });

        if (res != null) {
          console.log(res.data);
          setData(res.data);
        }
      } catch (err) {
        console.log("err message : " + err);
      }
    }

    fetchData();
  }, [isChange]);

  const isUsed = (name) => {
    console.log(name)
    console.log(selectedMyIngredientList);
    return selectedMyIngredientList.includes(name);
  }

  async function tokenHandler() {

    const isExpired = expired();
    if (isExpired) {

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
            path: '/',
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

  //재료 삭제
  const deleteData = async (selectIndex) => {

    const selectedItem = isData[selectIndex];

    const params = {
      userId: userId,
      ingredientname: selectedItem.ingredientname
    };

    if (window.confirm(`정말 ${selectedItem.ingredientname}를 삭제하시겠습니까?`)) {
      try {
        console.log(params);
        await tokenHandler();
        await axiosInstance.delete("inven/manage", { params });
        alert("삭제 되었습니다.");
        setChange(!isChange);
      } catch (err) {
        console.log("err message : " + err);
      }
    } else {
      alert("취소 되었습니다.");
    }

  };

  //재료 수정
  const updateData = async () => {

    const data = Object.values(isUpdateData);

    const showdata = data
      .map(item => `${item.ingredientname} - ` + (item.status.size == null ? "" : `양 : ${item.status.size},`) + (item.status.count == null ? "" : ` 수량 : ${item.status.count} `))
      .join('\n ');

    if (window.confirm(`수정내용 확인 \n ${showdata}`)) {
      try {
        await tokenHandler();
        await axiosInstance.patch(`inven/manage/update/${userId}`, data);
        alert("수정 되었습니다.");
        setChange(!isChange);
        navigate("/Main");
      } catch (err) {
        console.log("err message : " + err);
      }
    } else {
      alert("취소 되었습니다.");
    }
  };

  const updateCount = (index, e) => {
    setUpdateData((isUpdateData) => ({
      ...isUpdateData,
      [index]: {
        ...isUpdateData[index],
        "ingredientname": isData[index].ingredientname,
        "status": {
          ...isUpdateData[index]?.status,
          "count": e.target.value,
        }
      }
    }));
  };

  const updateSize = (index, e) => {
    isData[index].size = e.target.value;
    setData(isData);

    setUpdateData((isUpdateData) => ({
      ...isUpdateData,
      [index]: {
        ...isUpdateData[index],
        "ingredientname": isData[index].ingredientname,
        "status": {
          ...isUpdateData[index]?.status,
          "size": e.target.value,
        }
      }
    }));
  };

  //재료 선택

  const selectIngred = (ingred) => {
    if (Object.values(isIngred).includes(ingred)) {
      // Remove the ingredient if it already exists
      const newIsIngred = { ...isIngred };
      const keyToDelete = Object.keys(newIsIngred).find(key => newIsIngred[key] === ingred);
      delete newIsIngred[keyToDelete];
      setIngred(newIsIngred);
    } else {
      setIngred((isIngred) => ({
        ...isIngred,
        [isIndex]: ingred,
      }));
      setIndex(isIndex + 1);
    }
  };

  return (
    <>
      <Navigation />
      <Container fluid className={styles.container}>
        <div className={styles.main}>
          {/* 선택한 재료 섹션 */}
          <Row className={styles.contentRow}>
            <Col md={{ span: 10, offset: 1 }} className={styles.content}>
              <Scrollbars className={styles.scroll}>
                <h2 className={styles.sectionTitle} style={{ textAlign: "center" }}>선택한 재료</h2> {/* 섹션 타이틀 추가 */}
                <div className={styles.item}>
                  {isData && isData.map((item, index) => {
                    if (!isUsed(item.ingredientname)) return null;
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
                            <Button className={styles.btn} variant="none" value={"없음"} disabled={item.status.size === "없음"} onClick={(e) => updateSize(index, e)}>없음</Button>
                          </Col>
                          <Col>
                            <Button className={styles.btn} variant="none" value={"적음"} disabled={item.status.size === "적음"} onClick={(e) => updateSize(index, e)}>적음</Button>
                            <Button className={styles.btn} variant="none" value={"적당함"} disabled={item.status.size === "적당함"} onClick={(e) => updateSize(index, e)}>적당함</Button>
                            <Button className={styles.btn} variant="none" value={"많음"} disabled={item.status.size === "많음"} onClick={(e) => updateSize(index, e)}>많음</Button>
                          </Col>
                          <Col>
                            <p className={styles.text}>수량</p>
                            <Form.Control type="number" className={styles.count} placeholder={item.status.count} onChange={(e) => updateCount(index, e)} />
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

          {/* 선택하지 않은 재료 섹션 */}
          <Row className={styles.contentRow}>
            <Col md={{ span: 10, offset: 1 }} className={styles.content}>
              <Scrollbars className={styles.scroll}>
                <h2 className={styles.sectionTitle} style={{ textAlign: "center" }}>선택하지 않은 재료</h2> {/* 섹션 타이틀 추가 */}
                <div className={styles.item}>
                  {isData && isData.map((item, index) => {
                    if (isUsed(item.ingredientname)) return null;
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
                            <Button className={styles.btn} variant="none" value={"없음"} disabled={item.status.size === "없음"} onClick={(e) => updateSize(index, e)}>없음</Button>
                          </Col>
                          <Col>
                            <Button className={styles.btn} variant="none" value={"적음"} disabled={item.status.size === "적음"} onClick={(e) => updateSize(index, e)}>적음</Button>
                            <Button className={styles.btn} variant="none" value={"적당함"} disabled={item.status.size === "적당함"} onClick={(e) => updateSize(index, e)}>적당함</Button>
                            <Button className={styles.btn} variant="none" value={"많음"} disabled={item.status.size === "많음"} onClick={(e) => updateSize(index, e)}>많음</Button>
                          </Col>
                          <Col>
                            <p className={styles.text}>수량</p>
                            <Form.Control type="number" className={styles.count} placeholder={item.status.count} onChange={(e) => updateCount(index, e)} />
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

          {/* 첫 번째 Row: 일괄 저장 버튼 */}
          <Row className={styles.controllerRow}>
            <Col md={{ span: 10, offset: 1 }} className={styles.controller}>
              <Row className={styles.controllerRow}>
                <Col className={styles.controlform}>
                  <Button className={styles.btn} onClick={updateData} variant="none">일괄 저장</Button>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      </Container>
    </>
  );
}

export default ManagementInven;