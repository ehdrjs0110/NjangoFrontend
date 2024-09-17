import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Navigation from '../../components/Nav/Navigation'
import Card from "react-bootstrap/Card";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';
import {
    faEllipsis,
    faHandHoldingHeart,
    faHourglassHalf,
    faMobile,
    faStar,
    faUsers
} from "@fortawesome/free-solid-svg-icons";
import {useLocation} from "react-router-dom";
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

import styles from '../../styles/Like/LikeDetail.module.scss';

const AiDetaileSearch = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 현재 위치 객체를 가져옴
    const { recipe } = location.state || {}; // 전달된 상태에서 recipe 추출, 없을 경우 빈 객체로 대체
    const [detailRecipe, setDetailRecipe] = useState(null);
    const [etc, setEtc] = useState(null);
    const [level,setLevel] = useState(0);
    const [time,setTime] = useState(0);
    const [serve,setServe] = useState(0);

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let  userId = useSelector(state=> state.userEmail.value);
    const dispatch = useDispatch();
    // --

    console.log(recipe);

    useEffect(() => {

    const fetchData = async () => {
    
        try{
            await tokenHandler();
            const res = await axiosInstance.get(`recipe/${recipe.recipeId}`);
            const storedRecipe = res.data;
            console.log(storedRecipe);

            if(storedRecipe) {
                const detailRecipeArray = JSON.parse(storedRecipe[0].progress);
                console.log(detailRecipeArray);

                setDetailRecipe(detailRecipeArray);
                setLevel(storedRecipe[0].level);
                setServe(storedRecipe[0].servings);
                setTime(storedRecipe[0].time);
            }
    
        }catch(err){
            console.log("err message : " + err);
        }
    }
    
    fetchData();
    }, [recipe]);

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

    function makeLeve ()
    {
        if (level == 1) {
            return (
                <div>

                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                </div>
            )
        }
        else if (level == 2 ) {
            return (
                <div>
                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                </div>
            )
        }
        else if(level == 3){
            return (
                <div>
                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                </div>
            )
        }
    }

    // ingredients 객체를 문자열로 변환하여 사람이 읽기 쉽게 포맷팅하는 함수
    const formatIngredients = (ingredients) => {
        return Object.entries(ingredients)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
    };

    // 레시피 자세히 보기 ui
    function makeDetailRecipe()
    {
        if(detailRecipe != null)
        {
            
            return detailRecipe.map((recipe,index) => (
                <div key={index} className={styles.detailRecipeCard} >
                    <Row>
                        <Col className={styles.numberCol}>
                            <div>
                                <Card className={styles.index}>
                                        {index}
                                </Card>
                            </div>

                        </Col>
                        <Col className={styles.recipeCol} xs={11}>
                            <Card className={styles.card}>
                                <Card.Body className={styles.body}>
                                    <Card.Title>{recipe[0].과정제목}</Card.Title>
                                    <Card.Text>
                                        {recipe[0].process || recipe[1].process}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </Col>
                    </Row>
                </div>
            ));
        }
        return null;
    }

    return (
        <>
            <Navigation />
            <div>
                <Container fluid style={{padding:0,height:"100%"}} className={styles.AiDetaileSearchContainer}>
                    <Row className={styles.AiDetaileSearchRow} style={{ paddingLeft:0, paddingRight:0}}>
                        <Col className={styles.col} style={{paddingLeft: 0, paddingRight: 0 }} md={{ span: 10, offset: 1 }}>
                            <Col md={{ span:  8, offset: 2 }} >
                                <Card className={styles.contentContainer} >
                                    <Card.Body>
                                        <Card.Title className={styles.upperHalfContain}>
                                            <Row xs={2} md={2} lg={2}>
                                                <Col className={styles.titleCol}>
                                                    {recipe.title}
                                                    <div  className={styles.bottomLine}></div>
                                                </Col>
                                                <Col className={styles.iconCol}>
                                                    <Button  className={styles.iconButton}  variant="outline-secondary">
                                                        <FontAwesomeIcon className={styles.icon} icon={faMobile} />
                                                    </Button>{' '}
                                                    <Button  className={styles.iconButton}  variant="outline-secondary">
                                                        <FontAwesomeIcon className={styles.icon} icon={faEllipsis} />
                                                    </Button>{' '}
                                                </Col>
                                            </Row>
                                        </Card.Title>
                                        <Card.Subtitle  className="mb-2 text-muted" >
                                            <div >
                                                <Card style={{border:0}}>
                                                    <Card.Body style={{paddingBottom:0}}>
                                                    <Row  style={{margin:0}} xs={2} md={2} lg={2}>
                                                        <Row   style={{margin:0}} xs={3} md={3} lg={3} className={styles.iconRow}>
                                                            <Col>
                                                                <p>
                                                                    {makeLeve()}
                                                                </p>
                                                            </Col>
                                                            <Col>
                                                                <p><FontAwesomeIcon icon={faUsers} className={styles.icon} /></p>
                                                            </Col>
                                                            <Col>
                                                                <p><FontAwesomeIcon icon={faHourglassHalf} className={styles.icon} /></p>
                                                            </Col>
                                                        </Row>
                                                        <Row  xs={2} md={2} lg={2}>
                                                            <Col>
                                                                {/*    여기는 비율 맞추기 위한 공백  */}
                                                            </Col>
                                                            <Col>
                                                                <Button variant="outline-secondary" className={styles.cookingClearButton} >요리완료</Button>
                                                            </Col>
                                                        </Row>
                                                    </Row>
                                                    <Row  style={{margin:0}} xs={2} md={2} lg={2}>
                                                        <Row style={{margin:0}} xs={3} md={3} lg={3}>
                                                            <Col>
                                                                <p>난이도</p>
                                                            </Col>
                                                            <Col>
                                                                <p>{serve}인분</p>
                                                            </Col>
                                                            {/*{aiSearchEtcRequest()}*/}
                                                            <Col>
                                                                <p>{time}분</p>
                                                            </Col>
                                                        </Row>
                                                        <Row xs={2} md={2} lg={2}>
                                                            {/*여기는 비율 맞추기 위한 공백    */}
                                                        </Row>
                                                    </Row>
                                                    </Card.Body>
                                                </Card>

                                            </div>

                                        </Card.Subtitle>
                                        {/*재료*/}
                                            <div>
                                            <Card className={styles.ingredientContainer}  >
                                                <Card.Body>
                                                    <Card.Title className={styles.ingredientTitle}>재료</Card.Title>
                                                    <div className={styles.ingredientList}>
                                                        {formatIngredients(recipe.ingredients).replace(/\"/gi, "")}
                                                    </div>
                                                </Card.Body>
                                            </Card>
                                            </div>
                                        {/*재료 종료*/}
                                        {/*레시피*/}
                                            <div className={styles.detailContainer}>
                                                <Card className={styles.recipeContainCard}>
                                                    <Card.Body>
                                                        <Card.Title  className={styles.titleContianer}>
                                                            <div className={styles.title}>
                                                                레시피
                                                            </div>

                                                            <div  className={styles.test} >
                                                            </div>
                                                        </Card.Title>
                                                        {makeDetailRecipe()}
                                                    </Card.Body>
                                                </Card>
                                            </div>
                                        {/*레시피 종료*/}
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

export default AiDetaileSearch;