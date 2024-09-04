import React, { useState , useRef , useEffect } from 'react';
import {useLocation, useNavigate} from "react-router-dom";

import Navigation from '../../components/Nav/Navigation'

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Main/Mainc.module.scss';

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

function Mainc() {
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
            <div className={styles.panel}>
              <div className={`${styles.wave} ${styles.one}`}></div>
              <div className={`${styles.wave} ${styles.two}`}></div>
              <div className={`${styles.wave} ${styles.three}`}></div>
              <div className={styles.text}>레시피 검색</div>
              {/* <a onClick={AiSearch}>바로가기</a> */}
            </div>
              <div id="icons">
                <a className={`${styles.icon} ${styles.amethyst}`} href="#">
                  <span className={`${styles.icon} fa fa-arrow-right`}></span>
                </a>
              </div>
            <div className={styles.panel}>
              <h2 className={styles.text}>냉장고 관리</h2>
              <a onClick={inven}>바로가기</a>
            </div>
            <div className={styles.panel}>
              <h2 className={styles.text}>커뮤니티</h2>
              <a onClick={signin}>바로가기</a>
            </div>
            <div className={styles.panel}>
              <h2 className={styles.text}>갤러리</h2>
              <a onClick={signin}>바로가기</a>
            </div>
          </div>
        </Container>
    </>
  );
}

export default Mainc;