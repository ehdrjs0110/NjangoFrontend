import React, {useEffect, useState, useRef} from 'react';
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
import {useLocation, useNavigate} from "react-router-dom";
import axios from "axios";

import styles from '../../styles/Search/AiDetailSearch.module.scss';
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import  {axiosInstance,axiosInstance2} from "../../middleware/customAxios";


const AiDetaileSearch = () => {
    var today = new Date(); //현재시간 가져오기
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜
    let hours = today.getHours(); // 시
    let minutes = today.getMinutes();  // 분
    let seconds = today.getSeconds();  // 초
    const nowTime = year + "" + month + "" + date + "" + hours + "" + minutes + "" + seconds;

    const location = useLocation(); // 현재 위치 객체를 가져옴
    const { recipe } = location.state || {}; // 전달된 상태에서 recipe 추출, 없을 경우 빈 객체로 대체
    // const {detailRecipe, setDetailRecipe} = useState(null);
    const [detailRecipe, setDetailRecipe] = useState(null);
    const [etc, setEtc] = useState(null);
    const [level,setLevel] = useState(0);
    const [time,setTime] = useState(0);
    const [serve,setServe] = useState(0);

    //modal 창 띄우기
    const [modalOpen, setModalOpen] = useState(false);
    const modalBackground = useRef();

    const navigate = useNavigate();
    // const [recipyTitle, setRecipyTitle] = useState(recipe.요리제목);

    // refresh token 가져오기
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);



    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let  id = useSelector(state=> state.userEmail.value);
    const dispatch = useDispatch();


    console.log(recipe);

    let recipyTitle = recipe.title;
    // setRecipyTitle(recipe.요리제목);z
    const ingredientObject = recipe.ingredients;
    const recipyIndigredient = JSON.stringify(ingredientObject);
    let recipyProgress = recipe.process;



    useEffect(() => {
        setModalOpen(true);





        axios.all([aiSearchRequest(),aiSearchEtcRequest()])
            .then(axios.spread((aiSearchResponse, aiEtcResponce) =>
            {



                let response1 = aiSearchResponse.data;
                console.log("최종 응답");

                // console.log(response);

                let jsonString1 = JSON.stringify(response1);
                // ```json과 ```를 제거하는 코드
                // const cleanString = response.replace(/```json|```/g, '').trim();

                // JSON 문자열을 JavaScript 객체로 변환
                const recipes = JSON.parse(jsonString1);
                const recipesList =  Object.values(recipes);

                console.log(recipesList);
                setDetailRecipe(recipesList);




                let response = aiEtcResponce.data;

                let jsonString = JSON.stringify(response);





                // JSON 문자열을 JavaScript 객체로 변환
                const etc = JSON.parse(jsonString);
                const etcList =  Object.values(etc);
                console.log(etcList);

                console.log(etcList[0]);

                setEtc(etcList);
                // 난이도
                setLevel(etcList[0].난이도);
                setServe(etcList[1].인분);
                // setTime(etcList[2].소요시간);
                // etcList[2].소요시간이 존재하고 문자열이라면 '분'을 제거한 후 setTime에 설정
                if (etcList[2] && typeof etcList[2].소요시간 === 'string') {
                    setTime(etcList[2].소요시간.replace('분', ''));
                } else {
                    // 소요시간이 정의되어 있지 않거나 문자열이 아닌 경우
                    setTime(etcList[2].소요시간);
                }


                setModalOpen(false);

            }))

        // aiSearchRequest()
        // aiSearchEtcRequest()
        // setRecipyTitle(recipe.요리제목);
    }, []);


    //Recipe ID 생성
    const recipeId = id + nowTime;
    console.log(recipeId);



    function makeString () {
        let string;
        Object.entries(ingredientObject).map(([key, value], index) => (
            string+=`${key} 재료는 ${value}사용 ,`
        ));

        return string;
    }


    // 재료 리스트 ui

    function makeIngredient () {

        console.log(ingredientObject)
        return Object.entries(ingredientObject).map(([key, value], index) => (
            <Row key={index} xs={2} md={2} lg={2}>
                <Col  className={styles.listText}>{key}</Col>
                <Col  className={styles.listText} >{value}</Col>
            </Row>
        ));
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
        else {
            return (
                <div>
                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                    <FontAwesomeIcon icon={faStar} className={styles.levelIcon}/>
                </div>
            )
        }
    }


    async function aiSearchEtcRequest (){
        let level = `${recipyTitle} 종류의 ${recipyProgress} 레시피가 난이도는 1~3에서 어느 정도인지, 몇 인분인지, 소요 예상 시간은 어떤지만 보내줘` +
            "그리고 json 객체로  ```json {0:{난이도: },1:{인분: },2:{소요시간: }} ```형태로 참고로 키는 무조건 숫자여야해 보내줘";
        let ectResponse;
        console.log("요청중");


        const requestBody = {
            "userContent": level
        };

        await tokenHandler();
        return await axiosInstance.post("api/v1/chat-gpt", requestBody);

        // try {
        //
        //     await tokenHandler();
        //     ectResponse = await axiosInstance.post("api/v1/chat-gpt", requestBody);
        // } catch (e) {
        //     console.error(e);
        //
        // }
        //
        //
        // let response = ectResponse.data;
        // console.log(response);
        // let jsonString = JSON.stringify(response);
        //
        //
        //
        // // JSON 문자열을 JavaScript 객체로 변환
        // const etc = JSON.parse(jsonString);
        // const etcList =  Object.values(etc);
        // console.log(etcList);
        //
        // console.log(etcList[0]);
        //
        // setEtc(etcList);
        // // 난이도
        // setLevel(etcList[0].난이도);
        // setServe(etcList[1].인분);
        // // setTime(etcList[2].소요시간);
        // // etcList[2].소요시간이 존재하고 문자열이라면 '분'을 제거한 후 setTime에 설정
        // if (etcList[2] && typeof etcList[2].소요시간 === 'string') {
        //     setTime(etcList[2].소요시간.replace('분', ''));
        // } else {
        //     // 소요시간이 정의되어 있지 않거나 문자열이 아닌 경우
        //     setTime(etcList[2].소요시간);
        // }


    }




    async function aiSearchRequest () {
        let recipyIndigredientString = makeString();
        let request  = `${recipyTitle} 종류의 ${recipyProgress} 레시피를 알려주는데 만드는 과정을 더욱 자세하게 얘기해주고 재료는 종류, 양 변화 없이 ${recipyIndigredientString} 추가사항 없이 사용되어야 해 ` +
            "그리고 json 객체로 {0:[{과정제목: },{process:  }], 1: [{과정제목: },{process:  }, ..} 형태로만 참고로 키는 무조건 숫자여야해 보내줘";

        console.log("요청 중");

        const requestBody = {
            "userContent": request
        };

        let searchResponse;
        await tokenHandler();
        return axiosInstance2.post("api/v1/chat-gpt",requestBody);
        // try {
        //     // searchResponse = await axios.post(
        //     //     "http://localhost:8080/api/v1/chat-gpt",
        //     //     requestBody,
        //     //     {
        //     //         headers: {
        //     //             "Content-Type": "application/json",
        //     //             "Authorization": `Bearer ${accessToken}` // auth 설정
        //     //         },
        //     //     }
        //     // )
        //     await tokenHandler();
        //     searchResponse = axiosInstance2.post("api/v1/chat-gpt",requestBody);
        // } catch (e) {
        //     console.error(e);
        //     // checkAccessToken2();
        //     // try {
        //     //     searchResponse = await axios.post(
        //     //         "http://localhost:8080/api/v1/chat-gpt",
        //     //         requestBody,
        //     //         {
        //     //             headers: {
        //     //                 "Content-Type": "application/json",
        //     //                 "Authorization": `Bearer ${accessToken}` // auth 설정
        //     //             },
        //     //         }
        //     //     )
        //     // } catch (e) {
        //     //     console.error(e);
        //     //
        //     // }
        //
        // }
        //
        // console.log(searchResponse);
        //
        // let response = searchResponse.data;
        // console.log("최종 응답");
        //
        // // console.log(response);
        //
        // let jsonString = JSON.stringify(response);
        // // ```json과 ```를 제거하는 코드
        // // const cleanString = response.replace(/```json|```/g, '').trim();
        //
        // // JSON 문자열을 JavaScript 객체로 변환
        // const recipes = JSON.parse(jsonString);
        // const recipesList =  Object.values(recipes);
        //
        // console.log(recipesList);
        // // console.log("JavaScript 객체를 콘솔에 출력");
        // // console.log(recipes);
        // setDetailRecipe(recipesList);
        // setModalOpen(false);

    }


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




    //요리종료
    const finishCook = async () => {
        if(window.confirm("요리를 끝내시겠습니까?")){

            const userId = id;

            const RecipeProgress = JSON.stringify(detailRecipe);
            
            console.log("출력! : "+detailRecipe);


            const requestBody = {
                "recipeId": recipeId,
                "title": recipyTitle,
                "progress": RecipeProgress,
                "ingredients": recipyIndigredient,
                "level": level,
                "time": time,
                "servings": serve,
            };

            try{
                await tokenHandler();
                await axiosInstance.post(`history/finish/${userId}`,requestBody);

            }catch(err){
                console.log("err message : " + err);
            }
            
            alert("요리 종료");
        }else{
            alert("취소 되었습니다.")
        }
    };

    //좋아요
    const clickLike = async () => {
        
        const userId = id;

        const RecipeProgress = JSON.stringify(detailRecipe);
        
        console.log("출력! : "+detailRecipe);


        const requestBody = {
            "recipeId": recipeId,
            "title": recipyTitle,
            "progress": RecipeProgress,
            "ingredients": recipyIndigredient,
            "level": level,
            "time": time,
            "servings": serve,
        };

        try{
            await tokenHandler();
            await axiosInstance.post(`like/likeAdd/${userId}`,requestBody);
        }catch(err){
            console.log("err message : " + err);
        }
        

        alert("좋아요!!");
        
    };

    // 레시피 자세히 보기 ui
    function makeDetailRecipe ()
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
                                        {recipe && recipe[1] && recipe[1].process}
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
                                                    {recipyTitle}
                                                    <div  className={styles.bottomLine}></div>
                                                </Col>
                                                <Col className={styles.iconCol}>
                                                    <Button  className={styles.iconButton} variant="outline-secondary" onClick={clickLike}>
                                                        <FontAwesomeIcon className={styles.icon} icon={faHeart} />
                                                    </Button>{' '}
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
                                                                <Button variant="outline-secondary" className={styles.cookingClearButton} onClick={finishCook} >요리완료</Button>
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
                                                        {makeIngredient()}
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

                    {
                        modalOpen &&
                        <div className={styles.modal_container} ref={modalBackground} onClick={e => {
                        }}>
                            <div className={styles.loader}>
                                <div className={styles.character}></div>
                                {/* <img src={char} className={styles.character}></img> */}
                                
                            </div>
                            <div className={styles.loading}>
                                <h2 className={styles.text}>Loading...</h2>
                            </div>
                        </div>
                    }
                </Container>
            </div>
        </>
    );
}

export default AiDetaileSearch;