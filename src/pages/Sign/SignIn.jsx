import React, {useState, useRef, useEffect, useContext} from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import styles from '../../styles/Sign/SignIn.module.scss';

import Container from 'react-bootstrap/Container';

import logoImg from '../../assets/Logo/logo.png';
import {Cookies, useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import { containToken} from "../../Store/tokenSlice";

const SignIn = () => {
  const navigate = useNavigate();

  // refreshToken 보관을 위한 cookie 설정
  const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
  // redux 함수
  const dispatch = useDispatch();
  // accessToken && refreshToken 변수 선언
  let accessToken;
  let refreshToken;
  // refreshToken 보관 기간
  const expireDate = new Date();
  expireDate.setMinutes(expireDate.getMinutes() + 30);


  // 로그인 요청 부분
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = e.target;
    const id = form.elements.id.value;
    const password = form.elements.password.value;

    const formData = new FormData();
    formData.append("email", id);
    formData.append("password", password);

    formData.forEach((value, key) => {
      console.log("key : " + key + " value : " + value);
    });





    // 로그인 요청
    axios
        .post("http://localhost:8080/api/v1/auth/authenticate", formData, {
          headers: {
            "Content-type": "multipart/form-data",
          },
        })
        .then((res) => {


          let refreshToken = cookies.refreshToken;
          // alert(refreshToken);
          console.log("원래 refreshToken: " + refreshToken );
          console.log(res.data);
          accessToken = res.data.accessToken;
          refreshToken = res.data.refreshToken;


          console.log("accesstoken22222 "+ accessToken);

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

        })
        .then(() => {
          // console.log("refresh token cookie" +cookies.refreshToken)
            navigate('/Main');
          // navigate('/Main',{state:{accessToken}});
        })
        .catch(console.log)


  };

  //카카오톡 로그인
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
  }

  const findid = () => {
    navigate('/FindId');
  };

  const findpw = () => {
    navigate('/FindPw');
  };

  const signup = () => {
    navigate('/Sign');
  };

  return (
    <Container fluid className={styles.container}>
      <div className={styles.login}>
        <img src={logoImg} alt='' className={styles.logoimg} />
        <form onSubmit={handleSubmit} >
          <div className='inputdiv'>
            <input type="text" className={styles.inputbox} id='id' placeholder='이메일'/>
          </div>
          <div className='inputdiv'>
            <input type="password" className={styles.inputbox} id='password' placeholder='비밀번호'/>
          </div>
          <div className='btnbox'>
            <input type="submit" className={styles.submitbtn} value={"로그인"} />
          </div>
        </form>
        <div className={styles.account}>
          <a onClick={findid}>아이디 찾기</a>
          <span> | </span>
          <a onClick={findpw}>비밀번호 찾기</a>
          <span> | </span>
          <a onClick={signup}>회원가입</a>
        </div>
        <div className={styles.snslogin}>
          <input type="button" className={styles.kakaobtn} onClick={kakaoSignUp} />
        </div>
      </div>
    

    </Container>
  );
}

export default  SignIn;