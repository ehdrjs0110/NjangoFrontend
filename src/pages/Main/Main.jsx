import React, { useState , useRef , useEffect } from 'react';
import {useLocation, useNavigate} from "react-router-dom";

import Navigation from '../../components/Nav/Navigation'

import '../../styles/Bootstrap/Bootstrap.scss';
import styles from '../../styles/Main/Main.module.scss';

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
          <div className={styles.box}>
            <div className={styles.linkbox} onClick={AiSearch}>
              <img src={recipeImg} alt="" className={styles.img}/>
            </div>
            <div className={`${styles.text}`} onClick={AiSearch}>
                <div>레시피 검색</div>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.linkbox} onClick={inven}>
              <img src={managerImg} alt="" className={styles.img}/>
            </div>
            <div className={`${styles.text}`} onClick={inven}>
                <div>냉장고 관리</div>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.linkbox} onClick={signin}>
              <img src={comuImg} alt="" className={styles.img}/>
            </div>
            <div className={`${styles.text}`} onClick={signin}>
                <div>커뮤니티</div>
            </div>
          </div>
          <div className={styles.box}>
            <div className={styles.linkbox} onClick={signin}>
              <img src={galleryImg} alt="" className={styles.img}/>
            </div>
            <div className={`${styles.text}`} onClick={signin}>
                <div>갤러리</div>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

export default Main;