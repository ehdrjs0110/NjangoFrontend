import style from "../../styles/Management/ManagementDashboard.module.scss";
import Card from "react-bootstrap/Card";
import { Stack } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import ReportListTalbe from '../../components/Management/Report/ReportListTable'
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

const ManagementReport = () => {
    return (
        <div className={style.managementDashboardContainer} >
            <Stack >
                <Row className={style.downPartRow} xs={1} md={1}>
                    <Col className={style.downPartCol}>
                        <Card border="light">
                            <Card.Title>
                                신고 관리
                            </Card.Title>
                            <Card.Body>
                                <ReportListTalbe/>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Stack>
        </div>
    );
}

export default ManagementReport;
