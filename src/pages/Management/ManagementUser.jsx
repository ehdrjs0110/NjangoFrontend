import { useState } from "react";
import style from "../../styles/Management/ManagementDashboard.module.scss";
import { Stack, ButtonGroup, Button } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import UserListTable from "../../components/Management/User/UserListTable";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

const ManagementUser = () => {
    const [currentType, setCurrentType] = useState("all");

    return (
        <div className={style.managementDashboardContainer}>
            <Stack>
                <ButtonGroup className="mb-3">
                    <Button 
                        variant={currentType === "all" ? "primary" : "secondary"} 
                        onClick={() => setCurrentType("all")}
                    >
                        ALL
                    </Button>
                    <Button 
                        variant={currentType === "user" ? "primary" : "secondary"} 
                        onClick={() => setCurrentType("user")}
                    >
                        USER
                    </Button>
                    <Button 
                        variant={currentType === "admin" ? "primary" : "secondary"} 
                        onClick={() => setCurrentType("admin")}
                    >
                        ADMIN
                    </Button>
                </ButtonGroup>
                <Row className={style.downPartRow}>
                    <Col>
                        <UserListTable type={currentType} />
                    </Col>
                </Row>
            </Stack>
        </div>
    );
};

export default ManagementUser;
