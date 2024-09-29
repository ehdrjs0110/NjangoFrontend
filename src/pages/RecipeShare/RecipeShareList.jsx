import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import Table from "react-bootstrap/Table";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UpdateModel from '../../components/RecipeShare/SelectRecipe';
import Navigation from '../../components/Nav/Navigation'

import styles from '../../styles/RecipeShare/RecipeShare.module.scss';
import {useNavigate} from "react-router-dom";
// auth 관련 --
import {useCookies} from "react-cookie";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
//--

import {axiosInstance} from "../../middleware/customAxios";
import {
    getRegExp,
    engToKor,
} from 'korean-regexp';
import InputGroup from "react-bootstrap/InputGroup";


const RecipeShareList = () => {
    const [isList, setList] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [keyword, setKeyword] = useState("");
    const [searchInput, setSearchInput] = useState(""); // 검색어 상태
    const [isChange, setChange] = useState(false);
    const [modalShow, setModalShow] = useState(false);
    const navigate = useNavigate();

    const [cookies, setCookie] = useCookies(['refreshToken']);
    let accessToken = useSelector(state => state.token.value);
    let userId = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();

    useEffect(() => {
        fetchData(currentPage, pageSize, keyword);
    }, [currentPage, pageSize, keyword, isChange]);

    const fetchData = async (page, size, keyword) => {
        try {
            await tokenHandler();
            const res = await axiosInstance.get(`recipeShare`, {
                params: {
                    page: page,
                    size: size,
                    keyword: keyword
                }
            });
            const storedRecipe = res.data.content;
            setList(storedRecipe);
            setTotalPages(res.data.totalPages);
        } catch (err) {
            console.log("Error fetching data: ", err);
            setChange(!isChange);
        }
    }

    const handleSearch = () => {
        const normalizedKeyword = encodeURIComponent(getRegExp(engToKor(searchInput)));
        setKeyword(normalizedKeyword);
        setCurrentPage(1); // 검색 시 첫 페이지로 이동
    };

    const handleInputChange = (e) => {
        setSearchInput(e.target.value);
    };

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

    const goDetail = (recipeShareId) => {
        navigate('/RecipeShareDetail', { state: { recipeShareId } });
    }

    // 페이지네이션을 위한 함수
    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();

        // 연, 월, 일, 시, 분 추출
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
        const day = date.getDate();
        const hours = String(date.getHours()).padStart(2, '0'); // 24시간 형식, 두 자리로 맞춤
        const minutes = String(date.getMinutes()).padStart(2, '0');

        // 현재 날짜와 비교
        const isToday = now.getFullYear() === year &&
            now.getMonth() === (month - 1) &&
            now.getDate() === day;

        // 오늘 날짜이면 시간만 반환 (24시간 형식)
        if (isToday) {
            return `${hours}:${minutes}`;
        }

        // 다른 날짜이면 MM/DD 형식으로 반환
        const formattedMonth = String(month).padStart(2, '0'); // 두 자리로 맞춤
        const formattedDay = String(day).padStart(2, '0');
        return `${formattedMonth}/${formattedDay}`;
    }

    // recipe UI
    function ListResponse() {
        if (isList.length > 0) {
            return isList.map((list, index) => (
                <tr key={index}>
                    {/*<td>{list.recipeShareId}</td>*/}
                    <td onClick={() => goDetail(list.recipeShareId)}>{list.title}</td>
                    <td>{list.nickname}</td>
                    <td>{formatDate(list.createAt)}</td>
                    <td>{list.likeCount}</td>
                </tr>
            ));
        }
        return null;
    }

    // 페이지 입력으로 이동 기능 추가
    const handlePageInput = (e) => {
        const inputPage = parseInt(e.target.value, 10);
        if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= totalPages) {
            handlePageChange(inputPage);
        }
    };

    // 페이지네이션 UI
    function Pagination() {
        const pages = [];
        const maxPagesToShow = 5; // 최대 표시할 페이지 수
        const halfMaxPagesToShow = Math.floor(maxPagesToShow / 2);

        // 시작 페이지와 끝 페이지 계산
        let startPage = Math.max(1, currentPage - halfMaxPagesToShow);
        let endPage = Math.min(totalPages, currentPage + halfMaxPagesToShow);

        // 페이지가 적을 때는 startPage와 endPage를 조정
        if (endPage - startPage + 1 < maxPagesToShow) {
            if (currentPage <= halfMaxPagesToShow) {
                endPage = Math.min(totalPages, maxPagesToShow);
            } else if (totalPages - currentPage < halfMaxPagesToShow) {
                startPage = Math.max(1, totalPages - maxPagesToShow + 1);
            }
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <Button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={i === currentPage ? 'active' : ''}
                >
                    {i}
                </Button>
            );
        }
        pages.push(
            <input
                type="number"
                min="1"
                max={totalPages}
                placeholder="..."
                onChange={handlePageInput}
            />
        )

        return (
            <div className={styles.pagination}>
                <Button onClick={() => handlePageChange(1)} disabled={currentPage === 1}>
                    &lt;&lt;
                </Button>
                <Button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}>
                    &lt;
                </Button>
                {pages}
                <Button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}>
                    &gt;
                </Button>
                <Button onClick={() => handlePageChange(totalPages)} disabled={currentPage === totalPages}>
                    &gt;&gt;
                </Button>
            </div>
        );
    }

    return (
        <div className={styles.container}>
            <Navigation/>
            <Container fluid>
                <div className={styles.rowContainer}>
                    <Row className={styles.row}>
                        <Col className={styles.searchCol} md={{span: 10, offset: 1}}>
                            <h2 className={styles.header}>커뮤니티</h2>

                            {/* 검색 필드 */}
                            <InputGroup className={styles.searchGroup}>
                                <Form.Control
                                    placeholder="검색어를 입력하세요"
                                    aria-describedby="basic-addon2"
                                    className={styles.form}
                                    type="text"
                                    value={searchInput}
                                    onChange={handleInputChange}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            event.target.blur();
                                            handleSearch();
                                        }
                                    }}
                                />
                                <Button variant="outline-secondary" className={styles.searchButton} onClick={handleSearch}>검색</Button>

                                <Button variant="outline-secondary" className={styles.searchButton} onClick={() => setModalShow(true)}>레시피 공유하기</Button>
                                <UpdateModel
                                    show={modalShow}
                                    onHide={() => setModalShow(false)}
                                />
                            </InputGroup>

                            <div className={styles.tableContainer}>
                                <Table className={styles.table} striped bordered hover>
                                    <thead>
                                    <tr>
                                        {/*<th>번호</th>*/}
                                        <th>제목</th>
                                        <th>작성자</th>
                                        <th>작성일</th>
                                        <th>추천</th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                        {ListResponse()}
                                    </tbody>
                                </Table>

                                {/* 페이지네이션 컴포넌트 */}
                                <Pagination/>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </div>
    );
}

export default RecipeShareList;