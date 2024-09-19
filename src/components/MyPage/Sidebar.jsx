import React, { useState } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';


import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import {Accordion} from "react-bootstrap";

import styles from "../../styles/MyPage/Sidebar.module.scss";
import { useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const goMyPage = () => {
    navigate('/MyPage');
  }

  const goHistory = () => {
    navigate('/HistoryList');
  };

  const goLike = () => {
    navigate('/LikeList');
  };

  return (
    <div className={styles.sidebar}>
      <ul>
        <li onClick={goMyPage}>개인 정보</li>
        <li onClick={goHistory}>레시피 기록</li>
        <li onClick={goLike}>Like🖤</li>
        <li>필터 설정</li>
      </ul>
    </div>
  );
}

export default Sidebar;
