import React, { useState , useRef , useEffect } from 'react';
import {useLocation, useNavigate} from "react-router-dom";

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
import axios from "axios";
import { useCookies } from 'react-cookie';
import {useDispatch, useSelector} from "react-redux";
import {getNewToken} from '../../services/auth2';
import {containToken} from "../../Store/tokenSlice";

function MainCopy() {
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
        <Navigation/>
      <Container fluid className={styles.container}>
        <div className={styles.main}>
          <Row className={styles.linkrow}>
            <Col md={{ span: 3, offset: 2 }} className={styles.linkbox}>
              <h2 className={`${styles.text} ${styles.englishFont}`}>Recipe</h2>
              <h2 className={`${styles.text} ${styles.englishFont}`}>Search</h2>
              <a onClick={AiSearch}>Go to</a>
            </Col>
            <Col md={{ span: 3, offset: 2 }} className={styles.linkbox}>
              <h2 className={`${styles.text} ${styles.englishFont}`}>Refrigerator</h2>
              <h2 className={`${styles.text} ${styles.englishFont}`}>Management</h2>
              <a onClick={inven}>Go to</a>
            </Col>
          </Row>
          <Row className={styles.linkrow}>
            <Col md={{ span: 3, offset: 2 }} className={styles.linkbox}>
              <h2 className={`${styles.text} ${styles.englishFont}`}>Community</h2>
              <a onClick={signin}>Go to</a>
            </Col>
            <Col md={{ span: 3, offset: 2 }} className={styles.linkbox}>
              <h2 className={`${styles.text} ${styles.englishFont}`}>Gallery</h2>
              <a onClick={signin}>Go to</a>
            </Col>
          </Row>
        </div>
      </Container>
      </>
  );
}

export default MainCopy;