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
          <div className={styles.linkbox} onClick={AiSearch}>
            <div className={`${styles.wave} ${styles.one}`}></div>
            <div className={`${styles.wave} ${styles.two}`}></div>
            <div className={`${styles.wave} ${styles.three}`}></div>
            <div className={`${styles.text} ${styles.englishFont}`}>
              <div>Recipe</div>
              <div>Search</div>
              <div className={styles.golink}>Go to</div>
            </div>
            <div className={styles.iconbox}>
              <a className={`${styles.icon} ${styles.amethyst}`} onClick={AiSearch}/>
            </div>
          </div>
          <div className={styles.linkbox} onClick={inven}>
            <div className={`${styles.wave} ${styles.one}`}></div>
            <div className={`${styles.wave} ${styles.two}`}></div>
            <div className={`${styles.wave} ${styles.three}`}></div>
            <div className={`${styles.text} ${styles.englishFont}`}>
              <div>Refrigerator</div>
              <div>Management</div>
              <div className={styles.golink}>Go to</div>
            </div>
            <div className={styles.iconbox}>
              <a className={`${styles.icon} ${styles.amethyst}`} onClick={inven}/>
            </div>
          </div>
          <div className={styles.linkbox} onClick={signin}>
            <div className={`${styles.wave} ${styles.one}`}></div>
            <div className={`${styles.wave} ${styles.two}`}></div>
            <div className={`${styles.wave} ${styles.three}`}></div>
            <div className={`${styles.text} ${styles.englishFont}`}>
              <div>Community</div>
              <div className={styles.golink}>Go to</div>
            </div>
            <div className={styles.iconbox}>
              <a className={`${styles.icon} ${styles.amethyst}`} onClick={signin}/>
            </div>
          </div>
          <div className={styles.linkbox} onClick={signin}>
            <div className={`${styles.wave} ${styles.one}`}></div>
            <div className={`${styles.wave} ${styles.two}`}></div>
            <div className={`${styles.wave} ${styles.three}`}></div>
            <div className={`${styles.text} ${styles.englishFont}`}>
              <div>Gallery</div>
              <div className={styles.golink}>Go to</div>
            </div>
            <div className={styles.iconbox}>
              <a className={`${styles.icon} ${styles.amethyst}`} onClick={signin}/>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}

export default Main;