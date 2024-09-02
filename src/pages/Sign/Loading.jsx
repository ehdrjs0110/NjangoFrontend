import React, { useState , useRef , useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import {containToken} from "../../Store/tokenSlice";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import Spinner from 'react-bootstrap/Spinner';

import Container from 'react-bootstrap/Container';
import styles from '../../styles/Sign/Loading.module.scss';

const Loading = () => {
    const navigate = useNavigate();

    // refreshToken 보관을 위한 cookie 설정
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // redux 함수
    const dispatch = useDispatch();
    // accessToken && refreshToken 변수 선언
    let accessToken;
    let refreshToken;

    const CLIENT_ID = '7a2afab08fdef9ddd3b09ac451ca30b9';
    const REDIRECT_URI = 'http://localhost:3000/Loading';
    const kakaoSignUp = () => {
      const kakaoUrl = `https://kauth.kakao.com/oauth/authorize?response_type=code&client_id=${CLIENT_ID}&redirect_uri=${REDIRECT_URI}`;
      window.location.href = kakaoUrl;
    };
  
    const code = new URL(window.location.href).searchParams.get("code");
  
    useEffect(() => {
      if (code) {
        sendCode();
      }
    }, [code]);
    
    async function sendCode() {

        const body = {
          code: code,
        };
    
        await axios
        .post("http://localhost:8080/login/kakaoCode", body)
        .then((res) => {
          if(res.data!=null){
            //alert("카카오 계정으로 회원가입 성공!");
            console.log(res.data);
            accessToken = res.data.accessToken;
            refreshToken = res.data.refreshToken;
            // redux 변수에 access token 넣는 부분
            dispatch(containToken(accessToken));
            // refresh token cookie에 넣는 부분
            refreshToken = JSON.stringify(refreshToken);
            setCookie(
                'refreshToken',
                refreshToken,
                {
                  path:'/',
                  maxAge: 7 * 24 * 60 * 60, // 7일
                  // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                }
            )
            
           navigate('/Main');
          }
        });
    
      }

    return (
        <>
            <Container fluid style={{padding:0}} className={styles.container} >
                <Spinner animation="border" className={styles.loading} />
            </Container>
        </>
    );
}

export default Loading;
