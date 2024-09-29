import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Table from "react-bootstrap/Table";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UpdateModel from '../../components/RecipeShare/SelectRecipe';
import Navigation from '../../components/Nav/Navigation'

import styles from '../../styles/History/HistoryList.module.scss';
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

    // recipe UI
    function ListResponce() {
        if (isList.length > 0) {
            return isList.map((list, index) => (
                <tbody key={index}>
                <tr>
                    <td>{list.recipeShareId}</td>
                    <td onClick={() => goDetail(list.recipeShareId)}>{list.title}</td>
                    <td>{list.nickname}</td>
                    <td>{list.createAt}</td>
                    <td>{list.likeCount}</td>
                </tr>
                </tbody>
            ));
        }
        return null;
    }

    // 페이지네이션 UI
    function Pagination() {
        const pages = [];
        for (let i = 1; i <= totalPages; i++) {
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

        return (
            <div>
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

    // 페이지 입력으로 이동 기능 추가
    const handlePageInput = (e) => {
        const inputPage = parseInt(e.target.value, 10);
        if (!isNaN(inputPage) && inputPage >= 1 && inputPage <= totalPages) {
            handlePageChange(inputPage);
        }
    };

    return (
        <>
            <Navigation/>
            <Container fluid style={{paddingLeft:0, paddingRight:0}}>
                <div className={styles.aiSearchContainer}>
                    <Row className={styles.aiSearchRow}>
                        <Col style={{paddingLeft:0, paddingRight:0}} md={{ span: 10, offset: 1 }} className={styles.aiSearchCol}>
                            <div className={styles.aiSearchOptionContainer}>
                                커뮤니티
                            </div>

                            {/* 검색 필드 */}
                            <input
                                type="text"
                                value={searchInput}
                                onChange={handleInputChange}
                                placeholder="검색어를 입력하세요"
                            />
                            <Button onClick={handleSearch}>검색</Button>

                            <Button onClick={() => setModalShow(true)}>레시피 공유하기</Button>
                            <UpdateModel
                                show={modalShow}
                                onHide={() => setModalShow(false)}
                            />

                            <div className={styles.recipeContainer}>
                                <Table striped bordered hover>
                                    <thead>
                                    <tr>
                                        <th>번호</th>
                                        <th>제목</th>
                                        <th>작성자</th>
                                        <th>작성일</th>
                                        <th>추천</th>
                                    </tr>
                                    </thead>
                                    {ListResponce()}
                                </Table>

                                {/* 페이지네이션 컴포넌트 */}
                                <Pagination />

                                {/* 페이지 입력 */}
                                <div>
                                    <input
                                        type="number"
                                        min="1"
                                        max={totalPages}
                                        placeholder="페이지 번호"
                                        onChange={handlePageInput}
                                    />
                                </div>
                            </div>
                        </Col>
                    </Row>
                </div>
            </Container>
        </>
    );
}

export default RecipeShareList;