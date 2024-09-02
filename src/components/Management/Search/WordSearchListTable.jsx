import Button from "react-bootstrap/Button";
import TableWithPagination from "../../Table/TableWithPagination";
import {useCookies} from "react-cookie";
import {useDispatch} from "react-redux";
import {useNavigate} from "react-router-dom";
import {expired, getNewToken} from "../../../services/auth2";
import {containToken} from "../../../Store/tokenSlice";
import {containIsAdmin} from "../../../Store/isAdminSlice";
import {axiosInstance} from "../../../middleware/customAxios";
import {useState} from "react";

const WordSearchListTable = () => {
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

    const handleDelete = async (searchId) => {
        await tokenHandler();
        await axiosInstance.delete(`word/deleteBySearchId/${searchId}`)
            .then(response => {
                console.log(response)
                setReloadTrigger(!reloadTrigger); // 삭제 후 reloadTrigger를 변경하여 데이터를 다시 로드
            })
            .catch(error => {
                console.error(error);
                setReloadTrigger(!reloadTrigger);
            });

    };

    const columns = [
        { header: 'Search Id' },
        { header: 'User Id ' },
        { header: 'Nickname ' },
        { header: 'Search Word' },
        { header: 'Create At' },
        { header: 'actions' },
    ];

    const renderWordSearchRow = (wordSearch, index) => {
        return (
            <tr key={index}>
                <td>{wordSearch.searchId}</td>
                <td>{wordSearch.userId }</td>
                <td>{wordSearch.nickName }</td>
                <td>{wordSearch.searchWord}</td>
                <td>{new Date(wordSearch.createAt).toLocaleString()}</td>


                <td>
                    <Button variant="danger" size="sm" onClick={() => handleDelete(wordSearch.searchId)}>
                        delete
                    </Button>
                </td>
            </tr>
        );
    };

    return (
        <TableWithPagination
            apiEndpoint="management/search/getWordSearchListbyIndex"
            columns={columns}
            renderRow={renderWordSearchRow}
            pageSize={5}
        />
    );
};

export default WordSearchListTable;
