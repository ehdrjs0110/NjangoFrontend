import Nav from 'react-bootstrap/Nav';
import managementCss from '../../styles/Management/ManagementNav.module.scss'
import React, { useState } from "react";
import Navbar from "react-bootstrap/Navbar";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import { NavItem, Offcanvas } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const ManagementNav = () => {
    const [show, setShow] = useState(false);

    const navigate = useNavigate();


    const Njaongo = () => {
        navigate('/main');
    };
    const Dashboard = () => {
        navigate('/Management/Dashboard');
    };
    const User = () => {
        navigate('/Management/User');
    };
    const Inquiry = () => {
        navigate('/Management/Inquiry');
    };
    const Comunity = () => {
        navigate('/Management/Comunity');
    };
    const Report = () => {
        navigate('/Management/Report');
    };

    const Search = () => {
        navigate('/Management/Search');
    };

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div>
            <div className={managementCss.sideMenu}>
                <button onClick={Njaongo}>Njango 바로가기</button>
                <button onClick={Dashboard}>Dashboard</button>
                <button onClick={User}>유저관리</button>
                <button onClick={Inquiry}>문의사항</button>
                <button onClick={Comunity}>커뮤니티 관리</button>
                <button onClick={Report}>신고 관리</button>
                <button onClick={Search}>prompt 검색 관리</button>
            </div>
        </div>
    );
}

export default ManagementNav;