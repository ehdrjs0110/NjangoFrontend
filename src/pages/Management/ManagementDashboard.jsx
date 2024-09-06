import style from "../../styles/Management/ManagementDashboard.module.scss"
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {Stack} from "react-bootstrap";
import DashboardTopCards from "../../components/Management/DashBoard/DashBoardTopCards";
import Visit from "../../components/Management/DashBoard/DashBoardVisit";
import DaySearch from "../../components/Management/DashBoard/DashBoardDaySearch";
import DashBoardInquire from "../../components/Management/DashBoard/DashBoardInquire";
import DashBoardReport from "../../components/Management/DashBoard/DashBoardReport";

const ManagementDashboard = () => {

    return(
        <div className={style.managementDashboardContainer} >
            <Stack >
                <DashboardTopCards/>
                {/*dashboard 위쪽 파트를 제외한 나머지 : 주간 방문자, 문의, 회원 별 검색량, 신고*/}
                <Row className={style.downPartRow} xs={1} md={2}>
                    <Col className={style.downPartCol}>
                        <Visit/>
                    </Col>
                    <Col className={style.downPartCol}>
                        <Card border="light">

                            <Card.Title>
                                최근 문의
                            </Card.Title>
                            <Card.Body>
                                <DashBoardInquire/>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col className={style.downPartCol}>
                        <Card border="light">
                            <Card.Title>
                                TODAY 검색 상위 TOP 5
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
                                <DashBoardReport/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Stack>
        </div>


    )
}

export default ManagementDashboard;