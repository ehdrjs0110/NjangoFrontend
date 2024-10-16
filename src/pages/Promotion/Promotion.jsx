import React, { useState , useRef , useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import axios from "axios";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

import slideImg1 from "../../assets/Promotion/refrigerator.jpg";
import slideImg2 from "../../assets/Promotion/manage.jpg";
import slideImg3 from "../../assets/Promotion/cook.jpg";
import slideImg4 from "../../assets/Promotion/ingred.webp";

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Promotion/Promotion.module.scss';
import {useCookies} from "react-cookie";
import {getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";

import logo from '../../assets/Logo/logo.png';

const Promotion = () => {
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);

  const containerRef = useRef(null);
  const isThrottled = useRef(false); // useRef로 변경


  useEffect(() => {
    const container = containerRef.current;
  
    const scrollToIndex = (index) => {
      container.scrollTo({
        top: container.children[index].offsetTop,
        behavior: 'smooth',
      });
      console.log(currentSlide);
    };
  
    const onScroll = (event) => {
      if (isThrottled.current) return; // useRef의 current 사용
      isThrottled.current = true;
      setTimeout(() => (isThrottled.current = false), 800);
  
      const direction = event.deltaY > 0 ? 1 : -1;
      const currentIndex = Math.max(0, Math.min(currentSlide + direction, container.children.length - 1));
      setCurrentSlide(currentIndex);
      scrollToIndex(currentIndex);
    };
  
    const onKeyup = (event) => {
      if (isThrottled.current) return; // useRef의 current 사용
      isThrottled.current = true;
      setTimeout(() => (isThrottled.current = false), 800);
      
      let currentIndex = currentSlide;
      if (event.key === 'ArrowDown') {
        currentIndex = Math.min(currentSlide + 1, container.children.length - 1);
      } else if (event.key === 'ArrowUp') {
        currentIndex = Math.max(currentSlide - 1, 0);
      }
      setCurrentSlide(currentIndex);
      scrollToIndex(currentIndex);
    };

    scrollToIndex(currentSlide);
  
    container.addEventListener('wheel', onScroll);
    window.addEventListener('keyup', onKeyup);
  
    return () => {
      container.removeEventListener('wheel', onScroll);
      window.removeEventListener('keyup', onKeyup);
    };
  }, [currentSlide]);

  const clickDot = (index) => {
    setCurrentSlide(index);
  };

  const signin = () => {
    navigate('/SignIn');
  };

  return (    
    <Container fluid className={styles.container}>
    <Row className={styles.flexcontainer}>
      <div className={styles.topvar}>
        <div className={styles.logo}>
          <img src={logo} className={styles.logo} alt='' />
        </div>
        <div id="btnContainer">
          <button className={styles.startbtn} onClick={signin}>
            <span className={styles.circle} aria-hidden="true">
              <span className={`${styles.icon} ${styles.arrow}`}></span>
            </span>
            <span className={styles.buttontext}>Start</span>
          </button>
        </div>
      </div>
      <Col className={styles.maincol} >
        <div className={styles.maincontent}>
          <div className={styles.slide_dots}>
            {[0, 1, 2].map(index => (
                  <div
                    key={index}
                    className={`${styles.dot} ${currentSlide === index ? styles.active : ''}`}
                    onClick={() => clickDot(index)}
                  ></div>
            ))}
          </div>
          <div ref={containerRef} class={styles.slide_container}>
            <div class={styles.slide}>
              <img src={slideImg1} className={styles.img} alt='' />
              <div className={styles.panel}>
                Njango는 바쁜 일상 속에서도 편리한 요리 생활을 제공하는 스마트 주방 도우미입니다. 냉장고 속 재료를 쉽게 관리하고, 맞춤형 레시피를 찾아주며, 알레르기 걱정 없는 요리를 지원합니다. Njango와 함께라면 요리가 간단하고 즐거워집니다.
              </div>
            </div>
            <div class={styles.slide}>
              <img src={slideImg2} className={styles.img} alt='' />
              <div className={styles.panel}>
              냉장고 속 식재료를 스마트하게 관리하세요. 유통기한 알림, 남은 재료 확인 등 효율적인 주방 관리를 도와드립니다.
              </div>
            </div>
            <div class={styles.slide}>
              <img src={slideImg3} className={styles.img} alt='' />
              <div className={styles.panel}>
              냉장고에 있는 재료만으로도 맛있는 요리를 완성할 수 있습니다. 인공지능이 제안하는 맞춤형 레시피로 매일 새로운 요리를 시도해보세요.
              </div>
            </div>
          </div>
        </div>
      </Col>
    </Row>
  </Container>
  );
}

export default  Promotion;