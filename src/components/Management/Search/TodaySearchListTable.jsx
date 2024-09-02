import Button from "react-bootstrap/Button";
import TableWithPagination from "../../Table/TableWithPagination";
import {useState} from "react";
import {axiosInstance} from "../../../middleware/customAxios";
import {expired, getNewToken} from "../../../services/auth2";
import {containToken} from "../../../Store/tokenSlice";
import {containIsAdmin} from "../../../Store/isAdminSlice";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";

const TodaySearchListTable = () => {
    const [reloadTrigger, setReloadTrigger] = useState(false); // 데이터를 다시 로드하기 위한 트리거 상태

    // refresh token 가져오기
    const [cookies, setCookie, removeCookie] = useCookies(['refreshToken']);

    // redux에서 가져오기
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const handleReport = (todaySearchId) => {
        console.log(`Edit reprot with ID: ${todaySearchId}`);
    };

    const columns = [
        { header: 'daySearchId' },
        { header: 'userId' },
        { header: 'Nickname' },
        { header: 'count' },
        { header: 'actions' },
    ];


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

    const handleDelete = async (daySearchId) => {
        await tokenHandler();
        // console.log(daySearchId);
        await axiosInstance.delete(`management/search/deleteBySearchId/${daySearchId}`)
            .then(response => {
                console.log(response)
                setReloadTrigger(!reloadTrigger); // 삭제 후 reloadTrigger를 변경하여 데이터를 다시 로드
            })
            .catch(error => {
                console.error(error);
                setReloadTrigger(!reloadTrigger);
            });
    };
    const renderTodaySearchRow = (todaySearch, index) => {
        // const rowClass = todaySearch.role === 'ADMIN' ? 'table-danger' : '';
        const rowClass = "";
        return (
            <tr key={index} className={rowClass}>
                <td>{todaySearch.daySearchId}</td>
                <td>{todaySearch.userId }</td>
                <td>{todaySearch.nickName }</td>
                <td>{todaySearch.count}</td>
                <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(todaySearch.daySearchId)}>
                        delete
                    </Button>
                </td>
            </tr>
        );
    };

    return (
        <TableWithPagination
            apiEndpoint="management/search/getTodaySearchListbyIndex"
            searchApiEndpoint="management/search/getTodaySearchListbyIndex"
            columns={columns}
            renderRow={renderTodaySearchRow}
            pageSize={5}
            reloadTrigger={reloadTrigger}
        />
    );
};

export default TodaySearchListTable;
