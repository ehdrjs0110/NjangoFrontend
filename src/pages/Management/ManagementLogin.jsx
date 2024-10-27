import { useState } from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import InputGroup from "react-bootstrap/InputGroup";
import Form from 'react-bootstrap/Form';
import axios from "axios";
import {containToken} from "../../Store/tokenSlice";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {containIsAdmin} from "../../Store/isAdminSlice";
const ManagementLogin = () => {
    const navigate = useNavigate();
    const [id,setId] = useState(null);
    const [pw,setPw] = useState(null);
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);
    // redux 함수
    const dispatch = useDispatch();

    const idChangeHandler = (event) => {
        const {value} = event.target;
        setId(value);
    }

    const pwChangeHandler = (event) => {
        const {value} = event.target;
        setPw(value);
    }


    async function requestLogin () {
        // console.log("longin" );
        const loginEntity = {"email" : id , "password" : pw};
        try{
            let accessToken;
            let refreshToken;
            const response = await axios.post("/njango/api/v1/auth/authenticate/admin",loginEntity,{
                headers: {
                    "Content-type": "multipart/form-data",
                },
            })

            accessToken = response.data.accessToken;
            refreshToken = response.data.refreshToken;

            refreshToken = JSON.stringify(refreshToken);
            dispatch(containToken(accessToken));
            setCookie(
                'refreshToken',
                refreshToken,
                {
                    path:'/',
                    maxAge: 7 * 24 * 60 * 60, // 7일
                    // expires:new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000)
                }
            )

            dispatch(containIsAdmin(true));

            await navigate('/management/dashboard');


        }catch (e) {
            console.log("login fail")
            console.error(e);
            alert("허가된 사용자가 아닙니다.");
        }


    }


    return (

        <Alert variant="primary">
            <InputGroup className="mb-3">
                <InputGroup.Text  id="basic-addon1">ID</InputGroup.Text>
                <Form.Control
                    placeholder="ID"
                    aria-label="ID"
                    onChange={idChangeHandler}
                />
            </InputGroup>
            <InputGroup className="mb-3">
                <InputGroup.Text id="basic-addon1">PW</InputGroup.Text>
                <Form.Control
                    placeholder="PW"
                    aria-label="PW"
                    onChange={pwChangeHandler}
                />
            </InputGroup>
            <hr />
            <Button variant="outline-primary" onClick={requestLogin}>LOGIN</Button>
        </Alert>
    );
}

export default ManagementLogin;