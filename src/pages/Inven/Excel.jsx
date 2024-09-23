import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import SelectEditor from '../../components/Inven/SelectEditor';

import Navigation from '../../components/Nav/Navigation';
import axios from "axios";

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Inven/Excel.module.scss';

import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import { useCookies } from "react-cookie";
import { expired, getNewToken } from "../../services/auth2";
import { containToken } from "../../Store/tokenSlice";
import { useDispatch, useSelector } from "react-redux";

import jwtDecode from "jwt-decode";
import { containEmail } from "../../Store/userEmailSlice";
import { containNickName } from "../../Store/userNickName";

import { axiosInstance } from "../../middleware/customAxios";
import { arrayNestedArray, makeFlatArray } from "../../services/arrayChecker";
import { getRegExp, engToKor } from 'korean-regexp';
import Table from "react-bootstrap/Table";
import {Modal} from "react-bootstrap";
import { ToastContainer, toast } from 'react-toastify';

function Excel() {
    const navigate = useNavigate();

    // 페이지 변화 상태
    const [isChange, setChange] = useState(false);

    // 재료 데이터 상태
    const [isData, setData] = useState([]);

    // 재료 포맷 데이터 상태
    const [isRows, setRows] = useState([]);

    // 추가 재료 데이터 상태
    const [isNewData, setNewData] = useState({
        ingredientname: "",
        status: {
            size: 0,
            dateofuse: Date.now(),
            lastget: Date.now()
        },
    });

    // 선택된 재료 상태
    const [selectedRows, setSelectedRows] = useState([]);

    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    const reduxEmail = useSelector(state => state.userEmail.value);
    const reduxNickname = useSelector(state => state.userNickName.value);

    // 검색 상태
    const [searchQuery, setSearchQuery] = useState('');
    const handleSearch = (searchValue) => setSearchQuery(searchValue);

    const searchQueryInKorean = engToKor(searchQuery);
    const searchRegExp = getRegExp(searchQueryInKorean, { initialSearch: true });

    const filteredRows = isRows.filter(row => searchRegExp.test(row.ingredientname));

    // Redux에서 토큰 가져오기
    const accessToken = useSelector(state => state.token.value);
    const userId = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();

    const [showAddModal, setShowAddModal] = useState(false);
    const handleShowAddModal = () => setShowAddModal(true);
    const handleCloseAddModal = () => setShowAddModal(false);

    // 테이블 컬럼 정의
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

    useEffect(() => {
        const fetchData = async () => {
            const params = { userId: userId };

            try {
                await tokenHandler();
                const res = await axiosInstance.get("inven/manage/all", { params });
                setData(res.data);
                formatData(res.data);
            } catch (err) {
                console.log("Error message:", err);
            }
        };

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

    // 재료 추가 관련 함수
    const setIngredName = (e) => {
        setNewData((isNewData) => ({
            ...isNewData,
            [e.target.id]: e.target.value,
        }));
    };

    const setInsertData = (e) => {
        setNewData((isNewData) => ({
            ...isNewData,
            "status": {
                ...isNewData?.status,
                [e.target.id]: e.target.value,
            },
        }));
    };

    const addData = async () => {
        const data = isNewData;

        if (!data || !data.ingredientname) {
            alert("재료명을 입력해주세요.");
            return;
        }

        if (!data.status || !data.status.size) {
            alert("재료의 양을 입력해주세요.");
            return;
        }

        console.log(data);

        try {
            await tokenHandler();
            await axiosInstance.patch(`inven/manage/add/${userId}`, data);
            setChange(!isChange);
            toast("추가 완료!", { type: "success", autoClose: 2000 });
        } catch (err) {
            console.log("Error message:", err);
        }

        setNewData({
            ingredientname: "",
            status: {
                size: 0,
                unit: "g",
                dateofuse: new Date().toISOString().split('T')[0], // Default to today's date
                lastget: new Date().toISOString().split('T')[0], // Default to today's date
            },
        });
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

    // 재료 수정
    const updateData = async () => {
        const data = Object.values(isData);

        if (window.confirm("수정하시겠습니까?")) {
            try {
                await tokenHandler();
                await axiosInstance.patch(`inven/manage/update/${userId}`, data);
                alert("수정되었습니다.");
                setChange(!isChange);
            } catch (err) {
                console.log("Error message:", err);
            }
        } else {
            alert("취소되었습니다.");
        }
    };

    // 재료 삭제
    const deleteData = async () => {
        const params = selectedRows.map(item => `ingredientname=${encodeURIComponent(item)}`).join('&');
        const showdata = selectedRows.map(item => `${item}`).join(', ');

        if (window.confirm(`정말 ${showdata}를 삭제하시겠습니까?`)) {
            try {
                await tokenHandler();
                await axiosInstance.delete(`inven/manage/deleteAll/${userId}?${params}`);
                alert("삭제되었습니다.");
                setChange(!isChange);
            } catch (err) {
                console.log("Error message:", err);
            }
        } else {
            alert("취소되었습니다.");
        }
    };

    // 모드 전환 함수
    const normalmode = () => navigate('/Inven');

    const cookmode = () => {
        const selectRow = selectedRows.map(item => item);
        navigate('/AiSimpleSearch', { state: selectRow });
    };

    return (
        <>
            <Navigation invenMode={1}/>
            <Container fluid className={styles.container}>
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
                                        <Form.Control
                                            type="text"
                                            placeholder="재료검색"
                                            value={searchQuery}
                                            onChange={(e) => handleSearch(e.target.value)}
                                            style={{flex: "1 1 30%", minWidth: "200px"}}
                                        />
                                        <Button className={styles.btn} onClick={cookmode} variant="none">나의 재료로 요리하기</Button>
                                        <Button className={styles.btn} onClick={updateData} variant="none">
                                            일괄 저장
                                        </Button>
                                        <Button className={styles.btn} onClick={deleteData} variant="none">
                                            선택 삭제
                                        </Button>
                                        <Button className={styles.addBtn} variant="none" onClick={handleShowAddModal}>
                                            추가
                                        </Button>
                                        {/*<Button onClick={normalmode} variant="danger">일반 모드</Button>*/}
                                    </div>
                                    <DataGrid
                                        rows={filteredRows}
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
                                    />
                                </div>
                            </Col>
                        </Row>
                    </Col>
                </Row>
            </Container>

            <Modal show={showAddModal} onHide={handleCloseAddModal}>
                <Modal.Header closeButton>
                    <Modal.Title>재료 추가</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Form onSubmit={async (e) => {
                        e.preventDefault();
                        await addData();
                    }}>
                            <Form.Label>재료명</Form.Label>
                            <Form.Control
                                type="text"
                                id="ingredientname"
                                name="ingredientname"
                                value={isNewData.ingredientname}
                                onChange={setIngredName}
                            />
                            <Form.Label>사이즈</Form.Label>
                            <Form.Control
                                type="number"
                                id="size"
                                onChange={setInsertData}
                                value={isNewData.status.size}
                                placeholder="0"
                            />
                            <Form.Label>단위</Form.Label>
                            <Form.Select
                                id="unit"
                                onChange={setInsertData}
                                defaultValue={isNewData.status.unit}
                            >
                                <option value="g">g</option>
                                <option value="개">개</option>
                                <option value="ml">ml</option>
                                <option value="통">통</option>
                            </Form.Select>
                            <Form.Label>사용기한</Form.Label>
                            <Form.Control
                                type="date"
                                id="dateofuse"
                                value={isNewData.status.dateofuse}
                                onChange={setInsertData}
                            />
                            <Form.Label>마지막 구입 날짜</Form.Label>
                            <Form.Control
                                type="date"
                                id="lastget"
                                value={isNewData.status.lastget}
                                onChange={setInsertData}
                            />
                    </Form>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleCloseAddModal}>
                        닫기
                    </Button>
                    <Button variant="primary" onClick={addData}>
                        추가
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer />
        </>
    );
}

export default Excel;
