import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import Navigation from '../../components/Nav/Navigation';
import '../../styles/Bootstrap/Bootstrap.scss';
import invenStyles from '../../styles/Inven/Inven.module.scss';
import styles from '../../styles/Inven/Excel.module.scss';
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
import SelectEditor from '../../components/Inven/SelectEditor';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import '../../styles/Bootstrap/Bootstrap.scss';

const Store = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
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

    // 인벤 모드 상태
    const [invenMode, setInvenMode] = useState("normal");

    const [isIndex, setIndex] = useState(0);
    const [isIngred, setIngred] = useState([]);

    // 유저 정보
    const userId = useSelector(state => state.userEmail.value);


    const [isChange, setChange] = useState(0);
    const [isData, setData] = useState([]);
    const [isRows, setRows] = useState([]);
    const [isNewData, setIsNewData] = useState({
        ingredientname: "",
        status: {
            unit: "",
            size: 0,
            dateofuse: new Date().toISOString().split('T')[0],
            lastget: new Date().toISOString().split('T')[0]

        }
    });


    // 인벤 데이터 추가 삭제
    const deleteData = async (ingredientname) => {
        const params = {
            userId: userId,
            ingredientname: ingredientname
        };

        if (window.confirm(`정말 ${ingredientname}를 삭제하시겠습니까?`)) {
            try {
                await tokenHandler();
                await axiosInstance.delete("inven/manage", { params });
                toast("삭제되었습니다.", { type: "success", autoClose: 2000 });
                setChange(isChange + 1);
            } catch (err) {
                console.log("Error:", err);
                toast("삭제에 실패했습니다.", { type: "error", autoClose: 2000 });
            }
        } else {
            toast("취소되었습니다.", { type: "info", autoClose: 2000 });
        }
    };
    const updateUnit = async (ingredientname, e) => {
        const newSize = e.target.value;

        const params = [{
            ingredientname: ingredientname,
            status: {
                size: newSize,
            },
        }];

        try {
            await axiosInstance.patch(`inven/manage/update/${userId}`, params);
            setChange(isChange + 1);
            toast("처리 완료!", { type: "success", autoClose: 2000 });
        } catch (err) {
            console.log("Error updating size: ", err);
            toast("업데이트에 실패했습니다.", { type: "error", autoClose: 2000 });
        }
    };


    // 재료 추가 관련
    const [showAddModal, setShowAddModal] = useState(false);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);
    const setIsNewDataChange = (e) => {
        const { name, value } = e.target;

        if (name === "ingredientname") {
            setIsNewData((prevState) => ({
                ...prevState,
                [name]: value,  // ingredientname 업데이트
            }));
        } else {
            // status 안의 필드 업데이트일 경우
            setIsNewData((prevState) => ({
                ...prevState,
                status: {
                    ...prevState.status,  // 기존 status 유지
                    [name]: value,  // status 내 필드 업데이트
                },
            }));
        }
    }

    // 재료 상세 정보 관련
    const [ingredientInfoData, setIngredientInfoData] = useState({
        ingredientname: '',
        status: {
            unit: '',
            size: 0,
        }
    });
    const [showInfoModal, setShowInfoModal] = useState(false);
    const handleShowInfoModal = (item) => {
        setIngredientInfoData({
            ingredientname: item.ingredientname,
            status: {
                unit: item.status.unit,
                size: item.status.size,
            }
        });
        setShowInfoModal(true);
    };
    const handleCloseInfoModal = () => setShowInfoModal(false);
    const handleInfoChange = (e) => {
        const { name, value } = e.target;
        setIngredientInfoData({
            ...ingredientInfoData,
            status: {
                ...ingredientInfoData.status,
                [name]: value,
            }
        });
    };
    const handleInfoChangeSave = () => {
        console.log('업데이트 데이터 : ', ingredientInfoData);

        axiosInstance.patch(`/inven/manage/update/${userId}`, [ingredientInfoData]).then(async res => {
            setChange(isChange + 1);
        }).catch(err => {
            console.log("Error updating item: ", err);
        });
        handleCloseInfoModal();
    };


    // 인벤에서 가져온 데이터 가져오는 useEffect
    useEffect(() => {
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

        const fetchData = async () => {
            const params = { userId: userId };
            try {
                await tokenHandler();
                const res = await axiosInstance.get("inven/manage", { params });
                console.log('get data')
                console.log(res.data);
                setData(res.data);
                if(invenMode === 'expert') formatData(res.data);
            } catch (err) {
                console.log("err message : " + err);
            }
        }
        fetchData();
    }, [userId, invenMode, isChange]);
    const handleAddData = async () => {
        const data = isNewData;

        if(invenMode === 'normal') {
            data.status.unit = "";
            data.status.size = 1;
            data.status.dateofuse = null;
            data.status.lastget = null;
        }else{
            if (!data.status || !data.status.size) {
                toast("재료명을 입력해주세요.", { type: "warning", autoClose: 2000 });
                return;
            }
        }

        if (!data || !data.ingredientname) {
            toast("재료의 양을 입력해주세요.", { type: "warning", autoClose: 2000 });
            return;
        }

        console.log(data);

        try {
            await tokenHandler();
            await axiosInstance.patch(`inven/manage/add/${userId}`, data);
            setChange(isChange + 1);
            setIsNewData({
                ingredientname: "",
                status: {
                    unit: "",
                    size: 0,
                    dateofuse: new Date().toISOString().split('T')[0], // Default to today's date
                    lastget: new Date().toISOString().split('T')[0],
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
                toast("추가에 실패했습니다.", { type: "error", autoClose: 2000 });
            }
        }
    };

    // 선택된 재료 삭제 함수
    const handleSelectionModelChange = (newSelection) => {
        setSelectedRows(newSelection);
    };

    // 재료 업데이트 함수
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
            },
        };

        setData((prevRows) => prevRows.map((row) => (row.ingredientname === newRow.ingredientname ? updateRow : row)));
        return newRow;
    };
    const updateExcelData = async () => {
        const data = Object.values(isData);

        if (window.confirm("수정하시겠습니까?")) {
            try {
                await tokenHandler();
                await axiosInstance.patch(`inven/manage/update/${userId}`, data);
                toast("수정되었습니다.", { type: "success", autoClose: 2000 });
                setChange(!isChange);
            } catch (err) {
                console.log("Error message:", err);
                toast("수정에 실패했습니다.", {type: "error", autoClose: 2000});
            }
        } else {
            toast("취소되었습니다.", {type: "info", autoClose: 2000});
        }
    };
    const deleteExcelData = async () => {
        const params = selectedRows.map(item => `ingredientname=${encodeURIComponent(item)}`).join('&');
        const showdata = selectedRows.map(item => `${item}`).join(', ');

        if (window.confirm(`정말 ${showdata}를 삭제하시겠습니까?`)) {
            try {
                await tokenHandler();
                await axiosInstance.delete(`inven/manage/deleteAll/${userId}?${params}`);
                toast("삭제되었습니다.", { type: "success", autoClose: 2000 });
                setChange(!isChange);
            } catch (err) {
                console.log("Error message:", err);
                toast("삭제에 실패했습니다.", { type: "error", autoClose: 2000 });
            }
        } else {
            toast("취소되었습니다.", { type: "info", autoClose: 2000 });
        }
    };

    // 검색 관련
    const [searchQuery, setSearchQuery] = useState('');
    const searchQueryInKorean = engToKor(searchQuery);
    const searchRegExp = getRegExp(searchQueryInKorean, { initialSearch: true });
    const filteredItemsWithSize = isData.filter(item =>
        item.status.size > 0 && searchRegExp.test(item.ingredientname)
    );
    const filteredItemsWithoutSize = isData.filter(item =>
        item.status.size === 0 && searchRegExp.test(item.ingredientname)
    );
    useEffect(() => {
        setSearchQuery("");
    },[invenMode]);

    //
    const [selectedRows, setSelectedRows] = useState([]);
    const filteredRows = [
        {
            id: 'new',
            ingredientname: '클릭하여 추가',
            size: '',
            unit: '',
            dateofuse: '',
            lastget: ''
        },
        ...isRows.filter(row => searchRegExp.test(row.ingredientname))
    ];
    const columns = [
        { field: "ingredientname", headerName: "재료명", width: 150 },
        { field: "size", headerName: "재료 양", type: "number", width: 130, editable: true },
        {
            field: "unit",
            headerName: "단위",
            width: 150,
            editable: true,
            renderEditCell: (params) => <SelectEditor {...params} />,
        },
        { field: "dateofuse", headerName: "사용기한", type: "Date", width: 200, editable: true },
        { field: "lastuse", headerName: "마지막 사용 날짜", type: "Date", width: 200, editable: true },
        { field: "lastget", headerName: "마지막 구입 날짜", type: "Date", width: 200, editable: true },
        { field: "memo", headerName: "기타", width: 600, editable: true },
    ];

    // 빈 줄을 클릭했을 때 모달을 열도록 설정
    const handleRowClick = (params) => {
        console.log(params);
        if (params.id === '클릭하여 추가') {
            handleShowAddModal();
        }
    };
    return (
        <>
            <Navigation></Navigation>

            <Container fluid className={invenStyles.container}>
                <div className={invenStyles.main}>
                    <Row className={invenStyles.controllerRow}>
                        <Col md={{ span: 10, offset: 1 }} className={invenStyles.controller}>
                            <Row className={invenStyles.controllerRow}>
                                <Col className={invenStyles.controlform}>
                                    <div className={`${invenStyles.buttonGroup} ${invenStyles.middleGroup}`}>
                                        <div className={`${invenStyles.serch} ${invenStyles.searchContainer}`}>
                                            <input
                                                type="text"
                                                placeholder="재료검색"
                                                className={invenStyles.searchInput}
                                                value={searchQuery}
                                                onChange={(e) => setSearchQuery(e.target.value)}
                                            />
                                            <FontAwesomeIcon
                                                icon={faMagnifyingGlass}
                                                className={invenStyles.searchIcon}
                                            />
                                        </div>
                                        {invenMode === "normal" ? (
                                            <>
                                                <button className={invenStyles.button} onClick={() => navigate('/AiSimpleSearch', { state: isIngred })}>요리 시작</button>
                                                <button className={invenStyles.button} onClick={() => setInvenMode("expert")}>
                                                    상세 보기
                                                </button>
                                            </>
                                        ) : (
                                            <>
                                                <button className={invenStyles.button} onClick={() => {
                                                    const selectRow = selectedRows.map(item => item);
                                                    navigate('/AiSimpleSearch', { state: selectRow });
                                                }}>{/*나의 재료로 요리하기*/}요리 시작</button>
                                                <button className={invenStyles.button} onClick={() => setInvenMode("normal")}>
                                                    일반 모드
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </Col>
                            </Row>
                        </Col>
                    </Row>

                    {invenMode === "normal" ? (
                        <Row className={invenStyles.contentRow}>
                            <Col md={{span: 10, offset: 1}} className={invenStyles.content}>
                                <h2>내 재료</h2>
                                <div className={invenStyles.item}>
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
                                                handleShow={handleShowInfoModal}
                                                setChange={setChange}
                                                message={"없음"}
                                            />
                                        ))}
                                    </Row>
                                </div>
                                <hr />
                                <h2>미보유</h2>
                                <div className={invenStyles.item}>
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
                                                handleShow={handleShowInfoModal}
                                                setChange={setChange}
                                                message={"있음"}
                                            />
                                        ))}
                                    </Row>
                                </div>
                            </Col>
                        </Row>
                    ) :(
                        <Row className={styles.contentRow}>
                            <Col md={{span: 10, offset: 1}} className={styles.content}>
                                <Row className={styles.row}>
                                    <Col>
                                        <div className={styles.excel}>
                                            <div style={{
                                                display: "flex",
                                                flexWrap: "wrap",
                                                alignItems: "center",
                                                gap: "10px",
                                                marginBottom: "10px"
                                            }}>
                                                <Button className={styles.btn} onClick={updateExcelData} variant="none">
                                                    일괄 저장
                                                </Button>
                                                <Button className={styles.btn} onClick={deleteExcelData} variant="none">
                                                    선택 삭제
                                                </Button>
                                                {/*<Button className={styles.addBtn} variant="none" onClick={handleShowAddModal}>
                                                    추가
                                                </Button>*/}
                                            </div>
                                            <DataGrid
                                                rows={filteredRows}
                                                columns={columns}
                                                getRowId={(row) => row.ingredientname}
                                                onRowClick={handleRowClick} // 빈 줄 클릭 이벤트
                                                processRowUpdate={handleProcessRowUpdate}
                                                checkboxSelection
                                                disableRowSelectionOnClick
                                                disableColumnFilter
                                                disableColumnSelector
                                                disableDensitySelector
                                                onRowSelectionModelChange={(newSelection) => handleSelectionModelChange(newSelection)}
                                                selectionModel={selectedRows}
                                            />
                                        </div>
                                    </Col>
                                </Row>
                            </Col>
                        </Row>
                    )}
                </div>
            </Container>

            {/*재료 상세 정보 모달*/}
            <Modal show={showInfoModal} onHide={handleCloseInfoModal}>
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
                                value={ingredientInfoData.ingredientname}
                                onChange={handleInfoChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="size">
                            <Form.Label>양</Form.Label>
                            <Form.Control
                                type="number"
                                name="size"
                                min="0"
                                value={ingredientInfoData.status.size}
                                onChange={handleInfoChange}
                            />
                        </Form.Group>
                        <Form.Group controlId="unit">
                            <Form.Label>단위</Form.Label>
                            <Form.Control
                                type="text"
                                name="unit"
                                value={ingredientInfoData.status.unit}
                                onChange={handleInfoChange}
                            />
                        </Form.Group>
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseInfoModal}>
                        닫기
                    </Button>
                    <Button variant="primary" onClick={handleInfoChangeSave}>
                        저장
                    </Button>
                </Modal.Footer>
            </Modal>

            {/*재료 추가 모달*/}
            <Modal show={showAddModal} onHide={handleCloseAddModal}>
                <Modal.Header closeButton>
                    <Modal.Title>재료 추가</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={async (e) => {
                        e.preventDefault();
                        await handleAddData();
                    }}>
                        <Form.Label>재료명</Form.Label>
                        <Form.Control
                            type="text"
                            name="ingredientname"
                            value={isNewData.ingredientname}
                            onChange={setIsNewDataChange}
                        />
                        {invenMode === "expert" && (
                            <>
                                <Form.Label>사이즈</Form.Label>
                                <Form.Control
                                    type="number"
                                    name="size"  // name 속성 추가
                                    onChange={setIsNewDataChange}
                                    value={isNewData.status.size}
                                    placeholder="0"
                                />

                                <Form.Label>단위</Form.Label>
                                <Form.Select
                                    name="unit"  // name 속성 추가
                                    onChange={setIsNewDataChange}
                                    value={isNewData.status.unit}
                                >
                                    <option value="g">g</option>
                                    <option value="개">개</option>
                                    <option value="ml">ml</option>
                                    <option value="통">통</option>
                                </Form.Select>

                                <Form.Label>사용기한</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="dateofuse"  // name 속성 추가
                                    value={isNewData.status.dateofuse}
                                    onChange={setIsNewDataChange}
                                />

                                <Form.Label>마지막 구입 날짜</Form.Label>
                                <Form.Control
                                    type="date"
                                    name="lastget"  // name 속성 추가
                                    value={isNewData.status.lastget}
                                    onChange={setIsNewDataChange}
                                />
                            </>
                        )}
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
    )
}

export default Store;