import React, {useEffect, useState} from 'react';
import { Modal, Button, InputGroup,Form } from 'react-bootstrap';
import axios from "axios";
import {useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useNavigate} from "react-router-dom";
import {axiosInstanceFormData} from "../../middleware/customAxios";

const UpdateModel = ({ show, onHide, onUploadComplete }) => {

    const [selectedFile, setSelectedFile] = useState(null);
 
    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    const dispatch = useDispatch();
    // --
    const navigate = useNavigate();

    let userId = useSelector(state => state.userEmail.value);
    

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

      const handleSubmit = async() => {

        const formData = new FormData();
        if(selectedFile!=null){
            formData.append('file', selectedFile);

            try{
                await tokenHandler();
                await axiosInstanceFormData.post(`gallery/${userId}`, formData);
                alert("업로드 성공!");
                onUploadComplete(); 
                onHide(); // 모달 닫기
    
            } catch(err){
                console.log("err message : " + err);
            }
        }
      };

      // 파일 선택 핸들러
    const handleFileChange = (e) => {
        setSelectedFile(e.target.files[0]);
    };


    return (
        <Modal
            show={show} 
            onHide={onHide}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    음식 사진 업로드
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
            <Form.Group controlId="formFile" className="mb-3">
                <Form.Label>사진 선택</Form.Label>
                <Form.Control type="file" onChange={handleFileChange} />
            </Form.Group>
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={e=>handleSubmit(e)}>업로드</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UpdateModel;