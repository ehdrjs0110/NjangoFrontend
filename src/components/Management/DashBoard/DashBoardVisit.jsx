import Card from "react-bootstrap/Card";
import useChart from "../../../services/Management/useChart";
import { useEffect, useState } from "react";
import {useDispatch, useSelector} from "react-redux";
import axios from "axios";
import {expired, getNewToken} from "../../../services/auth2";
import {containToken} from "../../../Store/tokenSlice";
import {containIsAdmin} from "../../../Store/isAdminSlice";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";
import {axiosInstance} from "../../../middleware/customAxios";

const Visit = () => {

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

    const [visitList, setVisitList] = useState([0, 0, 0, 0, 0, 0, 0]);
    let accessToken = useSelector(state => state.token.value);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 토큰 핸들러 호출
                await tokenHandler();

                // 데이터 가져오기
                const res = await axiosInstance.get(`management/visit/lastSevenDays`);
                console.log(res.data);
                setVisitList(res.data);
            } catch (err) {
                console.error(err);
                console.error("Something wrong happened during visit request");
                setVisitList([0, 0, 0, 0, 0, 0, 0]); // 에러 발생 시 0으로 초기화
            }
        };

        fetchData(); // 비동기 함수 호출
    }, []); // 의존성 배열



    // 오늘부터 7일 전까지의 날짜 배열 생성
    const labels = [];
    const today = new Date();

    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(today.getDate() - i);
        const month = String(date.getMonth() + 1).padStart(2, '0'); // 월은 0부터 시작하므로 +1
        const day = String(date.getDate()).padStart(2, '0');
        labels.push(`${month}-${day}`);
    }

    const data = {
        labels: labels, // 생성한 날짜 배열로 대체
        datasets: [
            {
                label: 'Dataset',
                data: visitList,
                borderColor: 'rgba(255, 99, 132, 1)',
                backgroundColor: 'rgba(255, 99, 132, 0.5)',
                pointStyle: 'rectRounded',
                pointRadius: 10,
                pointHoverRadius: 15
            }
        ]
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            title: {
                display: true,
                text: 'Weekly Visitors'
            }
        },
        scales: {
            y: {
                ticks: {
                    callback: function (value) {
                        return Number(value).toFixed(0); // 소수점 제거
                    }
                }
            }
        }
    };

    const canvasRef = useChart(data, options);
    return (
        <Card border="light">
            {/*<Card.Title>*/}
            {/*    주간 방문자*/}
            {/*</Card.Title>*/}
            <Card.Body style={{ position: 'relative' }}>
                <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }}></canvas>
            </Card.Body>
        </Card>
    )
}

export default Visit;