import React, {useEffect, useState} from 'react';
import { Card } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faUserPlus, faChartLine, faDollarSign } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../styles/Management/ManagementDashboard.module.scss';
import axios from "axios";
import {useDispatch, useSelector} from "react-redux";
import {useCookies} from "react-cookie";
import {useNavigate} from "react-router-dom";
import {expired, getNewToken} from "../../../services/auth2";
import {containToken} from "../../../Store/tokenSlice";
import {containIsAdmin} from "../../../Store/isAdminSlice";
import {axiosInstance} from "../../../middleware/customAxios";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";


const DashboardTopCards = () => {
    const [newUserCount, setNewUserCount] = useState(0);
    const [totalUserCount, setTotalUserCount] = useState(0);
    const [totalSearchCount, setTotalSearchCount] = useState(0);

    const [cookies, setCookie] = useCookies(['refreshToken']);
    const dispatch = useDispatch();
    const navigate = useNavigate();

    async function tokenHandler() {
        const isExpired = expired();
        if (isExpired) {
            let refreshToken = cookies.refreshToken;
            try {
                const result = await getNewToken(refreshToken);
                refreshToken = result.newRefreshToken;
                setCookie('refreshToken', refreshToken, { path: '/', maxAge: 7 * 24 * 60 * 60 });
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
                await tokenHandler();

                const newUserRes = await axiosInstance.get(`management/user/todayNewUser`);
                setNewUserCount(newUserRes.data);

                const totalUserRes = await axiosInstance.get(`management/user/totalUser`);
                setTotalUserCount(totalUserRes.data);

                const searchCountRes = await axiosInstance.get(`management/search/allCount`);
                setTotalSearchCount(searchCountRes.data);

            } catch (err) {
                console.error(err);
            }
        };
        fetchData();
    }, []);

    return (
        <Row className={styles.topPartRow} xs={2} md={4}>
            <Col> <NewMembersCard count={newUserCount} /></Col>
            <Col><TotalMembersCard count={totalUserCount} /></Col>
            <Col><TodayAllSearchCard count={totalSearchCount} /></Col>
            <Col><MonthlyRevenueCard /></Col>
        </Row>
    );
};

const NewMembersCard = ({ count }) => (
    <Card border="primary" className={styles.managementCard}>
        <Card.Header>신규회원</Card.Header>
        <Card.Body className={styles.cardBodyContainer}>
            <Card.Title className={styles.managementCardTitle}>{count}</Card.Title>
            <FontAwesomeIcon icon={faUser} className={styles.managementCardIcon} />
        </Card.Body>
    </Card>
);

const TotalMembersCard = ({ count }) => (
    <Card border="primary" className={styles.managementCard}>
        <Card.Header>전체 회원</Card.Header>
        <Card.Body className={styles.cardBodyContainer}>
            <Card.Title className={styles.managementCardTitle}>{count}</Card.Title>
            <FontAwesomeIcon icon={faUserPlus} className={styles.managementCardIcon} />
        </Card.Body>
    </Card>
);

const TodayAllSearchCard = ({ count }) => (
    <Card border="primary" className={styles.managementCard}>
        <Card.Header>레시피 검색량</Card.Header>
        <Card.Body className={styles.cardBodyContainer}>
            <Card.Title className={styles.managementCardTitle}>{count}</Card.Title>
            <FontAwesomeIcon icon={faChartLine} className={styles.managementCardIcon} />
        </Card.Body>
    </Card>
);

const MonthlyRevenueCard = () => (
    <Card border="primary" className={styles.managementCard}>
        <Card.Header>GPT 월 누적 금액</Card.Header>
        <Card.Body className={styles.cardBodyContainer}>
            <Card.Title className={styles.managementCardTitle}>Primary Card Title</Card.Title>
            <FontAwesomeIcon icon={faDollarSign} className={styles.managementCardIcon} />
        </Card.Body>
    </Card>
);


export default DashboardTopCards
