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
import {useSingleAndDoubleClick} from "../../hooks/Gallery/useSingleAndDoubleClick";

import GalleryDetail from './GalleryDetail';

import styles from '../../styles/Gallery/Photo.module.scss';


const Photo = ({ handleModalShow, isChangeUpload }) => {

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
    const [isLast, setIsLast] = useState(false);

    useEffect(() => {
        const reloadImages = () => {
            window.location.reload();
        };
    
        if (isChangeUpload) {
            reloadImages(); // isChangeUpload가 true일 때만 실행하여 리스트 초기화 후 데이터 다시 불러옴
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
    const loadMoreImages = () => {
        setIsLoading(true);
        setTimeout(async () => {
            
            try{
                await tokenHandler();
                const res = await axiosInstance.get(`gallery/${page}`);
                const moreImages = res.data.content;
                setIsLast(res.data.last);
    
                if(moreImages) {
                    console.log(moreImages);
                    setImages(prevImages => [...prevImages, ...moreImages]);
                }
            }catch(err){
                console.log("err message : " + err);                
            }

            setIsLoading(false);
        }, 1000);
    };

    // IntersectionObserver 설정
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !isLoading && !isLast) {
                    setPage(prevPage => prevPage + 1);
                    loadMoreImages();
                    console.log(page);
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
        const start = window.scrollY; // 시작 위치
        const startTime = performance.now(); // 애니메이션 시작 시간
    
        const scroll = (currentTime) => {
            // 경과 시간을 계산
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / scrollDuration, 1); // 0에서 1로 변화
    
            // 현재 스크롤 위치 계산 (ease-out 효과)
            const scrollTop = start * (1 - progress);
            window.scrollTo(0, scrollTop); // 스크롤 이동
    
            if (progress < 1) {
                requestAnimationFrame(scroll); // 애니메이션 계속
            }
        };
    
        requestAnimationFrame(scroll); // 애니메이션 시작
    };

    //Single And Double Click Event
    const click = useSingleAndDoubleClick(() => setModalShow(true), () => handleDoubleClick(isOpenDetail), 300);

    const handleImageDelete = (deletedGalleryId) => {
        setImages(prevImages => prevImages.filter(img => img.galleryId !== deletedGalleryId));
    };

    return (
        <>
            <div className={styles['img-grid']}>
                <div key={'add-photo'} className={styles['img-item']}>
                    <img src={`/image/add-item.png`} onClick={() => {
                        handleModalShow();
                    }}/>
                </div>
                {images.map((img) => (
                    <div key={img.galleryId} className={styles['img-item']}>
                        <div className={styles.heartBox}>
                            <FontAwesomeIcon
                                icon={heartIcon}
                                onClick={() => handleHeart(img.galleryId)}
                                style={{
                                    cursor: 'pointer',
                                    color: isLike[img.galleryId] ? 'red' : 'white',
                                    stroke: 'black',
                                    strokeWidth: 30
                                }}
                            />
                        </div>
                        <img src={`${process.env.PUBLIC_URL}/image/${img.photo}`} alt={img.galleryId} onClick={() => {
                            setOpenDetail(img.galleryId);
                            click()
                        }}/>
                    </div>
                ))}
                <button
                    ref={scrollTopButton}
                    className={styles.scrollTopButton}
                    onClick={scrollToTop}
                    aria-label="Scroll to top"
                >
                    <FontAwesomeIcon icon={arrowUpIcon}/>
                </button>
                <GalleryDetail
                    show={modalShow}
                    onHide={() => {
                        setModalShow(false);
                        setChange(!isChange);
                        setOpenDetail(null)
                    }}
                    galleryId={isOpenDetail}
                    onDeleteComplete={(deletedGalleryId) => {
                        handleImageDelete(deletedGalleryId); // 삭제된 이미지를 리스트에서 제거
                        setChange(prev => !prev); // 필요하면 변경 상태도 갱신
                    }}
                    onLikeToggle={(updatedGalleryId, isLiked) => {
                        setIsLike(prevState => ({
                            ...prevState,
                            [updatedGalleryId]: isLiked
                        }));
                    }}
                />
            </div>
            <div ref={loader} className={`${styles.spinnerContainer} ${isLast ? styles.none : ""}`}>
                {isLoading && (
                    // <div className={styles.spinner}></div> // 로딩 스피너 적용
                    <div className={styles.spinner}>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                        <div className={styles.dot}></div>
                    </div>
                )}
            </div>
        </>
    );
}

export default Photo;
