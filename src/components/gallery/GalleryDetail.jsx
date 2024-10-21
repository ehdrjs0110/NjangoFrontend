import React, {useEffect, useState} from 'react';
import { Modal, Button, InputGroup,Form } from 'react-bootstrap';
import {useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useNavigate} from "react-router-dom";
import {axiosInstance} from "../../middleware/customAxios";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart } from '@fortawesome/free-regular-svg-icons';

import styles from '../../styles/Gallery/GalleryDetail.module.scss';

const GalleryDetail = ({ show, onHide, galleryId, onDeleteComplete, onLikeToggle }) => {
 
    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    const dispatch = useDispatch();
    // --
    const navigate = useNavigate();

    let userId = useSelector(state => state.userEmail.value);

    const [isData, setData] = useState(null);
    const [recipeShareId, setRecipeShareId] = useState('');
    const [isChange, setChange] = useState(false);
    const [isLike, setLike] = useState();
    const [isUserId, setUserId] = useState();
    const [isGalleryId, setGalleryId] = useState();
    const [isNickname, setNickname] = useState();
    const [isCreateAt, setCreateAt] = useState();
    const [isLikeCount, setLikeCount] = useState();
    const [isPhoto, setPhoto] = useState();
    
    useEffect(() => {

        const fetchData = async () => {
            try{
                await tokenHandler();
                const res = await axiosInstance.get(`gallery/detail/${galleryId}`);
                const storedData = res.data;
    
                if(storedData) {
                    console.log(storedData);
                    setData(storedData);
                    setRecipeShareId(storedData.recipeShareId);
                    setUserId(storedData.userId);
                    setPhoto(storedData.photo);
                    setCreateAt(storedData.createAt);
                    setLikeCount(storedData.likeCount);
                    setNickname(storedData.nickname);
                    setGalleryId(storedData.galleryId);
                }
            }catch(err){
                console.log("err message : " + err);                
            }
        }

        const fetchLike = async () => {
            try{
                if(userId){
                    await tokenHandler();
                    const res = await axiosInstance.get(`gallery/likeCheck/${userId}/${galleryId}`);
                    const storedData = res.data; 
                    console.log(storedData);       
                    if(storedData) {                        
                        setLike(true);
                    }else {
                        setLike(false);
                    }
                }                
            }catch(err){
                console.log("err message : " + err);                
            }

            
        }
          
        fetchData();
        fetchLike();
    
        }, [ isChange ,galleryId]);

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

    const handleHeart = async() => {
    
        try{
            await tokenHandler();
            await axiosInstance.post(`gallery/like/${userId}/${galleryId}`);
            
            // 현재 좋아요 상태를 반전
            const newLikeStatus = !isLike;
            setLike(newLikeStatus);  // local 상태 업데이트
            
            // 부모에게 상태 전달 (상태 변경 후)
            onLikeToggle(galleryId, newLikeStatus);
            
            // 변경된 값을 기반으로 렌더링 강제 (필요한 경우)
            setChange(!isChange);
            
        }catch(err){
            console.log("err message : " + err);                
        }
    }

    const deleteGallery = async () => {
        if (window.confirm("삭제하시겠습니까?")) {
            try{
                await tokenHandler();
                await axiosInstance.delete(`gallery/${galleryId}`);
                alert("삭제되었습니다.");
                onDeleteComplete(galleryId);
                handleClose(); // 모달 닫기 및 상태 초기화
            }catch(err){
                console.log("err message : " + err);                
            }
        }
    };

    // 모달 닫을 때 상태 초기화
    const handleClose = () => {
        setData(null);
        setRecipeShareId('');
        setLike(false);
        onHide(); // 모달 닫기
    };

    function formatDate(dateString) {
        const date = new Date(dateString);
        const now = new Date();

        // 연, 월, 일, 시, 분 추출
        const year = date.getFullYear();
        const month = date.getMonth() + 1; // getMonth()는 0부터 시작하므로 +1
        const day = date.getDate();
        const hours = String(date.getHours()).padStart(2, '0'); // 24시간 형식, 두 자리로 맞춤
        const minutes = String(date.getMinutes()).padStart(2, '0');

        // 현재 날짜와 비교
        const isToday = now.getFullYear() === year &&
            now.getMonth() === (month - 1) &&
            now.getDate() === day;

        // 오늘 날짜이면 시간만 반환 (24시간 형식)
        if (isToday) {
            return `${hours}:${minutes}`;
        }

        // 다른 날짜이면 MM/DD 형식으로 반환
        const formattedMonth = String(month).padStart(2, '0'); // 두 자리로 맞춤
        const formattedDay = String(day).padStart(2, '0');
        return `${formattedMonth}/${formattedDay}`;
    }

    if(isData!=null) { return (
        <Modal
            show={show} 
            onHide={handleClose}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                </Modal.Title>
                <div className={styles.title}>
                    <Form.Label>{isNickname} - {formatDate(isCreateAt)}</Form.Label>
                </div>
            </Modal.Header>
            <Modal.Body>
                <Form.Group controlId="formFile" className="mb-3">
                    <div className={styles.imgSection}>
                        <img src={`http://localhost:8080/uploads/${isPhoto}`} alt={isGalleryId} />
                </div>
            </Form.Group>
            </Modal.Body>
            <Modal.Footer className={styles.modalFooter}>
                {recipeShareId != null && (
                    <Button className={styles.showRecipeDetailBtn} onClick={() => navigate('/RecipeShareDetail', {state: {recipeShareId}})}>레시피
                        보러가기</Button>
                )}
                <Button className={isLike ? styles.iconButtonClicked : styles.iconButton}
                        variant="outline-secondary" onClick={handleHeart}>
                    <FontAwesomeIcon className={styles.icon} icon={faHeart}/>
                    {' ' + isLikeCount}
                </Button>
                {userId==isUserId && (
                    <Button onClick={deleteGallery} className={styles.deleteBtn} variant='danger'>삭제</Button>
                )}
            </Modal.Footer>
        </Modal>
    )}else {
        return null;
    }
}

export default GalleryDetail;