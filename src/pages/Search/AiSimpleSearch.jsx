import Navigation from '../../components/Nav/Navigation'
import Container from "react-bootstrap/Container";
import styles from "../../styles/Search/AiSearch.module.scss";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InputGroup from "react-bootstrap/InputGroup";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import React, { useEffect, useState, useRef } from "react";
import { useLocation } from 'react-router-dom';

import aiSimpleCss from '../../styles/Search/AiSimpleSearch.module.scss';
import axios from "axios";
import { useNavigate } from "react-router-dom"
import { css } from "@emotion/react";


import { useCookies } from "react-cookie";
import { expired, getNewToken } from "../../services/auth2";
import { containToken } from "../../Store/tokenSlice";
import { useDispatch, useSelector } from "react-redux";
import { axiosInstance, axiosInstance2 } from "../../middleware/customAxios";



const AiSimpleSearch = () => {
    const navigate = useNavigate();


    // 선택한 재료
    const [selectedIngredientList, setSelectedIngredientList] = useState([]);
    // 레시피 답변
    const [recipe, setRecipe] = useState(null);
    // 레시피 갯수
    const [recipeCount, setRecipeCount] = useState("5");
    // const [myIngredientList, setMyIngredientList] = useState(null);
    //페이지 변화
    const [isChange, setChange] = useState(false);
    //사용자 재료
    const [isIngredients, setIngredients] = useState([]);

    //modal 창 띄우기
    const [modalOpen, setModalOpen] = useState(false);
    const modalBackground = useRef();


    // refresh token 가져오기
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);



    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let userId = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();


    //inven에서 가져온 값
    const state = useLocation();
    console.table(state);

    useEffect(() => {

        if (state) {
            var list = Object.values(state.state);
            // console.log("test:"+ test)
            // setMyIngredientList(list);
            setSelectedIngredientList(list);
        }
        const storedRecipe = sessionStorage.getItem("recipeSimpleSearchList");
        if (storedRecipe) {
            console.log("있다고 인식됨")
            setRecipe(JSON.parse(storedRecipe));
        }

    }, []);

    useEffect(() => {
        //재료 가져오기
        const fetchData = async () => {

            const params = { userId: userId };

            try {

                await tokenHandler();
                const res = await axiosInstance.get("inven/manage/name", { params });


                if (res != null) {
                    console.log(res.data);
                }

                setIngredients(res.data);

            } catch (err) {
                console.log("err message : " + err);

            }
        }

        fetchData();
    }, [accessToken]);

    async function tokenHandler() {


        const isExpired = expired();
        if (isExpired) {

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
                        path: '/',
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



    // 레시피 갯수 입력받기
    const recipeHendler = (event) => {
        const { value } = event.target;
        console.log(typeof value);
        console.log(value);
        if (Number(value) <= 5) {
            console.log("검색가능");
            setRecipeCount(value);
        }
        else {
            console.error("검색 불가능");
        }


    }

    // UI = 냉장고 속 재료 보여주기
    const makeMyIngredientList = () => {
        if (isIngredients && Array.isArray(isIngredients)) {
            const checkList = isIngredients.map((item, index) =>
                <Form.Check
                    key={index}
                    inline
                    type="checkbox"
                    name="group1"
                    id={`inline-checkbox-${index}`}
                    className={aiSimpleCss.check}
                    label={item.ingredientname}
                    onChange={() => selectIngredient(item.ingredientname)}
                    checked={selectedIngredientList.includes(item.ingredientname)}
                />
            );
            return checkList;
        }
        return null; // 기본값을 반환
    };





    // Logic = 선택한 재료 정리, selectedIngredientList에 반영
    const selectIngredient = (ingredient) => {
        setSelectedIngredientList(preState => {
            if (preState.includes(ingredient)) {
                return preState.filter(preItem => preItem !== ingredient)
            } else {
                return [...preState, ingredient];
            }
        });
    }

    // UI = Check 된 리스트 보여주기
    const makeCheckedList = () => {
        const checkedList = selectedIngredientList.map((ingredient, index) =>
            <Col key={index}>{ingredient}</Col>
        )
        return checkedList;
    }



    // prompt 요청
    async function aiSearchRequest() {
        setModalOpen(true);
        console.log("selectedMyIngredientList" + selectedIngredientList);
        // console.log();
        console.log(recipeCount);

        if (recipeCount == null || Number(recipeCount) <= 0) {
            setRecipeCount("1");
        }


        console.log("요청 중");

        const ingredientNames = isIngredients.map(ingredient => ingredient.ingredientname);
        console.log(ingredientNames);

        const requestBody = {
            "userContent": ` ${selectedIngredientList}를 이용한 레시피를 ${recipeCount}개를 알려주는데 재료는 자세하게 알려주고 만드는 과정에 ` +
                `대해서는 130글자 내로 간략하게 알려줘 ${ingredientNames}가 있어 형태는 title,ingredients,process 으로 알려줘` +
                `그리고 json 객체로 {0:[요리 1], ...} 형태로 ${recipeCount}갯수로 참고로 키는 무조건 숫자여야해 보내줘`
        };
        let searchResponse;
        try {
            await tokenHandler();
            searchResponse = await axiosInstance2.post(`api/v1/chat-gpt/simple/${userId}`, requestBody);




        } catch (e) {
            console.error(e);
        }

        let response = searchResponse.data;

        // console.log(recipeCount);

        let jsonString = JSON.stringify(response);

        console.log("최종 응답");

        const recipes = JSON.parse(jsonString);

        console.log("JavaScript 객체를 콘솔에 출력");
        console.log(recipes);
        const recipesList = Object.values(recipes);

        console.log(recipesList);
        setRecipe(recipesList);
        sessionStorage.setItem("recipeSimpleSearchList", JSON.stringify(recipesList));
        setModalOpen(false);
    }


    // 레시피 상세 보기로 값 넘겨주가

    const startDetailAiSearch = (recipe) => {
        navigate('/AiDetailSearch', { state: { recipe, selectedMyIngredientList: selectedIngredientList } }); // 레시피 전달

    }


    // recipe UI
    function recipeResponce() {
        if (recipe != null) {
            return recipe.map((recipe, index) => (
                <Card className={aiSimpleCss.recipeCard} key={index}>
                    <Card.Header className={aiSimpleCss.hearder}>
                        <Row xs={1} md={2}>
                            <Col className={aiSimpleCss.recipeTitleCol}>
                                {JSON.stringify(recipe.title)}
                            </Col>
                            <Col className={aiSimpleCss.recipeDetailSearchCol}>
                                <Button className={aiSimpleCss.recipeDetailSearchButton} variant="outline-secondary" onClick={() => startDetailAiSearch(recipe)}>
                                    상세보기
                                </Button>
                            </Col>
                        </Row>
                    </Card.Header>
                    <Card.Body className={aiSimpleCss.recipeText}>
                        <Card.Text>
                            <strong>재료:</strong> {JSON.stringify(recipe.ingredients)}
                        </Card.Text>
                        <Card.Text>
                            <strong>과정:</strong> {JSON.stringify(recipe.process)}
                        </Card.Text>
                    </Card.Body>
                </Card>
            ));
        }


        return null;

    }



    return (
        <div>
            <Navigation />


            <Container fluid style={{ padding: 0 }} className={aiSimpleCss.aiSimpleSearchContiner} >
                <Row className={aiSimpleCss.aiSimpleSearchContinerRow} style={{ paddingLeft: 0, paddingRight: 0 }}>
                    <Col style={{ paddingLeft: 0, paddingRight: 0 }} md={{ span: 10, offset: 1 }} className={aiSimpleCss.aiSearchMainCol}>

                        {/* 내 재료 시작점 */}
                        <div className={aiSimpleCss.myIngredientContainer} >
                            <Card border="secondary" className={aiSimpleCss.myIngredientCard}>
                                <Card.Body>
                                    <Card.Title className={aiSimpleCss.title}>내 재료</Card.Title>
                                    <Card.Text as="div">
                                        {/*재료 선택*/}
                                        {makeMyIngredientList()}
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                        {/*내 재료 카드 종료 */}

                        {/*선택된 재료 내역 시작점*/}
                        <div className={aiSimpleCss.checkedIngredientContainer}>
                            <Card border="secondary" className={aiSimpleCss.card}>
                                <Card.Body>
                                    <Card.Title className={aiSimpleCss.title}>Check</Card.Title>

                                    <Row xs={2} md={4} lg={6} className={aiSimpleCss.list}>
                                        {makeCheckedList()}
                                    </Row>
                                    <Card.Text>
                                    </Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                        {/*선택된 재료 내역 종료*/}



                        {/*레시피 검색 버튼 시작점*/}
                        <div className={aiSimpleCss.aiSearchNumberContainer}>
                            <InputGroup>
                                <InputGroup.Text id="basic-addon1" >레시피 개수</InputGroup.Text>
                                <Form.Control
                                    aria-label="Recipient's username"
                                    aria-describedby="basic-addon2"
                                    className="ai-search-input"
                                    onChange={recipeHendler}
                                    value={recipeCount}

                                />
                                <Button variant="primary" id="button-addon2" onClick={aiSearchRequest}>
                                    검색
                                </Button>
                            </InputGroup>
                        </div>
                        {/*레시피 검색 버튼 종료*/}


                        {/*레시피 결과 리스트 시작점*/}
                        <div className={aiSimpleCss.aiSearchListContainer}>
                            {recipeResponce()}
                        </div>
                        {/*레시피 결과 리스트 종료점*/}

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
    )
}

export default AiSimpleSearch;