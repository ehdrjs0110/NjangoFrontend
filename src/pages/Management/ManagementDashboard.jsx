import style from "../../styles/Management/ManagementDashboard.module.scss"
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {Stack} from "react-bootstrap";
import DashboardTopCards from "../../components/Management/DashBoard/DashBoardTopCards";
import Visit from "../../components/Management/DashBoard/DashBoardVisit";
import DaySearch from "../../components/Management/DashBoard/DashBoardDaySearch";
import DashBoardInquire from "../../components/Management/DashBoard/DashBoardInquire";

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
                            <DashBoardInquire/>
                            {/*<Card.Title>*/}
                            {/*    미정*/}
                            {/*</Card.Title>*/}
                            {/*<Card.Body>*/}

                            {/*</Card.Body>*/}
                        </Card>
                    </Col>
                    <Col className={style.downPartCol}>
                        <Card border="light">
                            <Card.Title>

                            </Card.Title>
                            <Card.Body>
                                <DaySearch/>
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