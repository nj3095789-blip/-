from fpdf import FPDF

class BankStatement(FPDF):
    def __init__(self, country):
        super().__init__(orientation='P', unit='mm', format='A4')
        self.country = country
        self.set_auto_page_break(auto=True, margin=15)

    def header(self):
        self.set_font('Helvetica', 'B', 14)
        self.cell(0, 8, 'BLOM BANK SAL', ln=False)
        self.set_font('Helvetica', '', 8)
        info = [
            'Capital L.L. 3,000,000,000,000',
            'R.C.B: 24783 - List of Banks: 14',
            'Head Office: Beirut, Lebanon',
            f'Date of issue: 16/05/2026'
        ]
        x_right = 210 - 15
        y_start = self.get_y()
        for i, line in enumerate(info):
            w = self.get_string_width(line)
            self.set_xy(x_right - w, y_start + i * 4.5)
            self.cell(w, 4, line)
        self.ln(22)
        self.set_font('Helvetica', 'B', 16)
        self.cell(0, 10, 'STATEMENT OF ACCOUNT', align='C', ln=True)
        self.ln(3)

    def footer(self):
        self.set_y(-25)
        self.set_font('Helvetica', 'I', 8)
        self.cell(0, 5, 'Except Errors or Omissions', ln=True)
        self.set_font('Helvetica', '', 7.5)
        self.set_text_color(80, 80, 80)
        self.multi_cell(0, 4,
            'This statement will be considered confirmed unless you notify the bank within fifteen days from delivery.\n'
            'For any claims or inquiries, please contact the call center on the following number: (961-1) 758000',
            align='C')
        self.set_text_color(0, 0, 0)
        self.set_y(-8)
        self.set_font('Helvetica', '', 8)
        self.cell(0, 5, f'Page {self.page_no()}', align='C')


def generate(filename, data):
    pdf = BankStatement(data['country'])
    pdf.add_page()

    # Account info block
    pdf.set_font('Helvetica', '', 9)
    fields = [
        ('Name:', data['name'], 'Account Number:', data['account_number']),
        ('Period:', data['period'], 'Currency:', data['currency']),
        ('Branch:', data['branch'], 'IBAN:', data['iban']),
    ]
    for row in fields:
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(22, 6, row[0])
        pdf.set_font('Helvetica', '', 9)
        pdf.cell(68, 6, row[1])
        pdf.set_font('Helvetica', 'B', 9)
        pdf.cell(30, 6, row[2])
        pdf.set_font('Helvetica', '', 9)
        pdf.cell(0, 6, row[3], ln=True)

    pdf.ln(4)

    # Table header
    col_w = [28, 72, 28, 28, 28]
    headers = ['Date', 'Description', 'Document', 'Transaction', 'Balance']
    pdf.set_fill_color(220, 220, 220)
    pdf.set_font('Helvetica', 'B', 8.5)
    pdf.set_draw_color(150, 150, 150)
    for i, h in enumerate(headers):
        align = 'L' if i < 2 else 'R'
        pdf.cell(col_w[i], 7, h, border=1, align=align, fill=True)
    pdf.ln()

    # Rows
    pdf.set_font('Helvetica', '', 8)
    fill = False
    pdf.set_fill_color(248, 248, 248)
    for tx in data['transactions']:
        pdf.cell(col_w[0], 6, tx[0], border=1, fill=fill)
        pdf.cell(col_w[1], 6, tx[1], border=1, fill=fill)
        pdf.cell(col_w[2], 6, tx[2], border=1, fill=fill)
        pdf.cell(col_w[3], 6, tx[3], border=1, align='R', fill=fill)
        pdf.cell(col_w[4], 6, tx[4], border=1, align='R', fill=fill)
        pdf.ln()
        fill = not fill

    pdf.output(filename)
    print(f'Created: {filename}')


# ============ DATA ============

finland_txs = [
    ("2025/11/14", "Brought Forward",                   "",          "",             "8,500.00 C"),
    ("2025/11/15", "POS - Helsinki Supermarket",        "POS112233", "215.40 D",     "8,284.60 C"),
    ("2025/11/18", "Bill Payment - Elisa Telecom",      "UT223344",  "89.99 D",      "8,194.61 C"),
    ("2025/11/21", "POS - Neste Gas Station",           "POS334455", "145.00 D",     "8,049.61 C"),
    ("2025/11/25", "POS - Netflix Subscription",        "POS445566", "67.06 D",      "7,982.55 C"),
    ("2025/11/28", "ATM Withdrawal - Helsinki",         "1234567",   "300.00 D",     "7,682.55 C"),
    ("2025/12/01", "Payroll - Monthly Salary Transfer", "PAY556677", "3,200.00 C",   "10,882.55 C"),
    ("2025/12/03", "Standing Order - Apartment Rent",   "RT667788",  "850.00 D",     "10,032.55 C"),
    ("2025/12/08", "POS - Prisma Retail",               "POS778899", "312.50 D",     "9,720.05 C"),
    ("2025/12/12", "POS - Apple Services",              "POS889900", "199.00 D",     "9,521.05 C"),
    ("2025/12/15", "Bill Payment - Helen Energy",       "UT990011",  "134.20 D",     "9,386.85 C"),
    ("2025/12/20", "POS - Alko Store",                  "POS001122", "58.90 D",      "9,327.95 C"),
    ("2025/12/22", "POS - Uber Ride",                   "POS112344", "22.50 D",      "9,305.45 C"),
    ("2025/12/28", "Online Transfer - Sent",            "TRF223455", "500.00 D",     "8,805.45 C"),
    ("2026/01/01", "Payroll - Monthly Salary Transfer", "PAY334566", "3,200.00 C",   "12,005.45 C"),
    ("2026/01/03", "Standing Order - Apartment Rent",   "RT445677",  "850.00 D",     "11,155.45 C"),
    ("2026/01/10", "POS - K-Market Supermarket",        "POS556788", "278.30 D",     "10,877.15 C"),
    ("2026/01/15", "Bill Payment - Elisa Telecom",      "UT667899",  "89.99 D",      "10,787.16 C"),
    ("2026/01/20", "ATM Withdrawal - Espoo",            "2345678",   "400.00 D",     "10,387.16 C"),
    ("2026/02/01", "Payroll - Monthly Salary Transfer", "PAY778900", "3,200.00 C",   "13,587.16 C"),
    ("2026/02/03", "Standing Order - Apartment Rent",   "RT889011",  "850.00 D",     "12,737.16 C"),
    ("2026/02/10", "POS - Finnair Travel",              "POS990122", "620.00 D",     "12,117.16 C"),
    ("2026/02/18", "POS - Prisma Retail",               "POS001233", "195.40 D",     "11,921.76 C"),
    ("2026/03/01", "Payroll - Monthly Salary Transfer", "PAY112344", "3,200.00 C",   "15,121.76 C"),
    ("2026/03/03", "Standing Order - Apartment Rent",   "RT223455",  "850.00 D",     "14,271.76 C"),
    ("2026/03/12", "POS - Neste Gas Station",           "POS334566", "132.00 D",     "14,139.76 C"),
    ("2026/04/01", "Payroll - Monthly Salary Transfer", "PAY445677", "3,200.00 C",   "17,339.76 C"),
    ("2026/04/03", "Standing Order - Apartment Rent",   "RT556788",  "850.00 D",     "16,489.76 C"),
    ("2026/05/01", "Payroll - Monthly Salary Transfer", "PAY667899", "3,200.00 C",   "19,689.76 C"),
    ("2026/05/15", "Online Transfer - Received",        "TRF778900", "5,000.00 C",   "24,689.76 C"),
]

venezuela_txs = [
    ("2025/11/14", "Brought Forward",                   "",          "",             "5,200.00 C"),
    ("2025/11/15", "POS - Bodegon Central",             "POS221133", "185.60 D",     "5,014.40 C"),
    ("2025/11/18", "Bill Payment - Movistar",           "UT332244",  "45.00 D",      "4,969.40 C"),
    ("2025/11/21", "POS - PDV Gas Station",             "POS443355", "95.00 D",      "4,874.40 C"),
    ("2025/11/25", "POS - Netflix Subscription",        "POS554466", "67.06 D",      "4,807.34 C"),
    ("2025/11/28", "ATM Withdrawal - Caracas",          "3456789",   "200.00 D",     "4,607.34 C"),
    ("2025/12/01", "Payroll - Monthly Salary Transfer", "PAY665577", "2,000.00 C",   "6,607.34 C"),
    ("2025/12/03", "Standing Order - Apartment Rent",   "RT776688",  "600.00 D",     "6,007.34 C"),
    ("2025/12/08", "POS - Excelsior Gama",              "POS887799", "245.80 D",     "5,761.54 C"),
    ("2025/12/12", "POS - Apple Services",              "POS998800", "199.00 D",     "5,562.54 C"),
    ("2025/12/15", "Bill Payment - Corpoelec",          "UT009911",  "88.50 D",      "5,474.04 C"),
    ("2025/12/20", "POS - Farmatodo Pharmacy",          "POS110022", "112.30 D",     "5,361.74 C"),
    ("2025/12/22", "POS - Uber Ride",                   "POS221133", "18.50 D",      "5,343.24 C"),
    ("2025/12/28", "Online Transfer - Sent",            "TRF332244", "300.00 D",     "5,043.24 C"),
    ("2026/01/01", "Payroll - Monthly Salary Transfer", "PAY443355", "2,000.00 C",   "7,043.24 C"),
    ("2026/01/03", "Standing Order - Apartment Rent",   "RT554466",  "600.00 D",     "6,443.24 C"),
    ("2026/01/10", "POS - Central Madeirense",          "POS665577", "198.70 D",     "6,244.54 C"),
    ("2026/01/15", "Bill Payment - Movistar",           "UT776688",  "45.00 D",      "6,199.54 C"),
    ("2026/01/20", "ATM Withdrawal - Valencia",         "4567890",   "300.00 D",     "5,899.54 C"),
    ("2026/02/01", "Payroll - Monthly Salary Transfer", "PAY887799", "2,000.00 C",   "7,899.54 C"),
    ("2026/02/03", "Standing Order - Apartment Rent",   "RT998800",  "600.00 D",     "7,299.54 C"),
    ("2026/02/10", "POS - Avior Airlines",              "POS009911", "420.00 D",     "6,879.54 C"),
    ("2026/02/18", "POS - Excelsior Gama",              "POS110022", "167.90 D",     "6,711.64 C"),
    ("2026/03/01", "Payroll - Monthly Salary Transfer", "PAY221133", "2,000.00 C",   "8,711.64 C"),
    ("2026/03/03", "Standing Order - Apartment Rent",   "RT332244",  "600.00 D",     "8,111.64 C"),
    ("2026/03/12", "POS - PDV Gas Station",             "POS443355", "78.00 D",      "8,033.64 C"),
    ("2026/04/01", "Payroll - Monthly Salary Transfer", "PAY554466", "2,000.00 C",   "10,033.64 C"),
    ("2026/04/03", "Standing Order - Apartment Rent",   "RT665577",  "600.00 D",     "9,433.64 C"),
    ("2026/05/01", "Payroll - Monthly Salary Transfer", "PAY776688", "2,000.00 C",   "11,433.64 C"),
    ("2026/05/15", "Online Transfer - Received",        "TRF887799", "3,500.00 C",   "14,933.64 C"),
]

vietnam_txs = [
    ("2025/11/14", "Brought Forward",                   "",          "",             "6,800.00 C"),
    ("2025/11/15", "POS - VinMart Supermarket",         "POS331144", "165.20 D",     "6,634.80 C"),
    ("2025/11/18", "Bill Payment - Viettel",            "UT442255",  "35.00 D",      "6,599.80 C"),
    ("2025/11/21", "POS - Petrolimex Gas Station",      "POS553366", "110.00 D",     "6,489.80 C"),
    ("2025/11/25", "POS - Netflix Subscription",        "POS664477", "67.06 D",      "6,422.74 C"),
    ("2025/11/28", "ATM Withdrawal - Hanoi",            "5678901",   "250.00 D",     "6,172.74 C"),
    ("2025/12/01", "Payroll - Monthly Salary Transfer", "PAY775588", "2,500.00 C",   "8,672.74 C"),
    ("2025/12/03", "Standing Order - Apartment Rent",   "RT886699",  "700.00 D",     "7,972.74 C"),
    ("2025/12/08", "POS - Big C Supermarket",           "POS997700", "289.40 D",     "7,683.34 C"),
    ("2025/12/12", "POS - Apple Services",              "POS008811", "199.00 D",     "7,484.34 C"),
    ("2025/12/15", "Bill Payment - EVN Electric",       "UT119922",  "76.80 D",      "7,407.54 C"),
    ("2025/12/20", "POS - Guardian Pharmacy",           "POS220033", "98.60 D",      "7,308.94 C"),
    ("2025/12/22", "POS - Grab Ride",                   "POS331144", "15.50 D",      "7,293.44 C"),
    ("2025/12/28", "Online Transfer - Sent",            "TRF442255", "400.00 D",     "6,893.44 C"),
    ("2026/01/01", "Payroll - Monthly Salary Transfer", "PAY553366", "2,500.00 C",   "9,393.44 C"),
    ("2026/01/03", "Standing Order - Apartment Rent",   "RT664477",  "700.00 D",     "8,693.44 C"),
    ("2026/01/10", "POS - Vincom Shopping Mall",        "POS775588", "345.60 D",     "8,347.84 C"),
    ("2026/01/15", "Bill Payment - Viettel",            "UT886699",  "35.00 D",      "8,312.84 C"),
    ("2026/01/20", "ATM Withdrawal - Ho Chi Minh",      "6789012",   "350.00 D",     "7,962.84 C"),
    ("2026/02/01", "Payroll - Monthly Salary Transfer", "PAY997700", "2,500.00 C",   "10,462.84 C"),
    ("2026/02/03", "Standing Order - Apartment Rent",   "RT008811",  "700.00 D",     "9,762.84 C"),
    ("2026/02/10", "POS - Vietnam Airlines",            "POS119922", "580.00 D",     "9,182.84 C"),
    ("2026/02/18", "POS - VinMart Supermarket",         "POS220033", "212.30 D",     "8,970.54 C"),
    ("2026/03/01", "Payroll - Monthly Salary Transfer", "PAY331144", "2,500.00 C",   "11,470.54 C"),
    ("2026/03/03", "Standing Order - Apartment Rent",   "RT442255",  "700.00 D",     "10,770.54 C"),
    ("2026/03/12", "POS - Petrolimex Gas Station",      "POS553366", "95.00 D",      "10,675.54 C"),
    ("2026/04/01", "Payroll - Monthly Salary Transfer", "PAY664477", "2,500.00 C",   "13,175.54 C"),
    ("2026/04/03", "Standing Order - Apartment Rent",   "RT775588",  "700.00 D",     "12,475.54 C"),
    ("2026/05/01", "Payroll - Monthly Salary Transfer", "PAY886699", "2,500.00 C",   "14,975.54 C"),
    ("2026/05/15", "Online Transfer - Received",        "TRF997700", "4,000.00 C",   "18,975.54 C"),
]

generate("Finland_Statement.pdf", {
    "name": "MIKAEL JUHANI VIRTANEN",
    "account_number": "01021035224104520",
    "period": "15/11/2025 TO 16/05/2026",
    "currency": "US DOLLAR",
    "branch": "VERDUN BRANCH",
    "iban": "LB65 0014 0000 0000 0102 1035 2241 0452",
    "country": "Finland",
    "transactions": finland_txs,
})

generate("Venezuela_Statement.pdf", {
    "name": "CARLOS EDUARDO RODRIGUEZ PEREZ",
    "account_number": "01021035224104521",
    "period": "15/11/2025 TO 16/05/2026",
    "currency": "US DOLLAR",
    "branch": "VERDUN BRANCH",
    "iban": "LB65 0014 0000 0000 0102 1035 2241 0453",
    "country": "Venezuela",
    "transactions": venezuela_txs,
})

generate("Vietnam_Statement.pdf", {
    "name": "NGUYEN THI HUONG GIANG",
    "account_number": "01021035224104522",
    "period": "15/11/2025 TO 16/05/2026",
    "currency": "US DOLLAR",
    "branch": "VERDUN BRANCH",
    "iban": "LB65 0014 0000 0000 0102 1035 2241 0454",
    "country": "Vietnam",
    "transactions": vietnam_txs,
})
