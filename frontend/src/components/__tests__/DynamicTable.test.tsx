import { render, screen } from "@testing-library/react";
import { DynamicTable } from "../DynamicTable";

describe("DynamicTable Tests", () => {
  it("should render the table with no data", () => {
    const data: [] = [];
    // Render the component and check if it renders with no data:
    render(<DynamicTable data={data} />);
    expect(screen.queryByRole("table")).not.toBeInTheDocument();
  });

  it("Should render the table with data", () => {
    // Generate me a array of data that contains object with all types of data:
    const data = [
      {
        id: 1,
        name: "John Doe",
        email: "john.doe@example.com",
        phone: "123-456-7890",
        isActive: true,
        createdAt: new Date("2023-01-01"),
        updatedAt: new Date("2023-01-01"),
      },
      {
        id: 2,
        name: "Jane Smith",
        email: "jane.smith@example.com",
        phone: "987-654-3210",
        isActive: false,
        createdAt: new Date("2023-01-02"),
        updatedAt: new Date("2023-01-02"),
        test: undefined,
      },
    ];

    render(<DynamicTable data={data} />);
    expect(screen.getByRole("table")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("jane.smith@example.com")).toBeInTheDocument();
  });
});
