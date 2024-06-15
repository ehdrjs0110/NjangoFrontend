import React, { useState , useRef , useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import Navigation from '../../components/Nav/Navigation'

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Main/Main.module.scss'

import recipeImg from "../../assets/Main/recipe.jpg";
import managerImg from "../../assets/Main/manager.jpg";
import galleryImg from "../../assets/Main/gallery.jpg";
import comuImg from "../../assets/Main/comu.jpg";

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


function Main() {
  const navigate = useNavigate();

  const AiSearch = () => {
    navigate('/AiSearch');
  };

  const signin = () => {
    navigate('/SignIn');
  };

  const inven = () => {
    navigate('/Inven');
  };
  
  return (
    <>
        <Navigation></Navigation>
        <Container fluid className={styles.container}>
          <div className={styles.main}>
          <Row className={styles.linkrow}>
            <Col md={{span: 3, offset: 2}} className={styles.linkbox}>
              <img src={recipeImg} className={styles.img} alt='' />
              <div className={styles.panel}>
                <h2 className={styles.text}>레시피 검색</h2>
                <a onClick={AiSearch}>바로가기</a>
              </div>
            </Col>
            <Col md={{span: 3, offset: 2}} className={styles.linkbox}>
            <img src={managerImg} className={styles.img} alt='' />
              <div className={styles.panel}>
                <h2 className={styles.text}>냉장고 관리</h2>
                <a onClick={inven}>바로가기</a>
              </div>
            </Col>
          </Row>
          <Row className={styles.linkrow}>
            <Col md={{span: 3, offset: 2}} className={styles.linkbox}>
            <img src={comuImg} className={styles.img} alt='' />
              <div className={styles.panel}>
                <h2 className={styles.text}>커뮤니티</h2>
                <a onClick={signin}>바로가기</a>
              </div>
            </Col>
            <Col md={{span: 3, offset: 2}} className={styles.linkbox}>
            <img src={galleryImg} className={styles.img} alt='' />
              <div className={styles.panel}>
                <h2 className={styles.text}>갤러리</h2>
                <a onClick={signin}>바로가기</a>
              </div>
            </Col>
          </Row>
          </div>
        </Container>
    </>
  );
}

export default Main;