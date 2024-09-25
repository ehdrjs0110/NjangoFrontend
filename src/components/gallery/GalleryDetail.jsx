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
    const [isChange, setChange] = useState(false);
    const [isLike, setIsLike] = useState();
    
    useEffect(() => {

        const fetchData = async () => {
            try{
                await tokenHandler();
                const res = await axiosInstance.get(`gallery/detail/${galleryId}`);
                const storedData = res.data;
    
                if(storedData) {
                    console.log(storedData);
                    setData(storedData);
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
                        setIsLike(true);
                    }else {
                        setIsLike(false);
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
            setIsLike(newLikeStatus);  // local 상태 업데이트
            
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
                onDeleteComplete();
                onHide();
            }catch(err){
                console.log("err message : " + err);                
            }
        }
    };

    if(isData!=null) { return (
        <Modal
            show={show} 
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    
                </Modal.Title>
                <Form.Label>{isData.nickname}</Form.Label>
                <Form.Label>{isData.createAt}</Form.Label>
            </Modal.Header>
            <Modal.Body>
            <Form.Group controlId="formFile" className="mb-3">
                <div className={styles.likeBtn}>
                    <Button className={isLike?styles.iconButtonClicked:styles.iconButton} onClick={handleHeart}>
                        <FontAwesomeIcon className={styles.icon} icon={faHeart} />
                        {' ' + isData.likeCount}
                    </Button>
                </div>
                {isData.recipeShareId !=null && (
                    <Button onClick={navigate('/RecipeShareDetail', { state: isData.recipeShareId })}>레시피 보러가기</Button>
                )}
                <div className={styles.imgSection}>
                    <img src={`${process.env.PUBLIC_URL}/image/${isData.photo}`} alt={isData.galleryId} />
                </div>
                
            </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                {userId==isData.userId && (
                    <Button onClick={deleteGallery}>삭제</Button>
                )}
            </Modal.Footer>
        </Modal>
    )}else {
        return null;
    }
}

export default GalleryDetail;