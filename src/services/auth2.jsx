import axios from "axios";
import {containToken} from "../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
import {useCookies} from "react-cookie";
import {getToken} from "../Store/accessStore";
import {jwtDecode} from "jwt-decode";
import {useNavigate} from "react-router-dom";



const getNewToken = async (refreshToken) => {
    let response;
    try {
        console.log("토큰 다시받아오는 중");
        response = await axios.post(
            "/njango/api/v1/auth/refreshToken",{},
            {
                headers: {
                    "Authorization": `Bearer ${refreshToken}`
                }
            }
        );
    }
    catch (e) {
        // refresh token 유의미 하지 않을 경우
        return new Error("refresh token invalid")
    }

    const newTokenObject
        = { "newToken" : response.data.accessToken, "newRefreshToken" : response.data.refreshToken};

    console.log(newTokenObject.newToken)
    return newTokenObject

}


/**
 * 액세스 토큰의 만료 상태를 확인합니다.
 * - 만료되었거나 만료까지 남은 시간이 60초 이하인 경우 `true`를 반환합니다.
 * - 만료되지 않았거나 만료까지 여유 시간이 남아있는 경우 `false`를 반환합니다.
 *
 * @returns {boolean} 토큰이 만료되었거나 만료가 임박한 경우 `true`, 그렇지 않으면 `false`.
 */
const expired  = () => {
    const accessToken = getToken();
    if(accessToken){
        const decoded = jwtDecode(accessToken);
        const currentTime = Math.floor(Date.now()/1000); // 현재 시간
        const expiryTime = decoded.exp;

        console.log(decoded.exp);
        console.log(currentTime)
        // 1분(60초) 여유를 두고 만료 체크
        const gracePeriod = 60;
        return (expiryTime - currentTime) < gracePeriod;
    }

    return true; // 액세스 토큰이 없으면 만료로 간주


}

const getNewTokenAdmin = async (refreshToken) => {;
    let response;
    try {
        response = await axios.post(
            "/njango/api/v1/auth/refreshToken/checkAdmin",{},
            {
                headers: {
                    "Authorization": `Bearer ${refreshToken}`
                }
            }
        );
    }
    catch (e) {
        // refresh token 유의미 하지 않을 경우
        return new Error("refresh token invalid")
    }


    const newTokenObject
        = { "newToken" : response.data.accessToken, "newRefreshToken" : response.data.refreshToken};

    console.log(newTokenObject.newToken)
    return newTokenObject


}






export {getNewToken,getNewTokenAdmin,expired}