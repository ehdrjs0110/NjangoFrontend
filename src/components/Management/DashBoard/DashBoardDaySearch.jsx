import {ListGroup} from "react-bootstrap";
import {useEffect, useState} from "react";
import axios from "axios";
import {axiosInstance} from "../../../middleware/customAxios";
import styles from "../../../styles/Management/ManagementSearch.module.scss"
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {expired, getNewToken} from "../../../services/auth2";
import {containToken} from "../../../Store/tokenSlice";
import {containIsAdmin} from "../../../Store/isAdminSlice";

const DaySearch = () => {
    const [todaySearchList, setTodaySearchList] = useState([]);
    // refresh token 가져오기
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

    // redux에서 가져오기
    const dispatch = useDispatch();
    const navigate = useNavigate();


    async function tokenHandler() {


        const isExpired = expired();
        if(isExpired){

            let refreshToken = cookies.refreshToken;
            try {

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
                dispatch(containIsAdmin(true));

            } catch (error) {
                console.log(error);
                navigate('/Management');
            }
        }

    }


    useEffect(() => {
        const fetchData = async () => {
            try {
                // 토큰 핸들러 호출
                await tokenHandler();
                // 데이터 가져오기
                const res = await  axiosInstance.get("management/search/count")
                    .then(response => {
                        let data = response.data;
                        console.log('Data:', data); // 데이터 확인
                        setTodaySearchList(data[0]);
                    });

            } catch (err) {
                console.error(err);
            }
        };
        fetchData(); // 비동기 함수 호출
    }, []);

    // let index = [1,2,3]
    return(
        <>
            <ListGroup horizontal className={styles.listGroupHorizontal}>
                <ListGroup.Item className={styles.tableHeader}>순위</ListGroup.Item>
                <ListGroup.Item className={`${styles.tableHeader} ${styles.userIdItem}`}>User Id</ListGroup.Item>
                <ListGroup.Item className={styles.tableHeader}>Count</ListGroup.Item>
            </ListGroup>
            {todaySearchList.map((item, index) =>
                <ListGroup horizontal key={index} className={styles.listGroupHorizontal}>
                    <ListGroup.Item className={styles.item}>{index + 1}</ListGroup.Item>
                    <ListGroup.Item className={`${styles.item} ${styles.userIdItem}`}>{item[2]}</ListGroup.Item>
                    <ListGroup.Item className={styles.item}>{item[1]}</ListGroup.Item>
                </ListGroup>)
            }
        </>
    )
}

export default DaySearch