import React, { useState } from 'react';
import styles from "../../styles/MyPage/Sidebar.module.scss";
import { useLocation, useNavigate } from 'react-router-dom';

const Sidebar = ({setFilterModalShow}) => {
  const navigate = useNavigate();
  const location = useLocation();
  // const [activeItem, setActiveItem] = useState(null);

  const handleNavigation = (path) => {
    navigate(path);
  };

  // const goMyPage = () => {
  //   navigate('/MyPage');
  // }

  // const goHistory = () => {
  //   navigate('/HistoryList');
  // };

  // const goLike = () => {
  //   navigate('/LikeList');
  // };

  return (
    <div className={styles.sidebar}>
      <ul>
        <li className={location.pathname === '/MyPage' ? styles.active : ''}
          onClick={() => handleNavigation('/MyPage')}>
          개인 정보
        </li>
        <li className={location.pathname === '/HistoryList' ? styles.active : ''}
          onClick={() => handleNavigation('/HistoryList')}>
          레시피 기록
        </li>
        <li className={location.pathname === '/LikeList' ? styles.active : ''}
          onClick={() => handleNavigation('/LikeList')}>
          Like🖤
        </li>
      </ul>
    </div>
  );
}

export default Sidebar;
