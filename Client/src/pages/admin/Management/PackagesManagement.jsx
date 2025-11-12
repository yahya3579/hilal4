
import articleCover from "../../../assets/articles-cover.jpg";
import ManagementTable from "../../../components/admin/ManagementTable";

const articles = [
    { id: 1, packageName: "Badar Babar", noOfMonths: "What have we given to....", cost: 8000, status: "Active" },
    { id: 2, packageName: "Badar Babar", noOfMonths: "What have we given to....", cost: 8000, status: "Active" },
    { id: 3, packageName: "Badar Babar", noOfMonths: "What have we given to....", cost: 8000, status: "Active" },
    { id: 4, packageName: "Badar Babar", noOfMonths: "What have we given to....", cost: 8000, status: "Active" },
    { id: 5, packageName: "Badar Babar", noOfMonths: "What have we given to....", cost: 8000, status: "Active" },
    // ...
];

const columns = [
    {
        key: "packageName",
        label: "Package Name",
        render: (value) => (
            <span className="font-medium text-[12.7px] font-poppins">{value}</span>
        ),
    },
    {
        key: "noOfMonths",
        label: "No ofMonths",
        render: (value) => (
            <span className="font-medium text-[12.7px] font-poppins">{value}</span>
        ),
    },
    {
        key: "cost",
        label: "Cost",
        render: (value) => (
            <span className="font-medium text-[12.7px] font-poppins">{value}</span>
        ),
    },
    {
        key: "status",
        label: "Status",
        render: (value) => (
            <button className="bg-[#31AB5A] text-white px-4 py-1 rounded text-[10.89px] font-bold">
                {value}
            </button>
        ),
    },
    {
        key: "actions",
        label: "Actions",
        render: () => (
            <select className="border border-gray-300 rounded px-3 py-1 text-sm bg-white text-[10.89px] font-poppins">
                <option value="preview">Preview</option>
                <option value="edit">Edit</option>
                <option value="delete">Delete</option>
            </select>
        ),
    },

];

const PackagesManagement = () => {
    return (
        <ManagementTable
            title="Subscription Package  management"
            data={articles}
            columns={columns}
            onAddNew={() => console.log("Add new article")}
        />
    )
}

export default PackagesManagement