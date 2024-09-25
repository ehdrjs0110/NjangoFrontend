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

const RecipeShareList = () => {
    
    const [isList, setList] = useState(null);
    const [isChange, setChange] = useState(false);
    //modal
    const [modalShow, setModalShow] = useState(false);
    const navigate = useNavigate();

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let userId = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();
    // --

    useEffect(() => {

        const fetchData = async () => {
        
            try{
                await tokenHandler();
                const res = await axiosInstance.get("recipeShare");
                const storedRecipe = res.data;
                console.log(storedRecipe);
    
                if(storedRecipe) {
                    // JSON 문자열을 파싱하여 불필요한 이스케이프 문자를 제거
                    // const List = storedRecipe.map(item => ({
                    //     ...item,
                    //     ingredients: JSON.parse(item.ingredients)
                    // }));
    
                    console.log(storedRecipe);
                    setList(storedRecipe);
                }
        
            }catch(err){
                console.log("err message : " + err);
                setChange(!isChange);
            }
        }
          
        fetchData();
    
        }, []);

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

    const goDetail = (recipeShareId) => {
        navigate('/RecipeShareDetail', { state: { recipeShareId } });
    }

    // recipe UI
    function ListResponce()
    {
        if (isList != null)
        {
            
            return isList.map((list, index) => (
                    <tbody>
                        <tr>
                            <td>{list.recipeShareId}</td>
                            <td onClick={() =>goDetail(list.recipeShareId)}>{list.title}</td>
                            <td>{list.nickname}</td>
                            <td>{list.createAt}</td>
                            <td>{list.likeCount}</td>
                        </tr>
                    </tbody>     
        ));
        }

        return null;

    }

    return (
        <>
            <Navigation/>
            <Container fluid style={{paddingLeft:0, paddingRight:0}}>
            <div className={styles.aiSearchContainer}>
                <Row  className={styles.aiSearchRow}>
                    <Col  style={{paddingLeft:0, paddingRight:0}} md={{ span: 10, offset: 1 }} className={styles.aiSearchCol} >
                       

                        {/* Title 시작점*/}
                        <div className={styles.aiSearchOptionContainer}>
                            커뮤니티
                        </div>
                        {/* Title 종료점*/}

                        <Button onClick={() => setModalShow(true)}>레시피 공유하기</Button>
                        <UpdateModel
                            show={modalShow}
                            onHide={() => {
                                setModalShow(false);
                                
                                }
                            }
                        />
                        {/*레시피 공유 시작점*/}
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
                        </div>
                        {/*/!*레시피 History 종료점*!/*/}

                    </Col>
                </Row>
            </div>
            </Container>
        </>
    );
}

export default RecipeShareList;