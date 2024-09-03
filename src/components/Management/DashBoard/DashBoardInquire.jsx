import TableForDashBoard from "../../Table/TableForDashBoard";


const DashBoardInquire = () => {

    // {inquiryId: 10, questioner: 'test1@naver.com', questionType: '상품', question: '상품을 더 추가할 수 있나요?'}
    const columns = ['inquiryId', 'questioner', 'questionType','question'];

    return (
        <div>
            <TableForDashBoard columns={columns} url={"management/inquiry/getInquirySummeryList"} />
        </div>
    );
}

export default DashBoardInquire