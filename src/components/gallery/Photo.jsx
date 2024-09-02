import React, { useState, useEffect, useRef } from 'react';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';

import { useAccordionButton } from 'react-bootstrap/AccordionButton';
import Card from 'react-bootstrap/Card';
import {Accordion} from "react-bootstrap";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as heartIcon, faArrowUp as arrowUpIcon } from '@fortawesome/free-solid-svg-icons';
import { useQueryClient } from '@tanstack/react-query';

import styles from './Grid.module.scss';

import img1 from './1.jpg';
import img2 from './2.jpg';
import img3 from './3.jpg';
import img4 from './4.jpg';
import img5 from './5.jpg';
import img6 from './6.jpg';
import img7 from './7.jpeg';
import img8 from './8.jpeg';
import img9 from './9.jpg';
import img10 from './10.jpg';


const Photo = () => {

    const initialImages = [
        { id: 1, src: img1, alt: 'img1' },
        { id: 2, src: img2, alt: 'img2' },
        { id: 3, src: img3, alt: 'img3' },
        { id: 4, src: img4, alt: 'img4' },
        { id: 5, src: img5, alt: 'img5' },
        { id: 6, src: img6, alt: 'img6' },
        { id: 7, src: img7, alt: 'img7' },
        { id: 8, src: img8, alt: 'img8' },
        { id: 9, src: img9, alt: 'img9' },
        { id: 10, src: img10, alt: 'img10' },
    ];

    const [images, setImages] = useState(initialImages);
    const [isLike, setIsLike] = useState({});
    const [page, setPage] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const loader = useRef(null);
    const scrollTopButton = useRef(null);

    // const ex = () => {
    //     console.log("어떤 이미지가 변경 요청이 들어왔ㅇ어 고쳐줘, 카운트 값도 다시 알려줘");
    //     // true, false 
    //     // 
    // }

    const handleHeart = (id) => {
        setIsLike(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }))

        // 클릭 이벤트 처리 (현재는 콘솔에 로그만 출력)
        console.log(`Photo ${id} liked: ${!isLike[id]}`);
    }

    // 이미지 데이터 로드 함수
    const loadMoreImages = () => {
        setIsLoading(true);
        setTimeout(() => {
            const moreImages = [
                { id: images.length + 1, src: img1, alt: `img${images.length + 1}` },
                { id: images.length + 2, src: img2, alt: `img${images.length + 2}` },
            ];
            setImages(prevImages => [...prevImages, ...moreImages]);
            setIsLoading(false);
        }, 1000);
    };

    // IntersectionObserver 설정
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading) {
                    setPage(prevPage => prevPage + 1);
                    loadMoreImages();
                }
            },
            {
                rootMargin: '100px',
            }
        );

        if (loader.current) {
            observer.observe(loader.current);
        }

        return () => {
            if (loader.current) {
                observer.unobserve(loader.current);
            }
        };
    }, [loader.current, isLoading]);

    const handleDoubleClick = (id) => {
        handleHeart(id);
    };

    const scrollToTop = () => {
        const scrollDuration = 500; // 애니메이션 기간 (ms)
        const scrollStep = 50; // 스크롤 단계 (픽셀)
        const scrollInterval = scrollDuration / (window.scrollY / scrollStep);
        let scrollTop = window.scrollY;
        
        const scroll = () => {
            if (scrollTop > 0) {
                window.scrollBy(0, -scrollStep);
                scrollTop -= scrollStep;
                setTimeout(scroll, scrollInterval);
            } else {
                window.scrollTo(0, 0); // 정확한 위치로 설정
            }
        };
        
        scroll();
    };

    return (
        <div className={styles['img-grid']}>
            {images.map((img) => (
                <div key={img.id} className={styles['img-item']}>
                    <div className={styles.heartBox}>
                        <FontAwesomeIcon
                            icon={heartIcon}
                            onClick={() => handleHeart(img.id)}
                            style={{cursor: 'pointer', color: isLike[img.id] ? 'red' : 'white', stroke: 'black', strokeWidth: 30}}
                        />
                    </div>
                    <img src={img.src} alt={img.alt} onDoubleClick={() => handleDoubleClick(img.id)} />
                </div>
            ))}
            <div ref={loader} style={{ height: '20px', backgroundColor: 'transparent' }}>
                {isLoading && <p>Loading more images...</p>}
            </div>
            <button
                ref={scrollTopButton}
                className={styles.scrollTopButton}
                onClick={scrollToTop}
                aria-label="Scroll to top"
            >
                <FontAwesomeIcon icon={arrowUpIcon} />
            </button>
        </div>
    );
}

export default Photo;
