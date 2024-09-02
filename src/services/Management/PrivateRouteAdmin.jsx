import {Navigate} from "react-router-dom";
import {useCookies} from "react-cookie";
import axios from "axios";
import {useEffect, useState} from "react";
import {getNewTokenAdmin} from "../auth2"
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
import {containIsAdmin} from "../../Store/isAdminSlice";

const PrivateRouteAdmin = ({component: Component}) => {
    let isAdmin = useSelector(state => state.isAdmin.value);
    const accessToken = useSelector((state) => state.token.value);

    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    const [loading, setLoading] = useState(true); // 로딩 상태 추가

    let refreshToken = cookies.refreshToken;

    // redux 함수
    const dispatch = useDispatch();
    useEffect(() => {
        async function checkAccessToken() {
            try {
                console.log("여기실행 checkAccessToken")
                // getNewToken 함수 호출 (비동기 함수이므로 await 사용)
                const result = await getNewTokenAdmin(refreshToken);
                if (result instanceof Error) {
                    throw result;
                }

                refreshToken = result.newRefreshToken;
                    // refresh token cookie에 재설정
                setCookie(
                    'refreshToken',
                    refreshToken,
                        {
                            path: '/',
                            maxAge: 7 * 24 * 60 * 60, // 7일
                        }
                    )
                    dispatch(containToken(result.newToken));
                    dispatch(containIsAdmin(true));
            } catch (error) {
                setLoading(false);
                console.log(error);
            }finally {
                setLoading(false); // 비동기 작업 완료 후 로딩 상태 변경
            }
        }
        if(isAdmin === false)
        {
            checkAccessToken();
        }else {
            setLoading(false);
        }

        console.log(accessToken)
    }, [isAdmin, accessToken, refreshToken, dispatch, setCookie]);
    if (loading) {
        return null; // 로딩 중일 때는 아무 것도 렌더링하지 않음
    }
    return(
        isAdmin ? Component : <Navigate to="/management"/>
    )
}


export default PrivateRouteAdmin;