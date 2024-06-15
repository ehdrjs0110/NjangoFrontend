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

import styles from '../../styles/Search/AiDetailSearch.module.scss';


const AiDetaileSearch = () => {
    const location = useLocation(); // 현재 위치 객체를 가져옴
    const { recipe } = location.state || {}; // 전달된 상태에서 recipe 추출, 없을 경우 빈 객체로 대체
    // const {detailRecipe, setDetailRecipe} = useState(null);
    const [detailRecipe, setDetailRecipe] = useState(null);
    const [etc, setEtc] = useState(null);
    const [level,setLevel] = useState(0);
    const [time,setTime] = useState(0);
    const [serve,setServe] = useState(0);

    // const [recipyTitle, setRecipyTitle] = useState(recipe.요리제목);


    console.log(recipe);

    let recipyTitle = recipe.title;
    // setRecipyTitle(recipe.요리제목);z
    const ingredientObject = recipe.재료;
    const recipyIndigredient = JSON.stringify(ingredientObject);
    let recipyProgress = recipe.과정;

    function makeString () {
        let string;
        Object.entries(ingredientObject).map(([key, value], index) => (
            string+=`${key} 재료는 ${value}사용 ,`
        ));

        return string;
    }


    // 재료 리스트 ui

    function makeIngredient () {
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

        try {
            ectResponse = await axios.post(
                "http://localhost:8080/api/v1/chat-gpt",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        } catch (e) {
            console.error(e);
        }


        let response = ectResponse.data;
        console.log(response);
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
        setTime(etcList[2].소요시간);

    }




    async function aiSearchRequest () {
        let recipyIndigredientString = makeString();
        let request  = `${recipyTitle} 종류의 ${recipyProgress} 레시피를 알려주는데 만드는 과정을 더욱 자세하게 얘기해주고 재료는 종류, 양 변화 없이 ${recipyIndigredientString} 추가사항 없이 사용되어야 해 ` +
                "그리고 json 객체로 {0:[{과정제목: },{과정:  }], 1: [{과정제목: },{과정:  }, ..} 형태로만 참고로 키는 무조건 숫자여야해 보내줘";

        console.log("요청 중");

        const requestBody = {
            "userContent": request
        };

        let searchResponse;
        try {
            searchResponse = await axios.post(
                "http://localhost:8080/api/v1/chat-gpt",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            )
        } catch (e) {
            console.error(e);
        }

        console.log(searchResponse);

        let response = searchResponse.data;
        console.log("최종 응답");

        // console.log(response);

        let jsonString = JSON.stringify(response);
        // ```json과 ```를 제거하는 코드
        // const cleanString = response.replace(/```json|```/g, '').trim();

        // JSON 문자열을 JavaScript 객체로 변환
        const recipes = JSON.parse(jsonString);
        const recipesList =  Object.values(recipes);

        console.log(recipesList);
        // console.log("JavaScript 객체를 콘솔에 출력");
        // console.log(recipes);
        setDetailRecipe(recipesList);
    }


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
                                        {recipe[1].과정}
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

    useEffect(() => {
        aiSearchRequest()
        aiSearchEtcRequest()
        // setRecipyTitle(recipe.요리제목);
    }, []);




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
                                                    <Button  className={styles.iconButton} variant="outline-secondary">
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
                </Container>
            </div>
        </>
    );
}

export default AiDetaileSearch;
