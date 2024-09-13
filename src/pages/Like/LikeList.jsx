import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Card from 'react-bootstrap/Card';

import Navigation from '../../components/Nav/Navigation'

import styles from '../../styles/Like/LikeList.module.scss';
import axios from "axios";
import {useNavigate} from "react-router-dom";
// auth 관련 --
import {useCookies} from "react-cookie";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
//--

import {axiosInstance} from "../../middleware/customAxios";
import {arrayNestedArray, makeFlatArray} from "../../services/arrayChecker";

const LikeList = () => {
    
    const [recipe, setRecipe] = useState(null);
    const [isChange, setChange] = useState(false);
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
                const res = await axiosInstance.get(`like/${userId}`);
                const storedRecipe = res.data;
                console.log(storedRecipe);

                if(storedRecipe) {
                    // JSON 문자열을 파싱하여 불필요한 이스케이프 문자를 제거
                    const recipes = storedRecipe.map(item => ({
                        ...item,
                        ingredients: JSON.parse(item.ingredients)
                    }));

                    setRecipe(recipes);
                }
        
            }catch(err){
                console.log("err message : " + err);
                setChange(!isChange);
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

    const deleteRecipe = async (likeId) => {

        if(window.confirm("정말 삭제 하시겠습니까?")){

            try{
                await tokenHandler();
                const res = await axiosInstance.delete(`like/${likeId}`);

                if(res){
                    setChange(!isChange);
                    alert("삭제되었습니다.");
                }else {
                    alert("실패했습니다.");
                }

            }catch(e) {
                console.error(e);
            }
        }else {
            alert("취소 되었습니다.");
        }

        
    };
    
    // recipe UI
    function recipeResponce()
    {
        if (recipe != null)
        {
            return recipe.map((recipe, index) => (
                <Card className={styles.recipeCard} key={index}>
                    <Card.Header  className={styles.hearder}>
                        <Row xs={1} md={2}>
                            <Col className={styles.recipeTitleCol}>
                                {JSON.stringify(recipe.title).replace(/\"/gi, "")}
                            </Col>
                            <Col className={styles.recipeDetailSearchCol}>
                                <Button className={styles.recipeDetailSearchButton}  variant="outline-secondary" onClick={() =>startDetailAiSearch(recipe)}>
                                        상세보기
                                </Button>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text>
                            <strong>재료:</strong> {formatIngredients(recipe.ingredients)}
                            <span className={styles.deleteBtn}>
                                <Button onClick={() => deleteRecipe(recipe.likeId)}>삭제</Button>
                            </span>
                        </Card.Text>
                    </Card.Body>
                </Card>
        ));
        }

        return null;

    }

    // 레시피 상세 보기로 값 넘겨주가
    const startDetailAiSearch = (recipe) =>
    {
        navigate('/LikeDetail', { state: { recipe } }); // 레시피 전달
    }

    // ingredients 객체를 문자열로 변환하여 사람이 읽기 쉽게 포맷팅하는 함수
    const formatIngredients = (ingredients) => {
        return Object.entries(ingredients)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    };

    return (
        <>
            <Navigation/>
            <Container fluid style={{paddingLeft:0, paddingRight:0}}>
            <div className={styles.aiSearchContainer}>
                <Row  className={styles.aiSearchRow}>
                    <Col  style={{paddingLeft:0, paddingRight:0}} md={{ span: 10, offset: 1 }} className={styles.aiSearchCol} >
                       

                        {/* Title 시작점*/}
                        <div className={styles.aiSearchOptionContainer}>
                            Like
                        </div>
                        {/* Title 종료점*/}


                        {/*레시피 History 시작점*/}
                        <div className={styles.recipeContainer}>

                            {recipeResponce()}
                        </div>
                        {/*/!*레시피 History 종료점*!/*/}



                    </Col>
                </Row>

            </div>
                </Container>
        </>
    );
}

export default LikeList;