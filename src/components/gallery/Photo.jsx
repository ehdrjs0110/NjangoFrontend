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

import {useNavigate} from "react-router-dom";
import {axiosInstance} from "../../middleware/customAxios";

// auth 관련 --
import {useCookies} from "react-cookie";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useDispatch, useSelector} from "react-redux";
//--

import GalleryDetail from './GalleryDetail';

import styles from '../../styles/Gallery/Photo.module.scss';


const Photo = ({ isChangeUpload }) => {

    const navigate = useNavigate();

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // redux에서 가져오기
    let accessToken = useSelector(state => state.token.value);
    let userId = useSelector(state => state.userEmail.value);
    const dispatch = useDispatch();
    // --    

    //modal
    const [modalShow, setModalShow] = useState(false);
    
    const [isChange, setChange] = useState(false);
    const [isOpenDetail, setOpenDetail] = useState(null);
    const [images, setImages] = useState([]);
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

    useEffect(() => {

        const fetchData = async () => {
            try{
                await tokenHandler();
                const res = await axiosInstance.get("gallery");
                const storedData = res.data;
    
                if(storedData) {
                    
                    console.log(storedData);
                    setImages(storedData);
                }
            }catch(err){
                console.log("err message : " + err);                
            }
        }

        const fetchLike = async () => {
            try{
                if(userId){
                    await tokenHandler();
                    const res = await axiosInstance.get(`gallery/like/${userId}`);
                    const storedData = res.data;        
                    if(storedData) {                        
                        console.log(storedData);   
                        
                        // 상태를 한 번에 업데이트
                        const newLikes = storedData.reduce((acc, { galleryId }) => {
                            return {
                                ...acc,
                                [galleryId]: true,  // 좋아요가 있는 galleryId만 true로 설정
                            };
                        }, {});

                        setIsLike(prevState => ({
                            ...prevState,
                            ...newLikes  // 상태 한 번에 병합
                        }));                                                                                 
                    }
                }                
            }catch(err){
                console.log("err message : " + err);                
            }
        }
          
        fetchData();
        fetchLike();
    
        }, [isChangeUpload, isChange, userId]);

        async function tokenHandler() {

            const isExpired = expired();
            if(isExpired){
        
                let refreshToken = cookies.refreshToken;
                try {
        
                    // getNewToken 함수 호출 (비동기 함수이므로 await 사용)
                    const result = await getNewToken(refreshToken);
                    refreshToken = result.newRefreshToken;
        
                    // refresh token cookie에 재설정
                    setCookie(
                        'refreshToken',
                        refreshToken,
                        {
                            path:'/',
                            maxAge: 7 * 24 * 60 * 60, // 7일
                            // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                        }
                    )
        
                    // Redux access token 재설정
                    dispatch(containToken(result.newToken));
        
                } catch (error) {
                    console.log(error);
                    navigate('/Sign');
                }
            }
        }

    const handleHeart = async(id) => {
        setIsLike(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }))
        try{
            if(id){
                const galleryId = id;
                await tokenHandler();
                await axiosInstance.post(`gallery/like/${userId}/${galleryId}`);
                setChange(!isChange);
            }    
        }catch(err){
            console.log("err message : " + err);                
        }
    }


    // 이미지 데이터 로드 함수
    // const loadMoreImages = () => {
    //     setIsLoading(true);
    //     setTimeout(() => {
    //         const moreImages = [
    //             { id: images.length + 1, src: img1, alt: `img${images.length + 1}` },
    //             { id: images.length + 2, src: img2, alt: `img${images.length + 2}` },
    //         ];
    //         setImages(prevImages => [...prevImages, ...moreImages]);
    //         setIsLoading(false);
    //     }, 1000);
    // };

    // IntersectionObserver 설정
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading) {
                    setPage(prevPage => prevPage + 1);
                    //loadMoreImages();
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
                <div key={img.galleryId} className={styles['img-item']}>
                    <div className={styles.heartBox}>
                        <FontAwesomeIcon
                            icon={heartIcon}
                            onClick={() => handleHeart(img.galleryId)}
                            style={{cursor: 'pointer', color: isLike[img.galleryId] ? 'red' : 'white', stroke: 'black', strokeWidth: 30}}
                        />
                    </div>
                    <img src={`${process.env.PUBLIC_URL}/image/${img.photo}`} alt={img.galleryId} onClick={() => {setOpenDetail(img.galleryId); setModalShow(true);}} onDoubleClick={() => handleDoubleClick(img.galleryId)} />
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
            <GalleryDetail
                show={modalShow}
                onHide={() => {setModalShow(false); setChange(!isChange);}}
                galleryId={isOpenDetail}
                onDeleteComplete={() => setChange(prev => !prev)}
                onLikeToggle={(updatedGalleryId, isLiked) => {
                    setIsLike(prevState => ({
                        ...prevState,
                        [updatedGalleryId]: isLiked
                    }));
                }}
            />
        </div>
    );
}

export default Photo;
