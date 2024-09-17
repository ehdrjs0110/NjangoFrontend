import React, {useState, useEffect} from 'react';
import { useNavigate } from "react-router-dom";
import classNames from 'classnames';

import Navigation from '../../components/Nav/Navigation'

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Inven/Inven.module.scss'

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Modal, Button, Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';

import {useCookies} from "react-cookie";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
import {axiosInstance} from "../../middleware/customAxios";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function Inven() {
  const navigate = useNavigate();

  const [showAddContainer, setShowAddContainer] = useState(false);
  //페이지 변화
  const [isChange, setChange] = useState(false);
  //재료 데이터
  const [isData, setData] = useState([]);
  //추가 재료 데이터
  const [isNewData, setNewData] = useState({
    ingredientname: "",
    status: {
      unit: "",
      size: "",
    }
  });
  const [showAddModal, setShowAddModal] = useState(false); // 추가 모달 상태
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);


  //수정 재료 데이터
  const [isUpdateData, setUpdateData] = useState([]);
  //추가 사이즈 선택 버튼
  const [isClickSize, setClickSize] = useState("");
  //재료 선택
  const [isIngred, setIngred] = useState([]);
  //재료 선택 인덱스
  const [isIndex, setIndex] = useState(0);

  const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

  // redux에서 가져오기
  let accessToken = useSelector(state => state.token.value);
  let userId = useSelector(state => state.userEmail.value);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {

      const params = { userId:userId};

      try{
        console.log("출력");

        // await tokenHandler();
        const res = await axiosInstance.get("inven/manage", {params});

        if(res!=null){
          console.log(res.data);
          setData(res.data);
          setChange(true);
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
  const handleAddData = async () => {

    const data = isNewData;

    try{
      console.log(data);

      if (!data || !data.ingredientname) {
        alert("재료명을 입력해주세요.");
        return;
      }

      if (!data.status || !data.status.unit) {
        alert("재료의 단위를 선택해주세요.");
        return;
      }

      await tokenHandler();
      await axiosInstance.patch(`inven/manage/add/${userId}`, data);
      setChange(!isChange);
      setClickSize("");
      setNewData((isNewData) => ({
        "ingredientname" : "",
        "status" : {
          "unit" : "",
          "size" : "",
        }
      }));

      toast("추가 완료!", { type: "success", autoClose: 2000 });
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

  //재료 수정
  const updateData = async () => {

    const data = Object.values(isUpdateData);

    const showdata = data
    .map(item => `${item.ingredientname} - ` + (item.status.unit == null ? "" : `단위 : ${item.status.unit},`) + (item.status.size == null ? "" : ` 양 : ${item.status.size} `))
    .join('\n ');

    if(window.confirm(`수정내용 확인 \n ${showdata}`)){
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

  const updateSize = (index,e) => {
    setUpdateData((isUpdateData) => ({
      ...isUpdateData,
      [index] : {
        ...isUpdateData[index],
        "ingredientname" : isData[index].ingredientname,
        "status" : {
          ...isUpdateData[index]?.status,
          "size" : e.target.value,
        }
      }
    }));
  };

  const updateUnit = async (index, e) => {
    const newSize = e.target.value;
    const updatedData = [...isData];
    updatedData[index].status.size = newSize;
    setData(updatedData);

    setUpdateData((isUpdateData) => ({
      ...isUpdateData,
      [index]: {
        ...isUpdateData[index],
        ingredientname: isData[index].ingredientname,
        status: {
          ...isUpdateData[index]?.status,
          size: newSize,
        },
      },
    }));

    // 서버에 업데이트 요청
    try {
      await axiosInstance.patch(`inven/manage/update/${userId}`, [{
        ingredientname: isData[index].ingredientname,
        status: {
          size: newSize,
        },
      }]);
      setChange(!isChange); // 상태 변경하여 useEffect 트리거
      toast("처리 완료!", { type: "success", autoClose: 2000 });
    } catch (err) {
      console.log("Error updating size: ", err);
    }
  };

  //재료명 입력
  const setIngredName = (e) => {
    setNewData((isNewData) => ({
      ...isNewData,
      "ingredientname" : e.target.value,
    }));

  };

  //재료단위 입력
  const setUnit = (e) => {
    setClickSize(e.target.value);
    setNewData((isNewData) => ({
      ...isNewData,
      "status" : {
        ...isNewData.status,
        "unit" : e.target.value,
      }
    }));

  };

  //재료양 입력
  const setSize = (e) => {
    setNewData((isNewData) => ({
      ...isNewData,
      "status" : {
        ...isNewData.status,
        "size" : e.target.value,
      }
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

  const toggleAddContainer = () => {
    setShowAddContainer(!showAddContainer); // 버튼 클릭 시 addContainer를 토글합니다.
  };




  const [show, setShow] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    ingredientname: '',
    status: {
      unit: '',
      size: 0,
    }
  });

  const handleClose = () => setShow(false);
  const handleShow = (item) => {
    setSelectedItem(item);
    setFormData({
      ingredientname: item.ingredientname,
      status: {
        unit: item.status.unit,
        size: item.status.size,
      }
    });
    setShow(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleStatusChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      status: {
        ...formData.status,
        [name]: value,
      }
    });
  };

  const handleSaveChanges = () => {
    console.log("Updated item: ", formData);
    axiosInstance.patch(`/inven/manage/updateOne/${userId}`, formData).then(async res => {
      console.log("Updated item: ", res.data);
      const params = {userId: userId};
      try {
        const res = await axiosInstance.get("inven/manage", {params});
        if (res != null) {
          console.log(res.data);
          setData(res.data);
          setChange(true);
        }
      } catch (err) {
        console.log("err message : " + err);
      }
    }).catch(err => {
        console.log("Error updating item: ", err);
    });
    handleClose(); // 저장 후 모달 닫기
  };




  return (
    <>
      <Navigation></Navigation>
      <Container fluid className={styles.container}>
        <div className={styles.main}>

        <Row className={styles.controllerRow}>
          <Col md={{span: 10, offset: 1}} className={styles.controller}>

            {/* 첫 번째 버튼 그룹 */}
            <Row className={styles.controllerRow}>
              <Col className={styles.controlform}>
                {/* 두 번째 버튼 그룹: 윗줄에 위치 */}
                <div className={`${styles.buttonGroup} ${styles.topGroup}`}>
                  <button className={styles.button} onClick={cookmode}>요리 시작</button>
                  <button className={styles.button} onClick={excelmode}>전문가 모드</button>
                </div>

                {/* 첫 번째 버튼 그룹: 중간에 위치 */}
                <div className={`${styles.buttonGroup} ${styles.middleGroup}`}>
                  <div className={`${styles.serch} ${styles.searchContainer}`}>
                    <input
                        type="text"
                        placeholder="재료검색"
                        className={styles.searchInput}
                    />
                    <FontAwesomeIcon
                        icon={faMagnifyingGlass}
                        className={styles.searchIcon}
                    />
                  </div>
                  <button className={styles.button} onClick={handleShowAddModal}>추가</button>
                </div>
              </Col>
            </Row>

          </Col>
        </Row>
          {/* 식재료 나타나는 공간 */}
          <Row className={styles.contentRow}>
            <Col md={{span: 10, offset: 1}} className={styles.content}>
              <div className={styles.item}>
                <Row style={{ width: '100%', margin: '0 auto' }}>
                  {isData && isData.map((item, index) => {
                    const combinedClassName = classNames(
                      styles.line,
                      {
                        [styles.select]: Object.values(isIngred).includes(item.ingredientname),
                      }
                    );

                    return (
                      <Col key={index}
                           xs={12} sm={6} md={4} lg={3} xl={2}  // 반응형으로 설정
                           className="item">
                        <div className={combinedClassName} onClick={(e) => selectIngred(item.ingredientname)}>
                          <div className={styles.ingredient} style={{backgroundImage: `url('/ingredients/${item.ingredientname}.png')`}}>
                            <h3 className={styles.title}>{item.ingredientname}</h3>
                          </div>

                          {/* 버튼 클릭 시 이벤트 버블링 방지 */}
                          <Button className={styles.btn} variant="none" value={"없음"} disabled={item.status.unit === "없음"} onClick={async (e) => {
                            e.stopPropagation(); // 버블링 방지
                            await updateUnit(index, {target: {value: 0}}); // Set unit to 0
                            setChange(!isChange); // Trigger re-fetch of the list
                          }}>없음</Button>

                          <Button className={styles.delBtn} onClick={(e) => {
                            e.stopPropagation(); // 버블링 방지
                            deleteData(index);
                          }} variant="danger">삭제</Button>

                          <Button className={styles.infoBtn} variant="info" onClick={(e) => {
                            e.stopPropagation(); // 버블링 방지
                            handleShow(item);
                          }}>
                            <FontAwesomeIcon icon={faInfoCircle} /> {/* FontAwesome 아이콘 */}
                          </Button>
                        </div>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      </Container>

      {/* 모달 컴포넌트 */}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>상세 정보 수정</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* 재료명 수정 */}
            <Form.Group controlId="ingredientName">
              <Form.Label>재료명</Form.Label>
              <Form.Control
                  type="text"
                  name="ingredientname"
                  value={formData.ingredientname}
                  onChange={handleInputChange}
              />
            </Form.Group>

            {/* 양 수정 */}
            <Form.Group controlId="size">
              <Form.Label>양</Form.Label>
              <Form.Control
                  type="number"
                  name="size"
                  min="0" // 0 이상의 값만 허용
                  value={formData.status.size}
                  onChange={handleStatusChange}
              />
            </Form.Group>

            {/* 단위 수정 */}
            <Form.Group controlId="unit">
              <Form.Label>단위</Form.Label>
              <Form.Control
                  type="text"
                  name="unit"
                  value={formData.status.unit}
                  onChange={handleStatusChange}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleSaveChanges}>
            저장
          </Button>
        </Modal.Footer>
      </Modal>

      {/* 모달 컴포넌트: 식재료 추가 */}
      <Modal show={showAddModal} onHide={handleCloseAddModal}>
        <Modal.Header closeButton>
          <Modal.Title>재료 추가</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            {/* 재료명 입력 */}
            <Form.Group controlId="ingredientName">
              <Form.Label>재료명</Form.Label>
              <Form.Control
                  type="text"
                  name="ingredientname"
                  value={isNewData.ingredientname}
                  onChange={setIngredName}
              />
            </Form.Group>

            {/* 양 입력 */}
            <Form.Group controlId="size">
              <Form.Label>양</Form.Label>
              <Form.Control
                  type="number"
                  name="size"
                  min="0"
                  value={isNewData.status.size}
                  onChange={setSize}
              />
            </Form.Group>

            {/* 단위 입력 */}
            <Form.Group controlId="unit">
              <Form.Label>단위</Form.Label>
              <Form.Control
                  type="text"
                  name="unit"
                  value={isNewData.status.unit}
                  onChange={setUnit}
              />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseAddModal}>
            닫기
          </Button>
          <Button variant="primary" onClick={handleAddData}>
            추가
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer />
    </>
  );
}

export default Inven;