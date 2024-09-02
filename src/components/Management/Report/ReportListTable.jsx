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

const UserListTable = () => {
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

    const handleDelete = async (reportId) => {
        await tokenHandler();
        console.log(`Delete reprot with ID: ${reportId}`);
        await axiosInstance.delete(`management/report/deleteReportByReportId/${reportId}`)
            .then(response => {
                console.log(response.data);
                setReloadTrigger(!reloadTrigger); // 삭제 후 reloadTrigger를 변경하여 데이터를 다시 로드
            })
            .catch(error => {
                console.error("There was an error deleting the report!", error);
            });
    };

    const columns = [
        { header: 'reportId' },
        { header: 'galleryReportId' },
        { header: 'recipeShareReportId' },
        { header: 'createAt' },
        { header: 'userId' },
        { header: 'reportType' },
        { header: 'reportContent' },
        { header: 'complete' },
        { header: 'actions' }
    ];

    const renderReportRow = (report, index) => {
        const rowClass = report.role === 'ADMIN' ? 'table-danger' : '';
        return (
            <tr key={index} className={rowClass}>
                <td>{report.reportId}</td>
                <td>{report.galleryReportId }</td>
                <td>{report.recipeShareReportId }</td>
                <td>{new Date(report.createAt).toLocaleString()}</td>
                <td>{report.userId}</td>
                <td>{report.reportType}</td>
                <td>{report.reportContent}</td>
                <td>{report.complete ? "TRUE" : "FALSE"}</td>
                <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(report.reportId)}>
                        delete
                    </Button>
                </td>
            </tr>
        );
    };

    return (
        <TableWithPagination
            apiEndpoint="management/report/getReportListbyIndex"
            searchApiEndpoint="management/report/getReportListbyIndexSearch"
            columns={columns}
            renderRow={renderReportRow}
            pageSize={5}
            reloadTrigger={reloadTrigger} // 트리거 상태 전달
        />
    );
};

export default UserListTable;
