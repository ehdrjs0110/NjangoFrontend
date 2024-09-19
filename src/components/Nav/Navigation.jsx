import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';
import { useNavigate } from "react-router-dom";
import {kakaoLogout} from "../../services/logout";

import styles from '../../styles/Components/Nav/Navigation.module.scss';
import logo from '../../assets/Logo/logo.png';

import cart from '../../assets/Nav/cart.png'


// auth관련
import {useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import {useEffect} from "react";
import {jwtDecode} from "jwt-decode";
import {containEmail} from "../../Store/userEmailSlice";
import {containNickName} from "../../Store/userNickName";
import {containIsKaKao} from "../../Store/isKakaoSlice";
import axios from "axios";
import {containToken} from "../../Store/tokenSlice";



function Navigation() {
  const navigate = useNavigate();

  // auth 관련
  const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
  let refreshToken  = cookies.refreshToken;
  const dispatch = useDispatch();

  let reduxEmail = useSelector(state => state.userEmail.value);
  let reduxNickname = useSelector( state => state.userNickName.value);

  let id = reduxNickname;
  console.log("로그아웃 후 체크 " + id);
  let isKakao = useSelector(state => state.isKaKao.value);
  console.log("로그아웃 후 체크 " + isKakao);
  // 토큰 decode

  useEffect(() => {
    getEmailAndNickname();

  },[refreshToken])

  //
  const getEmailAndNickname = ()  => {
    try {
      console.log("위치 nav에서 출력, refreshToken:  " + refreshToken);
      const decoded = jwtDecode(refreshToken);

      // refresh token 에서 해석해서 가져오는 부분
      // useremail
      reduxEmail = decoded.sub;
      // nickname
      reduxNickname = decoded.nickname;
      // kakao
      isKakao = decoded.kakao;
      dispatch(containEmail(reduxEmail));
      dispatch(containNickName(reduxNickname));
      dispatch(containIsKaKao(isKakao));
      console.log(decoded);
      console.log(decoded.sub); // useremail
      console.log(decoded.nickname); //
    } catch (error) {
      console.error("Invalid token specified: ", error);
    }
  }

  const logout =  async () => {
    removeCookie('refreshToken');
    dispatch(containToken(null));
    dispatch(containEmail(null));
    dispatch(containNickName(null));
    dispatch(containIsKaKao(null));
    console.log("토큰 제거 테스트");
    console.log(refreshToken);
    console.log("logout " + isKakao);
    // navigate('/SignIn');
    // redux에서 카카오로 로그인 여부 확인하기
    if(isKakao)
    {
        try {
          console.log("카카오 로그아웃 처리");
          const CLIENT_ID = "7a2afab08fdef9ddd3b09ac451ca30b9";
          const REDIRECT_URI = "http://localhost:3000/Main";
          const KOKAO_LOGOUT_URL = `https://kauth.kakao.com/oauth/logout?client_id=${CLIENT_ID}&logout_redirect_uri=${REDIRECT_URI}`;
          // const KOKAO_LOGOUT_URL = `https://kauth.kakao.com/oauth/logout`;
          try {
            const response = await axios.get(KOKAO_LOGOUT_URL);
            console.log(response.data);
            navigate('/SignIn');
            // 로그아웃 성공 후 추가 작업 수행 가능
          } catch (error) {
            console.error("로그아웃 오류:", error);
            // 오류 처리
          }

        }catch (e) {
          console.log(e);
        }
    }else {
      goToSignIn();
    }


  }

  const goToMain = () => {
    navigate("/Main");
  }

  const goToInven = () => {
    navigate("/Inven");
  }

  const goToSearch = () => {
    navigate("/AiSearch");
  }

  const goToMy = () => {
    navigate("/MyPage");
  }
  const goToSignIn = () =>
  {
    navigate("/SignIn");
  }

  const goToCommunity = () => {
    navigate("/RecipeShareList");
  }

  const goToGallery = () => {
    navigate('/Gallery');
  }


  return (
      <div className={styles.navContainer}>
        <Navbar>
          <Container>
            <Navbar.Brand onClick={goToMain}>
              <img src={logo} className={styles.logo} alt='' />
            </Navbar.Brand>
            <Nav className={`${styles.navCenter} me-auto`}>
              <Nav.Link onClick={goToInven}>냉장고 관리</Nav.Link>
              <Nav.Link onClick={goToSearch}>레시피 검색</Nav.Link>
              <Nav.Link onClick={goToCommunity}>커뮤니티</Nav.Link>
              <Nav.Link onClick={goToGallery}>갤러리</Nav.Link>
            </Nav>
            <Nav>
              <a className={styles.shop}>
                <img src={cart} className={styles.cart} alt='' />
              </a>
              <NavDropdown title={reduxNickname || "Profile"} id="navbarScrollingDropdown">
                <NavDropdown.Item onClick={goToMy}>내 정보</NavDropdown.Item>
                <NavDropdown.Item href="#action4">구매내역</NavDropdown.Item>
                <NavDropdown.Divider />
                <NavDropdown.Item onClick={logout}>로그아웃</NavDropdown.Item>
              </NavDropdown>
            </Nav>
          </Container>
        </Navbar>
      </div>
  );
}

export default Navigation;