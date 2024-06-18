import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import {Accordion} from "react-bootstrap";

import Navigation from '../../components/Nav/Navigation'

import styles from '../../styles/Search/AiSearch.module.scss';
import axios from "axios";
import {useLocation, useNavigate} from "react-router-dom";
import {useCookies} from "react-cookie";




function CustomToggle({ children, eventKey }) {



    const decoratedOnClick = useAccordionButton(eventKey, () =>
        console.log('totally custom!'),
    );

    return (
        <button
            type="button"
            onClick={decoratedOnClick}
            className={styles.button}
        >
            {children}
        </button>
    );
}


const AiSearch = () => {
    // 냉장고 재료 반영 선택 여부
    const [activeKey, setActiveKey] = useState(null);
    const [recipe, setRecipe] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [selectedKindOfFood, setSelectedKindOfFood] = useState([]);
    const navigate = useNavigate();

    const [selectedMyIngredientList, setSelectedMyIngredientList] = useState([]);
    // const [allergyFood, setAllergyFood] = useState([])

    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // const location = useLocation();
    // const {accessToken} = location.state || {};
    // console.log(accessToken);
    let newAccessToken;
    let newRefreshToken;


    useEffect(() => {
        const storedRecipe = sessionStorage.getItem("recipeList");
        if (storedRecipe) {
            setRecipe(JSON.parse(storedRecipe));
        }

        getNewToken();
        // if(!accessToken){
        //
        // }
    }, []);

    // useEffect(() => {
    //     // getNewToken();
    //
    // },[])


    // 테스트 데이터
    let allergyFood = ["새우,오징어"];



    // 테스트 데이터
    var myIngredientList = ["양파", "당근","마늘","파","옥수수"];

    //  재료선택
    function makeIngredientList() {
        const IngredientList = myIngredientList.map((ingredient,index) =>

            <Form.Check
                inline
                type="checkbox"
                name="group3"
                id={ingredient}
                className={styles.check}
                label={ingredient}
                onChange={myIngredientHandler}
            />)
        return IngredientList;
    }

    const myIngredientHandler = (event) => {
        const food = event.target.id;
        const isCheked = event.target.checked;

        setSelectedMyIngredientList((prevState) => {
            if(!isCheked)
                return prevState.filter(preItem => preItem !== food)
            else{
                return [...prevState, food];
            }
        })

        console.log(selectedKindOfFood);

        console.log(selectedKindOfFood);


    }


    // option - 종류

    var kindOfFoodList = ["한식", "중식", "양식"];


    const kindOfFoodHandler = (event) => {
        const kind = event.target.id;
        const isCheked = event.target.checked;

        setSelectedKindOfFood((prevState) => {
            if(!isCheked)
                return prevState.filter(preItem => preItem !== kind)
            else{
                return [...prevState, kind];
            }
        })

        console.log(selectedKindOfFood);

        console.log(selectedKindOfFood);


    }

    function makeKindOfFoodList() {
        return kindOfFoodList.map((kind,index) =>

            <Form.Check
                inline
                type="checkbox"
                name="group1"
                id={kind}
                label={kind}
                className={styles.check}
                onChange={kindOfFoodHandler}
            />)
    }




    const handleCheckboxChange = () => {
        setActiveKey(activeKey === "1" ? null : "1");
    };

    var etcList = ["냉장고 재료 반영", "알레르기 반영", "소비 기한 우선 사용"];



    function makeEtcList() {
        return etcList.map((etc,index) =>
        {
            if(!index)
            {
                return(
                    <Form.Check
                        inline
                        type="checkbox"
                        name="group2"
                        id="inline-checkbox-4"
                        label="냉장고 재료 반영"
                        className={styles.check}
                        onChange={handleCheckboxChange}
                        checked={activeKey === "1"}
                    />
                );
            }
            else{
                return (
                    <Form.Check
                        inline
                        type="checkbox"
                        name="group2"
                        className={styles.check}
                        id={`inline-checkbox-${index}`}
                        label={etc}
                    />
                );
            }
        });
    }





    // 보안관련 너무 길어서 수정해야함





    async function getNewToken() {
        console.log("refresh token cookie" +cookies.refreshToken);
        const refreshToken = cookies.refreshToken;

        let response;
        try {
            response = await axios.post(
                "http://localhost:8080/api/v1/auth/refreshToken",{},
                {
                    headers: {
                        "Authorization": `Bearer ${refreshToken}`
                    }
                }
            );
        }
        catch (e) {
            console.log(e);
            navigate('/Sign');
        }
        // response.data;
        console.log(response.data);
        // console.log(res.data);
        newAccessToken = response.data.accessToken;
        newRefreshToken = response.data.refreshToken;

        newRefreshToken = JSON.stringify(refreshToken);



        setCookie(
            'refreshToken',
            refreshToken,
            {
                path:'/',
                maxAge: 7 * 24 * 60 * 60, // 7일
                // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
            }
        )

    }






    // prompt 요청
    async function aiSearchRequest () {
        console.log("selectedKindOfFood: " + selectedKindOfFood );
        console.log("searchValue" + searchValue);
        console.log("allergyFood" + allergyFood);
        console.log("selectedMyIngredientList" + selectedMyIngredientList);
        // console.log();\
        


        await getNewToken();

        console.log(newAccessToken);

        console.log("요청 중");
        const requestBody = {"userContent" : `${selectedKindOfFood} 종류의 ${searchValue} 레시피를 5개를 알려주는데 재료는 자세하게 알려주고 만드는 과정에 ` +
                `대해서는 130글자 내로 간략하게 알려줘 ${allergyFood}는 들어가면 안돼 ${selectedMyIngredientList}가 있어 형태는 title,재료,과정으로 알려줘` +
                "그리고 json 객체로 {0:[요리 1], 1: [요리2], 2: [요리3}, 3:[요리], 4:[요리]} 형태로만 참고로 키는 무조건 숫자여야해 보내줘"};
        let searchResponse;
        try {
            searchResponse = await axios.post(
                "http://localhost:8080/api/v1/chat-gpt",
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${newAccessToken}`
                    },
                }
            )

        } catch (e) {
            console.error(e);
        }

        // let response = searchResponse.data.choices[0].message.content;
        let response = searchResponse.data;

        let jsonString = JSON.stringify(response);

        console.log("최종 응답");
        // console.log(response);
        console.log(jsonString);

        // ```json과 ```를 제거하는 코드
        // const cleanString = response.replace(/```json|```/g, '').trim();

        // JSON 문자열을 JavaScript 객체로 변환
        // const recipes = JSON.parse(cleanString);
        const recipes = JSON.parse(jsonString);

        console.log("JavaScript 객체를 콘솔에 출력");
        console.log(recipes);
        const recipesList =  Object.values(recipes);

        console.log(recipesList);
        setRecipe(recipesList);
        sessionStorage.setItem("recipeList",JSON.stringify(recipesList));
    }


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
                                {JSON.stringify(recipe.title)}
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
                            <strong>재료:</strong> {JSON.stringify(recipe.재료)}
                        </Card.Text>
                        <Card.Text>
                            <strong>과정:</strong> {JSON.stringify(recipe.과정)}
                        </Card.Text>
                    </Card.Body>
                </Card>
            ));
        }

        return null;

    }

    const searchInputHandler = (event) => {
        const {value} = event.target;
        setSearchValue(value);
    }


    // 레시피 상세 보기로 값 넘겨주가

    const startDetailAiSearch = (recipe) =>
    {
        navigate('/AiDetailSearch', { state: { recipe } }); // 레시피 전달

    }

    return (
        <>
            <Navigation/>
            {/*<Container fluid className={styles.aiSearchContainer}>*/}
            <Container fluid style={{paddingLeft:0, paddingRight:0}}>
                <div className={styles.aiSearchContainer}>
                    {/*<Row className="justify-content-md-center ai-search-row">*/}
                    <Row  className={styles.aiSearchRow}>
                        {/*<Col xs="0" lg="1"   className="ai-search-col">*/}
                        {/*    1 of 3*/}
                        {/*</Col>*/}
                        <Col  style={{paddingLeft:0, paddingRight:0}} md={{ span: 10, offset: 1 }} className={styles.aiSearchCol} >
                            {/*레시피 명 입력 지작점*/}
                            <div  style={{padding:0}} >
                                <InputGroup style={{padding:0}} className={styles.aiSearchInputGroup}>
                                    <Form.Control  style={{padding:0}}
                                                   placeholder="레시피 검색"
                                                   aria-label="Recipient's username"
                                                   aria-describedby="basic-addon2"
                                        // className="ai-search-input"
                                                   className={styles.form}
                                                   onChange={searchInputHandler}
                                                   value={searchValue}
                                    />
                                    <Button variant="outline-secondary" id="button-addon2" className={styles.aiSearchButton} onClick={aiSearchRequest}>
                                        검색
                                    </Button>
                                </InputGroup>
                            </div>
                            {/*레시피 명 입력 종료점*/}

                            {/*레시피 옵션 시작점*/}
                            <div className={styles.aiSearchOptionContainer}>
                                <Accordion defaultActiveKey="0" alwaysOpen style={{ paddingRight: '0', paddingLeft: '0', width:'100%'}}>
                                    <Card  className={styles.containCard} >
                                        <Card.Header className={styles.aiSearchOptionHeader}>
                                            <CustomToggle eventKey="0" className={styles.button} >Option</CustomToggle>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="0">
                                            <Card.Body>
                                                <div>
                                                    <Form.Group>
                                                        종류&nbsp;&nbsp;&nbsp;
                                                        {makeKindOfFoodList()}
                                                    </Form.Group>
                                                </div>
                                                <div>
                                                    <Form.Group>
                                                        기타&nbsp;&nbsp;&nbsp;
                                                        {makeEtcList()}
                                                    </Form.Group>
                                                </div>
                                                <Accordion activeKey={activeKey} className={styles.ingredientContainer}>
                                                    <Card  className={styles.card}>
                                                        <Accordion.Collapse eventKey="1">
                                                            <Card.Body >
                                                                <div>
                                                                    <h5 className={styles.title}>내 재료</h5>
                                                                    <Form.Group>
                                                                        {makeIngredientList()}
                                                                    </Form.Group>
                                                                </div>

                                                            </Card.Body>
                                                        </Accordion.Collapse>
                                                    </Card>
                                                </Accordion>
                                            </Card.Body>
                                        </Accordion.Collapse>
                                    </Card>
                                </Accordion>
                            </div>
                            {/*레시피 옵션 종료점*/}


                            {/*레시피 검색 결과 시작점*/}
                            <div className={styles.recipeContainer}>

                                {recipeResponce()}
                            </div>
                            {/*/!*레시피 검색 결과 종료점*!/*/}



                        </Col>
                        {/*<Col xs="0" lg="1" className="ai-search-col">*/}
                        {/*    3 of 3*/}
                        {/*</Col>*/}
                    </Row>

                </div>
            </Container>
        </>
    );
}

export default AiSearch;