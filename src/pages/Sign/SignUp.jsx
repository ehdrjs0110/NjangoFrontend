import React, { useState , useRef , useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import styles from '../../styles/Sign/SignUp.module.scss';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';

import logoImg from '../../assets/Logo/logo.png';

const SignUp = () => {
  const navigate = useNavigate();

  //입력받은 이메일 
  const [isEmail, setEmail] = useState();

  //입력받은 전화번호
  const [phoneNumber, setPhoneNumber] = useState('');

  //입력받은 인증 코드
  const [isCode, setCode] = useState();

  //이메일 인증 박스 보이기
  const [isHidden, setHidden] = useState(false);

  //이메일 수정 불가
  const [isRead, setRead] = useState(false);

  //이메일 인증 여부
  const [isAuth, setAuth] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if(isAuth){  

      const form = e.target;
      const email = form.elements.email.value;
      const password = form.elements.password.value;
      const nickname = form.elements.nickname.value;
      const phone = phoneNumber;


      const formData = new FormData();
      formData.append("email", email);
      formData.append("password", password);
      formData.append("nickname", nickname);
      formData.append("phoneNumber", phone);


      // formData.forEach((value, key) => {
      //   console.log("key : " + key + " value : " + value);
      // });

      //axios 파일 전송
      axios
        .post("/njango/api/v1/auth/register", formData, {
          headers: {
            "Content-type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
          if(res.data!=null){
            alert("회원가입 성공 하셨습니다!");
            //페이지 이동
            navigate('/SignIn');
          }else{
            alert("회원가입 실패 하셨습니다!" + "\n" + "아이디와 비밀번호를 확인해주세요!");
          }
        })
        .catch((err) => {
          console.log("err message : " + err);
          alert("회원가입 실패 하셨습니다!" + "\n" + "아이디와 비밀번호를 확인해주세요!");
        });

    }else {
      alert("이메일 인증을 진행해주세요.");
    }
    
  };

  const checkEmail = async () => {
    const data = {
      email : isEmail
    };

    try{
      const res = await axios.post("/njango/api/v1/auth/checkAccount", data);
        if(res.data){
          alert("계정이 존재합니다.");
          return false;
        }else{
          return true;
        }      
    }catch(err){
      alert("확인 실패");
      return false;
    }
  };

  const sendEmail = async() => {
    const checkAccount = await checkEmail();

    if(checkAccount){
      
      console.log(isEmail);
      const data = {
        email : isEmail
      };
    
      try{
        const res = await axios
        .post("/njango/mail/send", data);

        alert("메일 보내기 성공");
        console.log('메일 전송 성공:', res.data); // 성공 시 응답 출력
        setAuth(true);
        setHidden(true);
        setRead(true);

      }catch(err){
        console.log("err message : " + err);
          alert("메일 보내기 실패");
          setRead(false);

      }
      //axios 파일 전송
      
    }else {
      console.log(isEmail);
    }
    
  };

  const handleEmail = (e) => {
    setEmail(e.target.value);
  };

  const handleCode = (e) => {
    setCode(e.target.value);
  };

  const checkCode = () => {

    const data = {
      email : isEmail,
      code : isCode
    };
  
    //axios 파일 전송
    axios
      .post("/njango/mail/verify/code", data)
      .then((res) => {
          if(res.data === true){
            alert("코드 확인!");
            setHidden(false);
            console.log('코드 검증 결과:', res.data); // 검증 결과 출력
          }else{
            alert("코드를 다시 입력해주세요.");
          }
          
      })
      .catch((err) => {
        alert("인증 실패");
        setRead(false);
        console.error('코드 검증 실패:', err); // 실패 시 에러 출력
      });  

  }

  const handlePhoneChange = (event) => {
    const { value } = event.target;
    setPhoneNumber(formatPhoneNumber(value)); // 입력값을 포맷팅하여 저장
  };

  const formatPhoneNumber = (value) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, ''); // 숫자가 아닌 문자는 모두 제거
    const phoneNumberLength = phoneNumber.length;
  
    if (phoneNumberLength < 4) return phoneNumber;
    if (phoneNumberLength < 8) {
      return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
    }
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 7)}-${phoneNumber.slice(7, 11)}`;
  };

  return (
    <Container fluid className={styles.container}>
      <div className={styles.signup}>
        <img src={logoImg} alt='' className={styles.logoimg} />
        <form onSubmit={handleSubmit} >
          <div className='inputbox'>  
            <input type="email" id='email' className={styles.inputbox} onChange={handleEmail} readOnly={isRead} placeholder='이메일'/>
          </div>
          <div className='email'>
          <Button variant="primary" className={styles.emailbtn} onClick={sendEmail}>인증번호 전송</Button>
          </div>
          <div className={styles.hiddenbox} style={{ display: isHidden ? "block" : "none"}}>  
            <div>
              <input type="text" id='emailchk' className={styles.inputbox} onChange={handleCode} placeholder='코드확인'/>
            </div>
          <div>
            <Button variant="primary" className={styles.emailbtn} onClick={checkCode}>인증코드 확인</Button>
          </div>
          </div>
          <div className='inputbox'>  
            <input type="password" id='password' className={styles.inputbox} placeholder='비밀번호'/>
          </div>
          <div className='inputbox'>  
            <input type="text" id='nickname' className={styles.inputbox} placeholder='닉네임'/>
          </div>
          <div className='inputbox'>  
            <input type="text" id='phone' className={styles.inputbox} placeholder='전화번호' value={phoneNumber} onChange={handlePhoneChange}/>
          </div>
          <div className='btnbox'>
            <input type="submit" className={styles.submitbtn} value="회원가입" />
          </div>
        </form>
      </div>    
    </Container>
  );
}

export default  SignUp;