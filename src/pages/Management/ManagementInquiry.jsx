import style from "../../styles/Management/ManagementDashboard.module.scss"
import Card from "react-bootstrap/Card";
import { Stack } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import InquiryListTable from "../../components/Management/Inquiry/InquiryListTable";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

const ManagementInquiry = () => {
    // refresh token 가져오기
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

    // redux에서 가져오기
    const dispatch = useDispatch();
    const navigate = useNavigate();
    return (
        <div className={style.managementDashboardContainer} >
            <Stack >
                <Row className={style.downPartRow} xs={1} md={1}>
                    <Col className={style.downPartCol}>
                        <Card border="light">
                            <Card.Title>
                                문의사항
                            </Card.Title>
                            <Card.Body>
                                <InquiryListTable />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Stack>
        </div>
    );
}

export default ManagementInquiry;