import React, { useState , useRef , useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import styles from '../../styles/Sign/Sign.module.scss';

import Container from 'react-bootstrap/Container';

import logoImg from '../../assets/Logo/logo.png';
import * as url from "url";
import {containToken} from "../../Store/tokenSlice";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";

const Sign = () => {
  const navigate = useNavigate();

  const emailsign = () => {
    navigate('/SignUp');
  };

  const findid = () => {
    navigate('/FindId');
  };

  const findpw = () => {
    navigate('/FindPw');
  };

  const signin = () => {
    navigate('/SignIn');
  };


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
    .post("/njanog/login/kakaoCode", body)
  }

  return (
    <Container fluid className={styles.container}>
      <div className={styles.sign}>
        <img src={logoImg} alt='' className={styles.logoimg} />
        <form>
          <div className={styles.btnbox}>
            <input type="button" className={styles.kakaobtn} onClick={kakaoSignUp} value={"카카오 계정으로 가입하기"} />
          </div>
          <div className={styles.btnbox}>
            <input type="button" className={styles.emailbtn} onClick={emailsign} value={"이메일 계정으로 가입하기"} />
          </div>
        </form>
        <div className={styles.account}>
          <a onClick={findid}>아이디 찾기</a>
          <span> | </span>
          <a onClick={findpw}>비밀번호 찾기</a>
          <span> | </span>
          <a onClick={signin}>로그인</a>
        </div>
      </div>
    

    </Container>
  );
}

export default  Sign;