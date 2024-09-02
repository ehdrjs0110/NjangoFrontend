import style from "../../styles/Management/ManagementDashboard.module.scss"
import Card from "react-bootstrap/Card";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faChartBar,
    faChartLine,
    faCoins, faCreditCard, faDollarSign,
    faMoneyBill,
    faSearch,
    faUser,
    faUserPlus, faWallet
} from "@fortawesome/free-solid-svg-icons";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Chart from 'chart.js/auto';
import {useEffect, useRef} from "react";
import {Stack} from "react-bootstrap";
// import { NewMembersCard, TotalMembersCard, TodayAllSearchCard, MonthlyRevenueCard } from "../../components/Management/DashBoard/DashBoardTopCards";
import DashboardTopCards from "../../components/Management/DashBoard/DashBoardTopCards";
import Visit from "../../components/Management/DashBoard/DashBoardVisit";
import DaySearch from "../../components/Management/DashBoard/DashBoardDaySearch";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
const ManagementDashboard = () => {

    return(
        <div className={style.managementDashboardContainer} >
            <Stack >
                {/* bashboard - 위쪽 파트 :전체 회원, 신규 회원, 레시피 검색량, gpt 월 주적 금액*/}
                {/*<Row className={style.topPartRow} xs={2} md={4}>*/}
                    {/*<Col><NewMembersCard /></Col>*/}
                    {/*<Col><TotalMembersCard /></Col>*/}
                    {/*<Col><TodayAllSearchCard /></Col>*/}
                    {/*<Col><MonthlyRevenueCard /></Col>*/}
                    {/*<DashboardTopCards/>*/}

                {/*</Row>*/}
                <DashboardTopCards/>

                {/*dashboard 위쪽 파트를 제외한 나머지 : 주간 방문자, 미정, 회원 별 검색량, 신고*/}
                <Row className={style.downPartRow} xs={1} md={2}>
                    <Col className={style.downPartCol}>
                        <Visit/>
                    </Col>
                    <Col className={style.downPartCol}>
                        <Card border="light">
                            <Card.Title>
                                미정
                            </Card.Title>
                            <Card.Body>

                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className={style.downPartCol}>
                        <Card border="light">
                            <Card.Title>
                               <DaySearch/>
                            </Card.Title>
                            <Card.Body>

                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className={style.downPartCol}>
                        <Card border="light">
                            <Card.Title>
                               신고 내역
                            </Card.Title>
                            <Card.Body>

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Stack>
        </div>


    )
}

export default ManagementDashboard;