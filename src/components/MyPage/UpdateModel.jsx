import React, {useEffect, useState} from 'react';
import { Modal, Button, InputGroup,Form } from 'react-bootstrap';
import axios from "axios";
import {useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import {getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useNavigate} from "react-router-dom";

const UpdateModel = (props) => {
    const [nickname,setNickname] = useState(null);
    const [phoneNumber,setPhoneNumber] = useState(null);
    const [tokenCheck,setTokenCheck] = useState(false);
    const [request,setRequest] = useState(false);

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let reduxEmail = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();
    // --
    const navigate = useNavigate();
    useEffect(() => {
        // access token의 유무에 따라 재발급 --
        let refreshToken = cookies.refreshToken;
        async function checkAccessToken() {
            try {
                // console.log("useEffect에서 실행")

                // getNewToken 함수 호출 (비동기 함수이므로 await 사용)
                const result = await getNewToken(refreshToken);
                refreshToken = result.newRefreshToken;

                // refresh token cookie에 재설정
                setCookie(
                    'refreshToken',
                    refreshToken,
                    {
                        path:'/',
                        maxAge: 7 * 24 * 60 * 60, // 7일
                        // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                    }
                )

                // Redux access token 재설정
                dispatch(containToken(result.newToken));

            } catch (error) {
                console.log(error);
                navigate('/SignIn');
            }
        }
        // checkAccessToken();

        // checkAccessToken();
        if(accessToken == null || accessToken == undefined)
        {
            checkAccessToken();
            setTokenCheck(true);
        }else {
            setTokenCheck(true);
        }
    }, []);



    async function handClick()
    {
      const isCheck = await updateInfo();

      if(isCheck)
      {

          // props.fetchData();
          let refreshToken = cookies.refreshToken;
          async function checkAccessToken() {
              try {
                  // console.log("useEffect에서 실행")

                  // getNewToken 함수 호출 (비동기 함수이므로 await 사용)
                  const result = await getNewToken(refreshToken);
                  refreshToken = result.newRefreshToken;

                  // refresh token cookie에 재설정
                  setCookie(
                      'refreshToken',
                      refreshToken,
                      {
                          path:'/',
                          maxAge: 7 * 24 * 60 * 60, // 7일
                          // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                      }
                  )

                  // Redux access token 재설정
                  dispatch(containToken(result.newToken));

                  props.onHide();

              } catch (error) {
                  console.log(error);
                  navigate('/SignIn');
              }
          }
          checkAccessToken();
      }else
      {
          alert("업데이트를 하는 중 문제가 발생 했습니다. 다시 시도해주세요");
      }
    };

    async function updateInfo()
    {
        console.log("testing" + accessToken);
        console.log(nickname);
        console.log(phoneNumber);

        console.log(isValid);

        if(!isValid){
            return false;
        }

        try {
            const requestBody = { nickname,  phoneNumber};
            const response = await axios.patch("http://localhost:8080/user/" + reduxEmail,
                requestBody,
                {
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${accessToken}`
                    },
                })
            if (response.status === 204) {
                // 성공적으로 업데이트된 경우
                return true;
            } else {
                return false;
            }
        }catch (e) {
            console.log(e);
            return false;
        }
    };

    const nicknameHandler = (event) => {
        const nickname =event.target.value;
        console.log(nickname);
        setNickname(nickname);
    }

    // const phoneNumberHandler = (event) => {
    //     const phonenumber = event.target.value;
    //     setPhoneNumber(phonenumber);
    //
    // }

    const [isValid, setIsValid] = useState(true);

    const formatPhoneNumber = (value) => {
        const cleaned = value.replace(/\D/g, ''); // 숫자 이외의 문자 제거
        let formatted = '';

        if (cleaned.length <= 3) {
            formatted = cleaned;
        } else if (cleaned.length <= 7) {
            formatted = `${cleaned.slice(0, 3)}`+ `-${cleaned.slice(3)}`;
        } else {
            formatted = `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7, 11)}`;
        }

        return formatted;
    };

    const validatePhoneNumber = (number) => {
        const phoneRegex = /^(\d{2,3})-(\d{3,4})-(\d{4})$/;
        return phoneRegex.test(number);
    };

    const phoneNumberHandler = (event) => {
        const { value } = event.target;
        const formattedValue = formatPhoneNumber(value);
        console.log(formattedValue);
        setPhoneNumber(formattedValue);
        setIsValid(validatePhoneNumber(formattedValue));
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        if (isValid) {
            alert('유효한 전화번호입니다.');
            // 전화번호를 서버로 전송하는 로직 추가
        } else {
            alert('유효하지 않은 전화번호입니다. 다시 확인해주세요.');
        }
    };

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    정보수정
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Label htmlFor="inputPassword5">닉네임</Form.Label>
                <Form.Control
                    id="nickname"
                    onChange={nicknameHandler}
                    maxLength={14}
                />
                <Form.Label htmlFor="inputPassword5">전화번호</Form.Label>
                <Form.Control
                    id="phonenumber"
                    value={phoneNumber}
                    onChange={phoneNumberHandler}
                    maxLength={13}
                />
                {!isValid && <p style={{ color: 'red' }}>유효하지 않은 전화번호 형식입니다.</p>}
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={handClick}>저장</Button>
                {/*<Button onClick={() => { props.onHide(); anotherFunction(); }}>저장</Button>*/}

            </Modal.Footer>
        </Modal>
    );
}

export default UpdateModel;