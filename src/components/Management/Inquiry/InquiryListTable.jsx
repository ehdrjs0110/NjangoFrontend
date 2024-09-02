import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import TableWithPagination from "../../Table/TableWithPagination";
import { axiosInstance } from "../../../middleware/customAxios";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {expired, getNewToken} from "../../../services/auth2";
import {containToken} from "../../../Store/tokenSlice";
import {containIsAdmin} from "../../../Store/isAdminSlice";

const InquiryListTable = () => {
    const [reloadTrigger, setReloadTrigger] = useState(false); // 데이터를 다시 로드하기 위한 트리거 상태

    // refresh token 가져오기
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

    // redux에서 가져오기
    const dispatch = useDispatch();
    const navigate = useNavigate();

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
                dispatch(containIsAdmin(true));

            } catch (error) {
                console.log(error);
                navigate('/Management');
            }
        }

    }

    const handleDelete = async (inquiryId) => {
        await tokenHandler();
        console.log(`Delete inquiry with ID: ${inquiryId}`);
        await axiosInstance.delete(`management/inquiry/deleteInquiryByInquiryId/${inquiryId}`)
            .then(response => {
                console.log(response.data);
                setReloadTrigger(!reloadTrigger); // 삭제 후 reloadTrigger를 변경하여 데이터를 다시 로드
            })
            .catch(error => {
                console.error("There was an error deleting the inquiry!", error);
            });
    };


    const columns = [
        { header: 'inquiryId' },
        { header: 'questioner' },
        { header: 'responder' },
        { header: 'questionType' },
        { header: 'question' },
        { header: 'answer' },
        { header: 'createAt' },
        { header: 'actions' }
    ];

    const renderInquiryRow = (inquiry, index) => {
        // const rowClass = inquiry.role === 'ADMIN' ? 'table-danger' : '';
        const rowClass = "";

        return (
            <tr key={index} className={rowClass}>
                <td>{inquiry.inquiryId}</td>
                <td>{inquiry.questioner}</td>
                <td>{inquiry.responder}</td>
                <td>{inquiry.questionType}</td>
                <td>{inquiry.question}</td>
                <td>{inquiry.answer}</td>
                <td>{new Date(inquiry.createAt).toLocaleString()}</td>
                <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(inquiry.inquiryId)}>
                        delete
                    </Button>
                </td>
            </tr>
        );
    };

    return (
        <TableWithPagination
            apiEndpoint="management/inquiry/getInquiryListbyIndex"
            searchApiEndpoint="management/inquiry/getInquiryListbyIndexSearch"
            columns={columns}
            renderRow={renderInquiryRow}
            pageSize={5}
            reloadTrigger={reloadTrigger} // 트리거 상태 전달
        />
    );
};

export default InquiryListTable;
