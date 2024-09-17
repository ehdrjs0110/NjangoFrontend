import React, {useEffect, useState} from 'react';
import { Modal, Button, InputGroup,Form } from 'react-bootstrap';
import axios from "axios";
import {useCookies} from "react-cookie";
import {useDispatch, useSelector} from "react-redux";
import {expired, getNewToken} from "../../services/auth2";
import {containToken} from "../../Store/tokenSlice";
import {useNavigate} from "react-router-dom";
import {axiosInstance} from "../../middleware/customAxios";

const UpdateModel = (props) => {

    const [recipeId, setSelectedOption] = useState('');
    const [recipe, setRecipe] = useState(null);
    const [isChange, setChange] = useState(false);
 

    // auth 관련 --
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    const dispatch = useDispatch();
    // --
    const navigate = useNavigate();

    let userId = useSelector(state => state.userEmail.value);

    useEffect(() => {

        const fetchData = async () => {
        
            try{
                await tokenHandler();
                const res = await axiosInstance.get(`recipe/user/${userId}`);
                const storedRecipe = res.data;
                console.log(storedRecipe);
    
                if(storedRecipe) {    
                    setRecipe(storedRecipe);
                }
        
            }catch(err){
                console.log("err message : " + err);
                setChange(!isChange);
            }
        }
          
        fetchData();
    
        }, [isChange]);
    

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

    const handleRadioChange = (event) => {
        setSelectedOption(event.target.value);
      };

      const handleSubmit = (event) => {
        event.preventDefault();
        navigate('/editRecipe', {state : {recipeId}} )
      };

      function recipeList()
      {
          if (recipe != null)
          {
              return recipe.map((recipe, index) => (
                <Form.Check
                    type="radio"
                    label={JSON.stringify(recipe.title).replace(/\"/gi, "")}
                    name="options"
                    value={JSON.stringify(recipe.recipeId).replace(/\"/gi, "")}
                    checked={recipeId === JSON.stringify(recipe.recipeId).replace(/\"/gi, "")}
                    onChange={handleRadioChange}
                />
             ));
          }
          return null;
      }

    return (
        <Modal
            {...props}
            size="lg"
            aria-labelledby="contained-modal-title-vcenter"
            centered
        >
            <Modal.Header closeButton>
                <Modal.Title id="contained-modal-title-vcenter">
                    레시피 선택
                </Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Label htmlFor="inputPassword5">내 레시피 목록</Form.Label>
                    {recipeList()}      
            </Modal.Body>
            <Modal.Footer>
                <Button onClick={e=>handleSubmit(e)}>사용</Button>
            </Modal.Footer>
        </Modal>
    );
}

export default UpdateModel;