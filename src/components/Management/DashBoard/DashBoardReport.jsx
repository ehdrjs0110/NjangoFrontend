import TableForDashBoard from "../../Table/TableForDashBoard";


const DashBoardReport = () => {

    const columns = ['reportId', 'userId', 'reportId','reportContent'];

    return (
        <div>
            <TableForDashBoard columns={columns} url={"management/report/getReportSummeryList"} />
        </div>
    );
}

export default DashBoardReport