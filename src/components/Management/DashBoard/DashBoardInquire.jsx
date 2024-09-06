import TableForDashBoard from "../../Table/TableForDashBoard";


const DashBoardInquire = () => {

    const columns = ['inquiryId', 'questioner', 'questionType','question'];

    return (
        <div>
            <TableForDashBoard columns={columns} url={"management/inquiry/getInquirySummeryList"} />
        </div>
    );
}

export default DashBoardInquire