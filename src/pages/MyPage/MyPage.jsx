import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UpdateModel from '../../components/MyPage/UpdateModel';


import Card from 'react-bootstrap/Card';
import Navigation from '../../components/Nav/Navigation'
import imgPath from '../../assets/MyPageImg/img.png';
import myPageStyle from '../../styles/MyPage/MyPage.module.scss'

import {useCookies} from "react-cookie";
import {getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import AllergyModel from "../../components/MyPage/AllergyModel";



const MyPage = () => {
    const [infoData,setInfoData] = useState(null);
    // auth 관련 --
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // update 기능 관련 model을 위한 상태 관리
    const [infoModalShow, setInfoModalShow] = useState(false);
    const [filterModalShow, setFilterModalShow] = useState(false);
    const [isChange, setIschange] = useState(false);
    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let reduxEmail = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();
    // --

    let newAccessToken;
    useEffect(() => {
        setIschange(true);
        console.log("isChange 난 후에 실행" + accessToken)
        fetchDate();
    },[isChange, accessToken])

    async function checkAccessToken2() {

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

    const fetchDate = async () => {
        let response;
        console.log("요청 중");
        try {
            if(accessToken == null || accessToken == undefined)
            {
                console.log("요청에서 accesstoken" + accessToken);
                console.log("요청에서 accesstoken" + newAccessToken);
                response = await axios.get(
                    "http://localhost:8080/user/"+ reduxEmail,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${newAccessToken}`
                        },
                    }
                )
                console.log(response.data);
                setInfoData(response.data);
                console.log("cheking: " + response.data.id)
            }

            response = await axios.get(
                "http://localhost:8080/user/"+ reduxEmail,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    },
                }
            )
            console.log(response.data);
            setInfoData(response.data);
            console.log("cheking: " + response.data.id);
        } catch (e)
        {
            console.log(e);

            checkAccessToken2();
            try {

                response = await axios.get(
                    "http://localhost:8080/user/"+ reduxEmail,
                    {
                        headers: {
                            "Content-Type": "application/json",
                            "Authorization": `Bearer ${accessToken}`
                        },
                    }
                )
                console.log(response);
                setInfoData(response.data);
                console.log("cheking" + infoData);

            } catch (e) {
                console.error(e);
            }
        }



    }

    const goHistory = () => {
        navigate('/HistoryList');
    };

    const goLike = () => {
        navigate('/LikeList');
    };


    return (
        <>
            <Navigation />
            <div>
                <Container fluid  className={myPageStyle.MyPageContainer} >
                    <Row className={myPageStyle.ContainerRow} >
                        <Col md={{ span:  10, offset: 1 }} className={myPageStyle.ContainerCol}>
                            <Col md={{ span:  6, offset: 3 }} className={myPageStyle.MyPageCardContainCol}>
                                <Card className={`text-center ${myPageStyle.MyPageCard}`} >
                                    <Card.Body className={myPageStyle.MyPageCardBody}>
                                        <img src={imgPath}/>
                                        <Card.Text >
                                            <Row xs={2} lg={2}>
                                                <Col><p> 아이디 </p></Col>
                                                <Col><p>{infoData ? infoData.id : 'Loading...'}</p></Col>
                                            </Row>
                                            <Row xs={2} lg={2}>
                                                <Col><p>닉네임</p></Col>
                                                <Col><p>{infoData ? infoData.nickname : 'Loading...'}</p></Col>
                                            </Row>
                                            <Row xs={2} lg={2}>
                                                <Col><p>전화번호</p></Col>
                                                <Col><p>{infoData ? infoData.phoneNumber : 'Loading...'}</p></Col>
                                            </Row>
                                        </Card.Text>
                                        <Button variant="outline-secondary" onClick={() => setInfoModalShow(true)}>정보수정</Button>
                                        <UpdateModel
                                            show={infoModalShow}
                                            onHide={() => {
                                                setInfoModalShow(false);
                                                fetchDate();
                                                }
                                            }
                                        />
                                    </Card.Body>
                                    <Card.Footer className="text-muted">
                                        <Button variant="outline-secondary" onClick={() => setFilterModalShow(true)} >필터 설정</Button>
                                        <AllergyModel
                                            show={filterModalShow}
                                            onHide={() => {
                                                setFilterModalShow(false);
                                            }
                                            }
                                        />
                                        <Button variant="outline-secondary" onClick={goHistory}>레시피 기록</Button>{' '}
                                        <Button variant="outline-secondary" onClick={goLike}>Like🖤</Button>{' '}
                                    </Card.Footer>
                                </Card>

                            </Col>

                        </Col>
                    </Row>
                </Container>
            </div>
        </>
    );
}

export default MyPage;
