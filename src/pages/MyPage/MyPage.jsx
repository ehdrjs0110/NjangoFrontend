import React, {useEffect, useState} from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import UpdateModel from '../../components/MyPage/updateModel';


import Card from 'react-bootstrap/Card';
import Navigation from '../../components/Nav/Navigation'
import imgPath from '../../assets/MyPageImg/img.png';
import myPageStyle from '../../styles/MyPage/MyPage.module.scss'
import Sidebar from '../../components/MyPage/Sidebar';

import {useCookies} from "react-cookie";
import {getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";



const MyPagec = () => {
    const [infoData,setInfoData] = useState(null);
    // auth 관련 --
    const navigate = useNavigate();
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // update 기능 관련 model을 위한 상태 관리
    const [modalShow, setModalShow] = useState(false);
    const [isChange, setIschange] = useState(false);
    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let reduxEmail = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();
    // --

    let refreshToken = cookies.refreshToken;
    let newAccessToken;




    // useEffect(() => {
    //     // access token의 유무에 따라 재발급 --
    //
    //     async function checkAccessToken() {
    //         try {
    //             // console.log("useEffect에서 실행")
    //
    //             console.log("원래 refresh token" + refreshToken);
    //
    //             // getNewToken 함수 호출 (비동기 함수이므로 await 사용)
    //             const result = await getNewToken(refreshToken);
    //             console.log("result" + result);
    //             refreshToken = result.newRefreshToken;
    //
    //             console.log("refreshToken : " + refreshToken);
    //             console.log("newToken: " + result.newToken);
    //
    //
    //             newAccessToken = result.newToken;
    //
    //             // refresh token cookie에 재설정
    //             setCookie(
    //                 'refreshToken',
    //                 refreshToken,
    //                 {
    //                     path:'/',
    //                     maxAge: 7 * 24 * 60 * 60, // 7일
    //                     // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
    //                 }
    //             )
    //
    //             // Redux access token 재설정
    //             dispatch(containToken(result.newToken));
    //
    //         } catch (error) {
    //             console.log(error);
    //             navigate('/SignIn');
    //         }
    //     }
    //     // checkAccessToken();
    //
    //     // checkAccessToken();
    //     if(accessToken == null || accessToken == undefined)
    //     {
    //         console.log("없어서 다시 가져오기");
    //
    //         checkAccessToken();
    //         setIschange(true);
    //
    //
    //
    //     }else {
    //         fetchDate();
    //     }
    //
    //
    //
    //     // --
    // }, []);
    
    
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
            <div className={myPageStyle.MyPageLayout}>
                <Container fluid  className={myPageStyle.MyPageContainer} >
                    <div className={myPageStyle.ContainerRow} >
                        <Col className={myPageStyle.LayoutWrapper}>
                            <Sidebar />
                            <Col md={8} className={myPageStyle.MyPageCardContainCol}>
                                <Card className={`text-center ${myPageStyle.MyPageCard}`} >
                                    <Card.Body className={myPageStyle.MyPageCardBody}>
                                        {/* <img src={imgPath}/> */}
                                        {/* <Card.Text className={myPageStyle.MyPageCardText}> */}
                                            {/* <Row xs={2} lg={2} className={myPageStyle.row}>
                                                <Col><p> 아이디 </p></Col>
                                                <Col><p>{infoData ? infoData.id : 'Loading...'}</p></Col>
                                            </Row>
                                            <Row xs={2} lg={2} className={myPageStyle.row}>
                                                <Col><p>닉네임</p></Col>
                                                <Col><p>{infoData ? infoData.nickname : 'Loading...'}</p></Col>
                                            </Row>
                                            <Row xs={2} lg={2} className={myPageStyle.row}>
                                                <Col><p>전화번호</p></Col>
                                                <Col><p>{infoData ? infoData.phoneNumber : 'Loading...'}</p></Col>
                                            </Row> */}
                                            <div className={myPageStyle.profile}>
                                                <img src={imgPath} alt="User profile" />
                                                <div className={myPageStyle.info}>
                                                <p className={myPageStyle.name}>{infoData ? infoData.nickname : 'Loading...'}</p>
                                                <p>{infoData ? infoData.id : 'Loading...'}</p>
                                                </div>
                                            </div>

                                            <div className={myPageStyle.infoRow}>
                                                <p className={myPageStyle.label}>닉네임</p>
                                                <p>{infoData ? infoData.nickname : 'Loading...'}</p>
                                            </div>
                                            <div className={myPageStyle.infoRow}>
                                                <p className={myPageStyle.label}>아이디</p>
                                                <p>{infoData ? infoData.id : 'Loading...'}</p>
                                            </div>
                                            <div className={myPageStyle.infoRow}>
                                                <p className={myPageStyle.label}>전화번호</p>
                                                <p>{infoData ? infoData.phoneNumber : 'Loading...'}</p>
                                            </div>
                                        {/* </Card.Text> */}
                                        <button onClick={() => setModalShow(true)} className={myPageStyle.MyPageButton}>정보수정</button>
                                        <UpdateModel
                                            show={modalShow}
                                            onHide={() => {
                                                setModalShow(false);
                                                fetchDate();
                                                }
                                            }
                                        />
                                    </Card.Body>
                                </Card>
                            </Col>
                        </Col>
                    </div>
                </Container>
            </div>
        </>
    );
}

export default MyPagec;
