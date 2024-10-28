import React, {useEffect, useState, useRef} from 'react';
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
// auth 관련 --
import {useCookies} from "react-cookie";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
//--

import {axiosInstance} from "../../middleware/customAxios";
import {arrayNestedArray, makeFlatArray} from "../../services/arrayChecker";

const AiSearch = () => {
    // 냉장고 재료 반영 선택 여부
    const [activeKey, setActiveKey] = useState(null);
    const [testKey, setTestKey] = useState(false);
    const [recipe, setRecipe] = useState(null);
    const [searchValue, setSearchValue] = useState("");
    const [selectedKindOfFood, setSelectedKindOfFood] = useState([]);
    // 알러지 정보를 요청하는 상태를 관리하는 변수
    // 'requestAllergy'가 true면 알러지 정보 요청, false면 요청하지 않음
    const [requestAllergy, setRequestAllergy] = useState(false);
    const navigate = useNavigate();
    const [selectedMyIngredientList, setSelectedMyIngredientList] = useState([]);
    //사용자 재료
    const [isIngredients, setIngredients] = useState([]);
    const filteredItemsWithSize = isIngredients.filter(item => item.size > 0);

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // const { handleTokenRefresh } = useSetNewAuth();

    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);

    let  userId = useSelector(state=> state.userEmail.value);

    const dispatch = useDispatch();
    // --

    //modal 창 띄우기
    const [modalOpen, setModalOpen] = useState(false);
    const modalBackground = useRef();

    const [expirationFlag, setExpirationFlag] = useState(false);

    useEffect(() => {
        // console.log("accesstoken" + accessToken);

        const storedRecipe = sessionStorage.getItem("recipeList");
        if (storedRecipe) {
            console.log(storedRecipe);
            console.log(typeof storedRecipe);
            // sessionStorage.setItem("recipeList");

            // setRecipe(JSON.parse(storedRecipe));
        }

        //재료 가져오기
        const fetchData = async () => {

            const params = {userId:userId};

            try{
                await tokenHandler();
                const res = await axiosInstance.get("inven/manage/name",{params});
                if(res!=null){
                    console.log(res.data);
                }

                setIngredients(res.data);

            }catch(err){
                console.log("err message : " + err);
            }
        }
        fetchData();
    }, []);

// accesstoken2 대체
    async function tokenHandler() {
        const isExpired = expired();
        if(isExpired){
            let refreshToken = cookies.refreshToken;
            try {
                const result = await getNewToken(refreshToken);
                refreshToken = result.newRefreshToken;
                setCookie(
                    'refreshToken',
                    refreshToken,
                    {
                        path:'/',
                        maxAge: 7 * 24 * 60 * 60, // 7일
                    }
                )
                dispatch(containToken(result.newToken));
            } catch (error) {
                console.log(error);
                navigate('/Sign');
            }
        }
    }

    function CustomToggle({ children, eventKey }) {

        const decoratedOnClick = useAccordionButton(eventKey, () =>

            setTestKey(!testKey)
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


    //  재료선택
    function makeIngredientList() {
        if (filteredItemsWithSize && Array.isArray(filteredItemsWithSize)) {
            return filteredItemsWithSize.map((item, index) => {
                const isDisabled = item.dateofuse && new Date(item.dateofuse) < new Date();
                const isChecked = selectedMyIngredientList.includes(item.ingredientname); // 체크 상태

                return (
                    <Form.Check
                        inline
                        type="checkbox"
                        name="group3"
                        id={item.ingredientname}
                        className={styles.check}
                        label={item.ingredientname}
                        onChange={myIngredientHandler}
                        checked={isChecked}  // 체크 상태 반영
                        disabled={isDisabled}
                    />
                );
            });
        }
        return null;
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
    }
    // option - 종류
    const kindOfFoodList = ["한식", "중식", "양식"];
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

    const etcList = ["냉장고 재료 반영", "알레르기 반영", "소비 기한 우선 사용"];
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
                    etc === "소비 기한 우선 사용" ? (
                        activeKey === "1" && (
                            <Form.Check
                                inline
                                type="checkbox"
                                name="group2"
                                className={styles.check}
                                id={`inline-checkbox-${index}`}
                                label={etc}
                                onChange={() => setChangeTrueFalse(etc)}
                            />
                        )
                    ) : (
                        <Form.Check
                            inline
                            type="checkbox"
                            name="group2"
                            className={styles.check}
                            id={`inline-checkbox-${index}`}
                            label={etc}
                            onChange={() => setChangeTrueFalse(etc)}
                        />
                    )
                );
            }
        });
    }
    const setChangeTrueFalse = (etc) => {
        if (etc === "알레르기 반영"){
            setRequestAllergy(!requestAllergy)
        }else if (etc === "소비 기한 우선 사용") {
            const today = new Date();
            const fiveDaysLater = new Date(today);
            fiveDaysLater.setDate(today.getDate() + 5);

            const nearExpirationIngredients = filteredItemsWithSize
                .filter(item => {
                    const dateOfUse = new Date(item.dateofuse);
                    return dateOfUse >= today && dateOfUse <= fiveDaysLater;
                })
                .map(item => item.ingredientname);
            if (!expirationFlag) {
                setSelectedMyIngredientList(prevState => [
                    ...prevState,
                    ...nearExpirationIngredients
                ]);
            }else{
                // 소비 기한 임박한 재료 제거
                setSelectedMyIngredientList(prevState =>
                    prevState.filter(item => !nearExpirationIngredients.includes(item))
                );
            }
            setExpirationFlag(!expirationFlag);
        }
    }

    // prompt 요청
    async function aiSearchRequest () {
        setModalOpen(true);

        console.log("selectedKindOfFood: " + selectedKindOfFood );
        console.log("accesstoken" + accessToken);
        console.log("searchValue" + searchValue);
        console.log("selectedMyIngredientList" + selectedMyIngredientList);

        const searchWordBody = {"userId" : userId, "searchWord" : searchValue, "requestAllergy" : requestAllergy};

        console.log("요청 중");
        const requestBody = {"userContent" : `${selectedKindOfFood} 종류의 ${searchValue} 레시피를 5개를 알려주는데 재료는 자세하게 알려주고 만드는 과정에 ` +
                `대해서는 130글자 내로 간략하게 알려줘  ${selectedMyIngredientList}가 있어 형태는 title,ingredients,process으로 알려줘 그리고 재료는 리스트 형태는 싫고 객체 형태로 재료, 양의 쌍으로 알려줘` +
                "그리고 json 객체로 {0:[요리 1], 1: [요리2], 2: [요리3}, 3:[요리], 4:[요리]} 형태로만 참고로 키는 무조건 숫자여야해 보내줘"};
        let searchResponse;
        const requestBundle = {"promptEntity" : requestBody, "requestWordEntity" : searchWordBody};
        try {
            console.log('Request Bundle:', requestBundle);
            await tokenHandler();
            searchResponse = await axiosInstance.post("api/v1/chat-gpt/word",requestBundle,{timeout: 600000 });
        } catch (e) {
            console.error(e);
        }
        let response = searchResponse.data;
        console.log(response);

        // 원래코드
        let jsonString = JSON.stringify(response);
        console.log("not clean: " + jsonString);

        // 추가
        // const cleanedJsonString = jsonString.replace(/\\n/g, '').replace(/^\s+|\s+$/g, '');

        const cleanedJsonString = jsonString
            .replace(/\\n/g, '') // 줄바꿈 문자 제거
            .replace(/\\ /g, '') // 이스케이프된 공백 제거
            .replace(/  +/g, ' ') // 연속된 공백을 하나의 공백으로 변환
            .replace(/\"\s*:\s*\"/g, '": "') // 이스케이프된 공백 제거
            .trim(); // 문자열의 시작과 끝의 공백 제거


        console.log("최종 응답");
        console.log(jsonString);
        console.log("clean : " + cleanedJsonString);
        const recipes = JSON.parse(cleanedJsonString);

        console.log("JavaScript 객체를 콘솔에 출력");
        console.log(recipes);
        let recipesList =  Object.values(response);



        if(arrayNestedArray(recipesList)){
            recipesList = makeFlatArray(recipesList);
        }
        console.log(recipesList);
        setRecipe(recipesList);
        sessionStorage.setItem("recipeList",JSON.stringify(recipesList));

        setModalOpen(false);
    }


    function makeIngredient (ingredientObject) {

        // console.log(ingredientObject);
        let ingredientList = '';
        Object.entries(ingredientObject).forEach(([key, value]) => {
            ingredientList += `${key}: ${value}, `;
        });
        return (
            ingredientList
        )
    }


    // recipe UI
    function recipeResponce()
    {
        if (recipe != null)
        {
            return recipe.map((recipe, index) => (
                <Card className={styles.recipeCard} key={index}>
                    <Card.Header  className={styles.cardHeader}>
                        <Row xs={1} md={2}>
                            <Col className={styles.recipeTitleCol}>
                                {recipe.title}
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
                            <strong>재료:</strong>&nbsp;
                            <span>{Object.entries(recipe.ingredients).map(([key, value]) => `${key} ${value}`).join(', ')}</span>
                        </Card.Text>
                        <Card.Text>
                            <strong>과정:</strong>&nbsp;
                            <span>{recipe.process}</span>
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

    const startDetailAiSearch = (recipe) => {
        var today = new Date(); //현재시간 가져오기
        let year = today.getFullYear(); // 년도
        let month = today.getMonth() + 1;  // 월
        let date = today.getDate();  // 날짜
        let hours = today.getHours(); // 시
        let minutes = today.getMinutes();  // 분
        let seconds = today.getSeconds();  // 초
        const nowTime = year + "" + month + "" + date + "" + hours + "" + minutes + "" + seconds;

        //Recipe ID 생성
        const recipeId = userId + nowTime;
        console.log("recipeId"+recipeId);

        navigate('/AiDetailSearch', { state: {
                recipe : recipe,
                recipeId : recipeId
            } }); // 레시피 전달

    }

    return (
        <div className={styles.aiSearchAllContainer} >
            <Navigation/>
            <Container fluid>
                <div className={styles.aiSearchContainer}>
                    <Row className={styles.aiSearchRow}>
                        <Col md={{span: 10, offset: 1}} className={styles.aiSearchCol}>
                            <h2 className={styles.header}>레시피 검색</h2>
                            {/*레시피 명 입력 지작점*/}
                            <InputGroup className={styles.aiSearchInputGroup}>
                                <Form.Control
                                    placeholder="레시피 검색"
                                    aria-label="Recipient's username"
                                    aria-describedby="basic-addon2"
                                    className={styles.form}
                                    onChange={searchInputHandler}
                                    value={searchValue}
                                    onKeyPress={(event) => {
                                        if (event.key === 'Enter') {
                                            event.target.blur();
                                            aiSearchRequest();
                                        }
                                    }}
                                />
                                <Button variant="outline-secondary" id="button-addon2" className={styles.aiSearchButton}
                                        onClick={aiSearchRequest}>
                                    검색
                                </Button>
                            </InputGroup>
                            {/*레시피 명 입력 종료점*/}

                            {/*레시피 옵션 시작점*/}
                            <div
                                className={`${styles.aiSearchOptionContainer} ${testKey === true ? styles.expanded : styles.collapsed}`}>
                                <Accordion defaultActiveKey=""
                                           style={{paddingRight: '0', paddingLeft: '0', width: '100%'}}>
                                    <Card className={styles.containCard}>
                                        <Card.Header className={styles.aiSearchOptionHeader}>
                                            <CustomToggle eventKey="0"
                                                          className={`${styles.button}`}>옵션</CustomToggle>
                                        </Card.Header>
                                        <Accordion.Collapse eventKey="0">
                                            <div style={{padding: "0.5rem"}}>
                                                <div>
                                                    <Form.Group className={styles.foodTypeGroup}>
                                                        <Form.Label className={styles.foodTypeLabel}>종류</Form.Label>
                                                        <div className={styles.checkboxContainer}>
                                                            {makeKindOfFoodList()}
                                                        </div>
                                                    </Form.Group>
                                                </div>
                                                <div>
                                                    <Form.Group className={styles.foodTypeGroup}>
                                                        <Form.Label className={styles.foodTypeLabel}>기타</Form.Label>
                                                        <div className={styles.checkboxContainer}>
                                                            {makeEtcList()}
                                                        </div>
                                                    </Form.Group>
                                                </div>
                                                <Accordion activeKey={activeKey}>
                                                    <Accordion.Collapse eventKey="1" className={styles.ingredientContainer}>
                                                        <div>
                                                            <Form.Group className={styles.foodTypeGroup}>
                                                                <Form.Label className={styles.foodTypeLabel}>내 재료</Form.Label>
                                                                <div className={styles.checkboxContainer}>
                                                                    {makeIngredientList()}
                                                                </div>
                                                            </Form.Group>
                                                        </div>
                                                    </Accordion.Collapse>
                                                </Accordion>
                                            </div>
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
                    </Row>
                    {
                        modalOpen &&
                        <div className={styles.modal_container} ref={modalBackground} onClick={e => {
                        }}>
                            <div className={styles.loader}>
                                <div className={styles.character}></div>

                            </div>
                            <div className={styles.loading}>
                                <h2 className={styles.text}>Loading...</h2>
                            </div>
                        </div>
                    }
                </div>
            </Container>
        </div>
    );
}

export default AiSearch;