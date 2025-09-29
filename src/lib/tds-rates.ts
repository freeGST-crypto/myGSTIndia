
export type TdsSection = {
    section: string;
    description: string;
    rate: number;
};

export const tdsSections: TdsSection[] = [
    { section: "192", description: "Salary", rate: 0 }, // Slab rates apply
    { section: "194A", description: "Interest other than on securities", rate: 10 },
    { section: "194C", description: "Payment to Contractors (Individual/HUF)", rate: 1 },
    { section: "194C", description: "Payment to Contractors (Others)", rate: 2 },
    { section: "194H", description: "Commission or Brokerage", rate: 5 },
    { section: "194I", description: "Rent - Plant & Machinery", rate: 2 },
    { section: "194I", description: "Rent - Land, Building, Furniture", rate: 10 },
    { section: "194J", description: "Fees for Professional or Technical Services", rate: 10 },
    { section: "194Q", description: "Purchase of goods", rate: 0.1 },
];

