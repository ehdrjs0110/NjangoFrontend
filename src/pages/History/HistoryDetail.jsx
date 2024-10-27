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

import styles from '../../styles/History/HistoryDetail.module.scss';

const HistoryDetail = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 현재 위치 객체를 가져옴
    const { recipe } = location.state || {}; // 전달된 상태에서 recipe 추출, 없을 경우 빈 객체로 대체
    const [detailRecipe, setDetailRecipe] = useState(null);
    const [title, setTitle] = useState(null);
    const [ingredient, setIngredient] = useState(null);
    const [level,setLevel] = useState(0);
    const [time,setTime] = useState(0);
    const [serve,setServe] = useState(0);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isKakaoToken, setKakaoToken] = useState(null);
    const [isRecipeId, setRecipeId] = useState(null);

    //recipeId 저장 쿠키
    const [isRecipeCookies, setRecipeCookie, removeRecipeCookie] = useCookies(null);

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let  userId = useSelector(state=> state.userEmail.value);
    const dispatch = useDispatch();
    // --

    console.log(recipe);

    //카카오톡 로그인
    const CLIENT_ID = '7a2afab08fdef9ddd3b09ac451ca30b9';
    const REDIRECT_URI = 'http://localhost:3000/HistoryDetail';
    const JavaScript_KEY = '88fa71808a81095402801be7c2034792';

    const code = new URL(window.location.href).searchParams.get("code");
  
    useEffect(() => {
      if (code) {
        sendCode();
      }
    }, [code]);

    useEffect(() => {
        // 모든 .card 요소와 .numberCol 요소를 가져옴
        const cardElements = document.querySelectorAll(`.${styles.card}`);
        const numberCol = document.querySelectorAll(`.${styles.numberCol}`);
    
        // 각 .card 요소의 높이를 기준으로 .numberCol의 높이를 설정
        cardElements.forEach((card, index) => {
            if (numberCol[index]) {
                // .numberCol 높이를 .card 높이에 맞춤
                numberCol[index].style.height = `${card.clientHeight}px`; 
            }
        });
    }, [detailRecipe]);
    
    async function sendCode() {

        const body = {
          code: code,
        };
    
        await axios
        .post("/njango/kakaoMessage/kakaoCode", body)
        .then((res) => {
          if(res.data!=null){
            console.log(res.data);
    
            const kakaotoken = res.data;
    
            console.log("kakaotoken "+ kakaotoken);
            setKakaoToken(kakaotoken);
          }
        });
    
      }

    useEffect(() => {
        // Kakao SDK 초기화
        const kakaoScript = document.createElement('script');
        kakaoScript.src = 'https://t1.kakaocdn.net/kakao_js_sdk/2.7.2/kakao.min.js';
        kakaoScript.integrity = 'sha384-TiCUE00h649CAMonG018J2ujOgDKW/kVWlChEuu4jK2vxfAAD0eZxzCKakxg55G4';
        kakaoScript.crossOrigin = 'anonymous';
        kakaoScript.onload = () => {
          window.Kakao.init(JavaScript_KEY); // JavaScript 키 입력
          displayToken(); // 토큰이 있는지 확인
        };
        document.head.appendChild(kakaoScript);
      }, [isKakaoToken]);
    
      const sendToFriends = () => {
        if (!window.confirm('메시지를 전송하시겠습니까?')) return;
    
        window.Kakao.Picker.selectFriends({
          showMyProfile: false,
          maxPickableCount: 10,
          minPickableCount: 1,
        })
          .then(res => {
            const uuids = res.users.map(e => e.uuid);
    
            return window.Kakao.API.request({
              url: '/v1/api/talk/friends/message/default/send',
              data: {
                receiver_uuids: uuids,
                template_object: {
                  object_type: 'text',
                  text:
                    '테스트 동건 테스트 은희',
                  link: {
                    mobile_web_url: 'http://localhost:3000',
                    web_url: 'http://localhost:3000',
                  },
                },
              },
            });
          })
          .then(res => {
            alert('success: ' + JSON.stringify(res));
          })
          .catch(err => {
            alert('error: ' + JSON.stringify(err));
          });
      };
    
      const displayToken = () => {
        const kakaotoken = isKakaoToken;

        if (kakaotoken && Object.values(kakaotoken) == '') {
          window.Kakao.Auth.setAccessToken(kakaotoken);
          setIsLoggedIn(true);
        }
      };

    const kakaoShare = async() => {

        //recipeId 쿠키에 저장
        setRecipeCookie(
            'recipeId',
            recipe.recipeId
        )

        const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}&scope=talk_message,friends`;
        window.location.href = kakaoUrl;

        if(isLoggedIn){
            sendToFriends();
        }
    };

    useEffect(() => {

    const fetchData = async () => {

        // let currentRecipeId;
        
        // if(currentRecipeId && currentRecipeId.length > 0){
        //     currentRecipeId = recipe.recipeId;
        // }
            
        // currentRecipeId = isRecipeCookies.recipeId;


        // if (!currentRecipeId) {
        //     console.log("recipeId가 정의되지 않았습니다.");
        //     return; // recipeId가 없으면 fetch를 하지 않음
        // }

        // setRecipeId(currentRecipeId);
        setRecipeId(recipe.recipeId);

        console.log("레시피 있어?" + isRecipeId);
        

        try{
            await tokenHandler();
            const res = await axiosInstance.get(`recipe/${isRecipeId}`);
            const storedRecipe = res.data;

            if(storedRecipe && storedRecipe.length > 0) {
                console.log(storedRecipe);

                const detailRecipeArray = JSON.parse(storedRecipe[0].progress);
                const detailIngredientsArray = JSON.parse(storedRecipe[0].ingredients);

                setDetailRecipe(detailRecipeArray);
                setTitle(storedRecipe[0].title);
                setIngredient(detailIngredientsArray);
                setLevel(storedRecipe[0].level);
                setServe(storedRecipe[0].servings);
                setTime(storedRecipe[0].time);
            }
    
        }catch(err){
            console.log("err message : " + err);
        }
    }
    
        fetchData();
    }, [recipe, isRecipeId]);

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

    const userAll = async() => {
        await tokenHandler();
        const res = await axiosInstance.get("/user/userAll");
        console.log(res.data);
    }

    // 재료를 양쪽으로 나누는 함수
    const makeIngredientColumns = () => {
        if (ingredient) {
            // ingredient 객체의 키-값 쌍을 배열로 변환
            const entries = Object.entries(ingredient);
            const half = Math.ceil(entries.length / 2); // 배열을 반으로 나눔
            const leftSide = entries.slice(0, half); // 왼쪽 열의 재료
            const rightSide = entries.slice(half); // 오른쪽 열의 재료

            return (
                <Row>
                    {/* 왼쪽 열 */}
                    <Col xs={6} md={6} lg={6} className={styles.listColumn}>
                        {leftSide.map(([key, value], index) => (
                            <Row key={index} className={styles.listRow}>
                                <Col xs={6} className={styles.listText}>
                                    {key} {/* 재료명 */}
                                </Col>
                                <Col xs={6} className={styles.listText}>
                                    {value} {/* 재료 양 */}
                                </Col>
                            </Row>
                        ))}
                    </Col>
                    {/* 오른쪽 열 */}
                    <Col xs={6} md={6} lg={6} className={styles.listColumn}>
                        {rightSide.map(([key, value], index) => (
                            <Row key={index} className={styles.listRow}>
                                <Col xs={6} className={styles.listText}>
                                    {key}
                                </Col>
                                <Col xs={6} className={styles.listText}>
                                    {value}
                                </Col>
                            </Row>
                        ))}
                    </Col>
                </Row>
            );
        }
        return null;
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
                            <Col md={{ span:  8, offset: 2 }} style={{paddingBottom: 50, paddingTop: 20}}>
                                <Card className={styles.contentContainer} >
                                    <Card.Body>
                                        <Card.Title className={styles.upperHalfContain}>
                                            <Row xs={2} md={2} lg={2}>
                                                <Col className={styles.titleCol}>
                                                    {title}
                                                    <div  className={styles.bottomLine}></div>
                                                </Col>
                                                <Col className={styles.iconCol}>
                                                    <Button  className={styles.iconButton}  variant="outline-secondary" onClick={kakaoShare}>
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
                                                        {makeIngredientColumns()}
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

export default HistoryDetail;