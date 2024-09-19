import React from 'react';
import styles from "../../styles/MyPage/Sidebar.module.scss";
import { useNavigate } from 'react-router-dom';

const Sidebar = ({setFilterModalShow}) => {
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
        <li onClick={() => setFilterModalShow(true)}>필터 설정</li>
      </ul>
    </div>
  );
}

export default Sidebar;
