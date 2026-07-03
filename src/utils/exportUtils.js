import * as XLSX from "xlsx";

export const exportToExcel = (data, filename = "export") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.xlsx`);
};

export const exportToCSV = (data, filename = "export") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
  XLSX.writeFile(workbook, `${filename}.csv`, { bookType: "csv" });
};

export const downloadTemplate = () => {
  const templateData = [
    {
      "Full Name": "Ali Raza",
      "Father Name": "Mian Ali",
      "Father Phone": "03001234567",
      Campus: "boys",
      Class: "Class 1",
      Section: "A",
      Gender: "M",
      DOB: "2015-01-15",
      "Blood Group": "A+",
      "B-Form/CNIC": "35201-1234567-1",
      Email: "ali@example.com",
      Address: "Pattoki City",
      "Monthly Fee": 2000,
      Notes: "Notes go here",
    },
  ];
  exportToExcel(templateData, "MMHS_Import_Template");
};
