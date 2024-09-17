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
import {
    faHourglassHalf,
    faStar,
    faUsers
} from "@fortawesome/free-solid-svg-icons";
import {useLocation} from "react-router-dom";
import {useNavigate} from "react-router-dom";
// auth 관련 --
import {useCookies} from "react-cookie";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
//--

import {axiosInstance, axiosInstanceFormData} from "../../middleware/customAxios";

import styles from '../../styles/History/HistoryDetail.module.scss';

const EditRecipe = () => {
    const navigate = useNavigate();
    const location = useLocation(); // 현재 위치 객체를 가져옴
    const { recipeId } = location.state || {}; // 전달된 상태에서 recipe 추출, 없을 경우 빈 객체로 대체
    const [detailRecipe, setDetailRecipe] = useState([]);
    const [title, setTitle] = useState(null);
    const [ingredient, setIngredient] = useState([]);
    const [level,setLevel] = useState(0);
    const [time,setTime] = useState(0);
    const [serve,setServe] = useState(0);
    const [content, setContent] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);

    //레시피ID 만들기를 위한 시간 가져오기
    var today = new Date(); //현재시간 가져오기
    let year = today.getFullYear(); // 년도
    let month = today.getMonth() + 1;  // 월
    let date = today.getDate();  // 날짜
    let hours = today.getHours(); // 시
    let minutes = today.getMinutes();  // 분
    let seconds = today.getSeconds();  // 초
    const nowTime = year + "" + month + "" + date + "" + hours + "" + minutes + "" + seconds;

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // redux에서 가져오기
    let  userId = useSelector(state=> state.userEmail.value);
    const dispatch = useDispatch();
    // --

    console.log(recipeId);  

        //Recipe ID 생성
    const newRecipeId = userId + nowTime;
    console.log(newRecipeId);

    useEffect(() => {

    const fetchData = async () => {

        console.log(recipeId);
        
        try{
            await tokenHandler();
            const res = await axiosInstance.get(`recipe/${recipeId}`);
            const storedRecipe = res.data;

            if(storedRecipe && storedRecipe.length > 0) {
                console.log(storedRecipe);

                const detailRecipeArray = JSON.parse(storedRecipe[0].progress);
                const detailIngredientsArray = JSON.parse(storedRecipe[0].ingredients);

                setDetailRecipe(detailRecipeArray);
                setTitle(storedRecipe[0].title);
                setIngredient(formatIngredients(detailIngredientsArray).replace(/\"/gi, ""));
                setLevel(storedRecipe[0].level);
                setServe(storedRecipe[0].servings);
                setTime(storedRecipe[0].time);
            }
    
        }catch(err){
            console.log("err message : " + err);
        }
    }
    
        fetchData();
    }, [recipeId]);

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
        if(ingredients){
            return Object.entries(ingredients)
            .map(([key, value]) => `${key}: ${value}`)
            .join(', ');
        }else {
            return "";
        }
    };

    // 포멧한 ingredients 문자열을 객체로 파싱하는 함수
    function parseIngredients(ingredientString) {
        const ingredientObject = {};
        const ingredients = ingredientString.split(", ");
        ingredients.forEach(item => {
            const [key, value] = item.split(": ");
            ingredientObject[key.trim()] = value.trim();
        });
        return ingredientObject;
    }

    //레시피 공유 게시
    const postRecipe = async() => {

        let progress = JSON.stringify(detailRecipe);
        let ingredients = JSON.stringify(parseIngredients(ingredient));

        const formData = new FormData();
        formData.append("recipeId",newRecipeId);
        formData.append("title",title);
        formData.append("ingredients",ingredients);
        formData.append("progress", progress);
        formData.append("level",level);
        formData.append("time",time);
        formData.append("servings",serve);
        formData.append("content",content);

        if(selectedFile!=null){
            formData.append('file', selectedFile);
        }
        

        // formData.forEach((value, key) => {
        //     console.log("key : " + key + " value : " + value);
        // });

        try{
            await tokenHandler();
            const res = await axiosInstanceFormData.post(`recipeShare/${userId}`, formData);
            //const storedRecipe = res.data;
            alert("저장 성공!");

        } catch(err){
            console.log("err message : " + err);
        }
        

    };

    //Title 변경
    const handleTitleChange = (e) => {
        setTitle(e.target.value);
    }

    //Ingredient 변경
    const handleIngredientChange = (e) => {
        setIngredient(e.target.value);
    }

    //level 변경
    const handleLevelChange = (e) => {
        setLevel(e.target.value);
    }

    //Time 변경
    const handleTimeChange = (e) => {
        setTime(e.target.value);
    }

    //Serve 변경
    const handleServeChange = (e) => {
        setServe(e.target.value);
    }

    //Content 변경
    const handleContentChange = (e) => {
        setContent(e.target.value);
    }

    // 파일 선택 핸들러
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };

    // 레시피 변경 핸들러
    const handleDetailRecipeChange = (index, field, value) => {
        const updatedDetailRecipe = [...detailRecipe];
        updatedDetailRecipe[index][0][field] = value;
        setDetailRecipe(updatedDetailRecipe);
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
                                    <Card.Title><Form.Control type="text" value={recipe[0].과정제목} onChange={(e) => handleDetailRecipeChange(index, '과정제목', e.target.value)}/></Card.Title>
                                    <Card.Text>
                                        <Form.Control type="text" value={recipe[0].process || recipe[1].process} onChange={(e) => handleDetailRecipeChange(index, 'process', e.target.value)}/>
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
                                                    <Form.Control size="lg" type="text" value={title} onChange={handleTitleChange}/>
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
                                                                <Button variant="outline-secondary" className={styles.cookingClearButton} onClick={postRecipe} >게시하기</Button>
                                                            </Col>
                                                        </Row>
                                                    </Row>
                                                    <Row  style={{margin:0}} xs={2} md={2} lg={2}>
                                                        <Row style={{margin:0}} xs={3} md={3} lg={3}>
                                                            <Col>
                                                            <Form.Select aria-label="Default select example" onChange={handleLevelChange}>
                                                                <option value="1">1</option>
                                                                <option value="2">2</option>
                                                                <option value="3">3</option>
                                                            </Form.Select>
                                                                <p>난이도</p>
                                                            </Col>
                                                            <Col>
                                                                <p><Form.Control type="text" value={serve} onChange={handleServeChange}/>인분</p>
                                                            </Col>
                                                            {/*{aiSearchEtcRequest()}*/}
                                                            <Col>
                                                                <p><Form.Control type="text" value={time} onChange={handleTimeChange}/>분</p>
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
                                                        <Form.Control type="text" value={ingredient} onChange={handleIngredientChange}/>
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
                                <Card className={styles.contentContainer} >
                                    <Card.Body>
                                        <div className={styles.detailContainer}>
                                            <Card className={styles.recipeContainCard}>
                                                <Card.Body>
                                                    <Form.Control type="file" onChange={handleFileChange} />
                                                </Card.Body>
                                            </Card>
                                            <Card className={styles.recipeContainCard}>
                                                <Card.Body>
                                                    <Form.Control as="textarea" rows={3} placeholder='내용' onChange={handleContentChange}/>
                                                </Card.Body>
                                            </Card>
                                        </div>
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

export default EditRecipe;