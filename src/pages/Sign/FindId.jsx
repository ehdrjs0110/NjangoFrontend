import React, { useState , useRef , useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import styles from '../../styles/Sign/FindId.module.scss';

import Container from 'react-bootstrap/Container';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import FormGroup from 'react-bootstrap/esm/FormGroup';

import logoImg from '../../assets/Logo/logo.png';


const FindId = () => {

  //modal 창 띄우기
  const [modalOpen, setModalOpen] = useState(false);
  const modalBackground = useRef();

  //이메일 인증 박스 보이기
  const [isHidden, setHidden] = useState(false);

  const [isId, setId] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState('');
  

  const navigate = useNavigate();

  const find = async (e) => {
    e.preventDefault();

    try{
      const res = await axios.get(`/njango/user/find/findId/${phoneNumber}`);
      if(res){
        setHidden(true);

        const emails = res.data;
        const maskedEmails = emails.map(email => maskEmail(email));

        setId(maskedEmails);
      }
    }catch(err){
      console.log(err);
      alert("해당하는 아이디가 없습니다.");
    }
    
  };

  const gologin = () => {
    navigate('/SignIn');
  }

  const handleInputChange = (event) => {
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

  const maskEmail = (email) => {
    const [localPart, domain] = email.split('@'); // 이메일을 '@' 기준으로 분리
  
    const localPartLength = localPart.length;
    const halfLength = Math.floor(localPartLength / 2); // 절반 길이 계산
  
    if (localPartLength <= 2) {
      // 만약 앞부분의 길이가 2 이하라면 전부 '*' 처리
      return '*'.repeat(localPartLength) + '@' + domain;
    }
  
    const start = Math.floor((localPartLength - halfLength) / 2); // 절반을 중심으로 시작점 계산
    const maskedLocalPart =
      localPart.slice(0, start) + '*'.repeat(halfLength) + localPart.slice(start + halfLength);
  
    return maskedLocalPart + '@' + domain;
  };

  return (
    <Container fluid className={styles.container}>
      <div className={styles.findid}>
        <img src={logoImg} alt='' className={styles.logoimg} />
        <div className={styles.btnbox}>
          <Button className={styles.btn} size='lg' onClick={() => setModalOpen(true)}>아이디 찾기</Button>
        </div>

        {
          modalOpen &&
          <div className={styles.modal_container} ref={modalBackground} onClick={e => {
            if (e.target === modalBackground.current) {
              setModalOpen(false);
            }
          }}>
            <div className={styles.modal_content}>
              <Form>
                <Form.Group className={styles.group}>
                  <Form.Control type="text" id='phone' placeholder="전화번호" value={phoneNumber} onChange={handleInputChange} maxLength={13} />
                </Form.Group>
                <Button type='submit' className={styles.modal_btn} onClick={find} >확인</Button>
              </Form>
              <hr className={styles.line} />
              <div className={styles.show_email} style={{ display: isHidden ? "block" : "none"}}>
                <p>
                {isId?isId.map((item, index) => {
                  return <><span key={index}>{item}</span><br /></>;
                }):null}
                </p>
                <Button className={styles.btn} size='md' variant="primary" onClick={gologin}>로그인 하기</Button>
              </div>
            </div>
          </div>
        }
      </div>
    </Container>


  );
}

export default  FindId;