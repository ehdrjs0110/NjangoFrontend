import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import classNames from 'classnames';
import Navigation from '../../components/Nav/Navigation';
import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Inven/Inven.module.scss';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import { Modal, Button, Form } from 'react-bootstrap';
import Col from 'react-bootstrap/Col';
import { useCookies } from "react-cookie";
import { expired, getNewToken } from "../../services/auth2";
import { containToken } from "../../Store/tokenSlice";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance } from "../../middleware/customAxios";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMagnifyingGlass, faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  getRegExp,
  engToKor,
} from 'korean-regexp';
import IngredientItem from "../../components/Inven/IngredientItem";

function Inven() {
  const navigate = useNavigate();
  const [isChange, setChange] = useState(false);
  const [isData, setData] = useState([]);
  const [isNewData, setNewData] = useState({
    ingredientname: "",
    status: {
      unit: "",
      size: "",
    }
  });
  const [showAddModal, setShowAddModal] = useState(false);
  const handleShowAddModal = () => setShowAddModal(true);
  const handleCloseAddModal = () => setShowAddModal(false);
  const [isIngred, setIngred] = useState([]);
  const [isIndex, setIndex] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const searchQueryInKorean = engToKor(searchQuery);
  const searchRegExp = getRegExp(searchQueryInKorean, { initialSearch: true });
  const filteredItemsWithSize = isData.filter(item =>
      item.status.size > 0 && searchRegExp.test(item.ingredientname)
  );
  const filteredItemsWithoutSize = isData.filter(item =>
      item.status.size === 0 && searchRegExp.test(item.ingredientname)
  );

  const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
  let accessToken = useSelector(state => state.token.value);
  let userId = useSelector(state => state.userEmail.value);
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchData = async () => {
      const params = { userId: userId };
      try {
        console.log(params);
        const res = await axiosInstance.get("inven/manage", { params });
        if (res && res.data) {
          setData(res.data);
          setChange(true);
        }
      } catch (err) {
        console.log("err message : " + err);
      }
    }
    fetchData();
  }, [isChange]);

  async function tokenHandler() {
    const isExpired = expired();
    if (isExpired) {
      let refreshToken = cookies.refreshToken;
      try {
        const result = await getNewToken(refreshToken);
        refreshToken = result.newRefreshToken;
        setCookie('refreshToken', refreshToken, {
          path: '/',
          maxAge: 7 * 24 * 60 * 60,
        });
        dispatch(containToken(result.newToken));
      } catch (error) {
        console.log(error);
        navigate('/Sign');
      }
    }
  }

  const handleAddData = async () => {
    const data = isNewData;

    data.status.unit = "";
    data.status.size = 1;

    try {
      if (!data || !data.ingredientname) {
        alert("재료명을 입력해주세요.");
        return;
      }
      await tokenHandler();
      await axiosInstance.patch(`inven/manage/add/${userId}`, data);
      setChange(!isChange);
      setNewData({
        ingredientname: "",
        status: {
          unit: "",
          size: "",
        },
      });
      toast("추가 완료!", { type: "success", autoClose: 2000 });
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 409:
            alert("이미 존재하는 재료입니다.");
            break;
          case 404:
            alert("유저 관련 문제가 발생했습니다.");
            break;
          case 400:
            alert("서버 문제로 인해 요청을 처리할 수 없습니다.");
            break;
          default:
            alert("알 수 없는 오류가 발생했습니다.");
        }
      } else {
        console.log("err message : " + err);
      }
    }
  };

  const deleteData = async (ingredientname) => {
    const params = {
      userId: userId,
      ingredientname: ingredientname
    };

    if (window.confirm(`정말 ${ingredientname}를 삭제하시겠습니까?`)) {
      try {
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

  const updateUnit = async (ingredientname, e) => {
    const newSize = e.target.value;
    const updatedData = [...isData];
    const index = updatedData.findIndex(item => item.ingredientname === ingredientname);

    updatedData[index].status.size = newSize;
    setData(updatedData);

    const params = [{
      ingredientname: isData[index].ingredientname,
      status: {
        size: newSize,
      },
    }];

    try {
      await axiosInstance.patch(`inven/manage/update/${userId}`, params);
      setChange(!isChange);
      toast("처리 완료!", { type: "success", autoClose: 2000 });
    } catch (err) {
      console.log("Error updating size: ", err);
    }
  };

  const setIngredName = (e) => {
    setNewData((isNewData) => ({
      ...isNewData,
      "ingredientname": e.target.value,
    }));
  };

  const selectIngred = (ingred) => {
    if (Object.values(isIngred).includes(ingred)) {
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

  const excelmode = () => {
    navigate('/Excel');
  };

  const cookmode = () => {
    navigate('/AiSimpleSearch', { state: isIngred });
  };

  const [show, setShow] = useState(false);
  const [formData, setFormData] = useState({
    ingredientname: '',
    status: {
      unit: '',
      size: 0,
    }
  });

  const handleClose = () => setShow(false);
  const handleShow = (item) => {
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
    console.log('업데이트 데이터 : ', formData);

    axiosInstance.patch(`/inven/manage/update/${userId}`, [formData]).then(async res => {
      const params = { userId: userId };
      try {
        const res = await axiosInstance.get("inven/manage", { params });
        if (res != null) {
          setData(res.data);
          setChange(true);
        }
      } catch (err) {
        console.log("err message : " + err);
      }
    }).catch(err => {
      console.log("Error updating item: ", err);
    });
    handleClose();
  };

  return (
      <>
        <Navigation></Navigation>
        <Container fluid className={styles.container}>
          <div className={styles.main}>
            <Row className={styles.controllerRow}>
              <Col md={{ span: 10, offset: 1 }} className={styles.controller}>
                <Row className={styles.controllerRow}>
                  <Col className={styles.controlform}>
                    {/*<div className={`${styles.buttonGroup} ${styles.topGroup}`}>*/}
                    {/*</div>*/}
                    <div className={`${styles.buttonGroup} ${styles.middleGroup}`}>
                      <div className={`${styles.serch} ${styles.searchContainer}`}>
                        <input
                            type="text"
                            placeholder="재료검색"
                            className={styles.searchInput}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <FontAwesomeIcon
                            icon={faMagnifyingGlass}
                            className={styles.searchIcon}
                        />
                      </div>
                      {/*<button className={styles.button} onClick={handleShowAddModal}>추가</button>*/}
                      <button className={styles.button} onClick={cookmode}>요리 시작</button>
                      <Button className={styles.button} onClick={excelmode} variant={"danger"}>전문가 모드</Button>
                    </div>
                  </Col>
                </Row>
              </Col>
            </Row>
            <Row className={styles.contentRow}>
              <Col md={{span: 10, offset: 1}} className={styles.content}>
                <h2>갖고있어요!</h2>
                <div className={styles.item}>
                  <Row style={{ width: '100%', margin: '0 auto' }}>
                    <IngredientItem
                        key={-1}
                        item={{ingredientname: "추가"}}
                        handleShow={handleShowAddModal}
                        message={"추가"}
                    />
                    {filteredItemsWithSize.map((item, index) => (
                        <IngredientItem
                            key={index}
                            item={item}
                            index={index}
                            isIngred={isIngred}
                            selectIngred={selectIngred}
                            updateUnit={updateUnit}
                            deleteData={deleteData}
                            handleShow={handleShow}
                            setChange={setChange}
                            message={"없음"}
                        />
                    ))}
                  </Row>
                </div>
                <hr />
                <h2>사주세요ㅠㅠ</h2>
                <div className={styles.item}>
                  <Row style={{ width: '100%', margin: '0 auto' }}>
                    {filteredItemsWithoutSize.map((item, index) => (
                        <IngredientItem
                            key={index}
                            item={item}
                            index={index}
                            isIngred={isIngred}
                            selectIngred={selectIngred}
                            updateUnit={updateUnit}
                            deleteData={deleteData}
                            handleShow={handleShow}
                            setChange={setChange}
                            message={"있음"}
                        />
                    ))}
                  </Row>
                </div>
              </Col>
            </Row>
          </div>
        </Container>

        <Modal show={show} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>상세 정보 수정</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group controlId="ingredientName">
                <Form.Label>재료명</Form.Label>
                <Form.Control
                    type="text"
                    name="ingredientname"
                    value={formData.ingredientname}
                    onChange={handleInputChange}
                />
              </Form.Group>
              <Form.Group controlId="size">
                <Form.Label>양</Form.Label>
                <Form.Control
                    type="number"
                    name="size"
                    min="0"
                    value={formData.status.size}
                    onChange={handleStatusChange}
                />
              </Form.Group>
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

        <Modal show={showAddModal} onHide={handleCloseAddModal}>
          <Modal.Header closeButton>
            <Modal.Title>재료 추가</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form onSubmit={async (e) => {
              e.preventDefault();
              await handleAddData();
            }}>
              <Form.Group controlId="ingredientName">
                <Form.Label>재료명</Form.Label>
                <Form.Control
                    type="text"
                    name="ingredientname"
                    value={isNewData.ingredientname}
                    onChange={setIngredName}
                />
              </Form.Group>
              {/*<Form.Group controlId="size">
              <Form.Label>양</Form.Label>
              <Form.Control
                type="number"
                name="size"
                min="0"
                value={isNewData.status.size}
                onChange={setSize}
              />
            </Form.Group>
            <Form.Group controlId="unit">
              <Form.Label>단위</Form.Label>
              <Form.Control
                type="text"
                name="unit"
                value={isNewData.status.unit}
                onChange={setUnit}
              />
            </Form.Group>*/}
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