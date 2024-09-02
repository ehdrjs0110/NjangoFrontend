import { useState, useEffect, useRef } from 'react';
import style from "../../styles/Management/ManagementDashboard.module.scss";
import Card from "react-bootstrap/Card";
import { Stack } from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import RecipeShareListTable from "../../components/Management/Comunity/RecipeShareListTable";
import GalleryListTable from "../../components/Management/Comunity/GalleryListTable";
import TodaySearchListTable from "../../components/Management/Search/TodaySearchListTable";
import WordSearchListTable from "../../components/Management/Search/WordSearchListTable";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
const ManagementSearch = () => {
    const [current, setCurrent] = useState(0);
    const [isAnimating, setIsAnimating] = useState(false);
    const startX = useRef(0);
    const diff = useRef(0);
    const animationTimeoutRef = useRef(null);


    const cards = [{
        title: 'Today Search',
        component: <TodaySearchListTable />,
    }, {
        title: 'Word Search',
        component: <WordSearchListTable />,
    }];

    useEffect(() => {
        if (isAnimating) {
            animationTimeoutRef.current = setTimeout(() => {
                setIsAnimating(false);
            }, 500); // 애니메이션 지속 시간과 일치시킴
        }

        return () => {
            if (animationTimeoutRef.current) {
                clearTimeout(animationTimeoutRef.current);
            }
        };
    }, [isAnimating]);

    const handleMouseDown = (e) => {
        if (isAnimating) return; // 애니메이션 중에는 드래그를 무시
        startX.current = e.clientX;
    };

    const handleMouseMove = (e) => {
        if (isAnimating || startX.current === 0) return; // 애니메이션 중이거나 드래그 시작하지 않았을 때 무시
        diff.current = e.clientX - startX.current;
    };

    const handleMouseUp = () => {
        if (isAnimating || Math.abs(diff.current) <= 50) { // 애니메이션 중이거나 드래그 거리가 짧을 때 무시
            startX.current = 0;
            diff.current = 0;
            return;
        }

        if (diff.current > 0) {
            setCurrent((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
        } else {
            setCurrent((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
        }

        setIsAnimating(true);
        startX.current = 0;
        diff.current = 0;
    };

    const handlePrevClick = () => {
        if (isAnimating) return;
        setCurrent((prev) => (prev === 0 ? cards.length - 1 : prev - 1));
        setIsAnimating(true);
    };

    const handleNextClick = () => {
        if (isAnimating) return;
        setCurrent((prev) => (prev === cards.length - 1 ? 0 : prev + 1));
        setIsAnimating(true);
    };

    return (
        <div
            className={style.managementDashboardContainer}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
        >
            <Stack>
                <Row className={style.downPartRow} xs={1} md={1}>
                    <Col className={style.downPartCol}>
                        <Card
                            border="light"
                            className={isAnimating ? style.fadeIn : ''}
                        >
                            <Card.Title>
                                {cards[current].title}
                            </Card.Title>
                            <Card.Body className={style.cardBodyContainerForTable}>
                                <FaArrowLeft
                                    className={style.arrow}
                                    onClick={handlePrevClick}
                                />
                                <div className={style.cardContent}>
                                    {cards[current].component}
                                </div>
                                <FaArrowRight
                                    className={style.arrow}
                                    onClick={handleNextClick}
                                />
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Stack>
        </div>
    );
}

export default ManagementSearch;
