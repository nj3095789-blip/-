"""Generate bank statement PDFs using raw PDF syntax for maximum compatibility."""

def pdf_str(s):
    return s.replace('\\','\\\\').replace('(','\\(').replace(')','\\)').replace('\r','\\r')

class RawPDF:
    def __init__(self, width=595, height=842):
        self.W = width
        self.H = height
        self._objs = []
        self._pages = []
        self._streams = []

    def _add_obj(self, content):
        self._objs.append(content)
        return len(self._objs)  # 1-based

    def build(self, filename, pages_content):
        """pages_content: list of strings (PDF stream commands per page)"""
        buf = []
        offsets = []

        header = b'%PDF-1.4\n%\xe2\xe3\xcf\xd3\n'
        buf.append(header)
        pos = len(header)

        obj_offsets = {}

        # obj 1: catalog (will reference pages obj 2)
        # obj 2: pages
        # obj 3: font Helvetica
        # obj 4: font Helvetica-Bold
        # obj 5+: page content streams
        # obj 5+n: page objects

        def write_obj(n, content_bytes):
            nonlocal pos
            obj_offsets[n] = pos
            chunk = f'{n} 0 obj\n'.encode() + content_bytes + b'\nendobj\n'
            buf.append(chunk)
            pos += len(chunk)

        n_pages = len(pages_content)

        # Font objects: 3=Helvetica, 4=Helvetica-Bold, 5=Helvetica-Oblique
        font_objs = {
            3: b'<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica\n/Encoding /WinAnsiEncoding\n>>',
            4: b'<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica-Bold\n/Encoding /WinAnsiEncoding\n>>',
            5: b'<<\n/Type /Font\n/Subtype /Type1\n/BaseFont /Helvetica-Oblique\n/Encoding /WinAnsiEncoding\n>>',
        }

        # Content stream objects start at 6, page objects at 6+n_pages
        content_obj_start = 6
        page_obj_start = 6 + n_pages

        # Pages array
        page_obj_refs = ' '.join(f'{page_obj_start+i} 0 R' for i in range(n_pages))

        obj_data = {}
        obj_data[1] = f'<<\n/Type /Catalog\n/Pages 2 0 R\n>>'.encode()
        obj_data[2] = f'<<\n/Type /Pages\n/Kids [{page_obj_refs}]\n/Count {n_pages}\n>>'.encode()
        obj_data[3] = font_objs[3]
        obj_data[4] = font_objs[4]
        obj_data[5] = font_objs[5]

        for i, stream_cmds in enumerate(pages_content):
            stream_bytes = stream_cmds.encode('latin-1')
            stream_len = len(stream_bytes)
            obj_data[content_obj_start + i] = (
                f'<<\n/Length {stream_len}\n>>\nstream\n'.encode()
                + stream_bytes
                + b'\nendstream'
            )
            obj_data[page_obj_start + i] = (
                f'<<\n/Type /Page\n/Parent 2 0 R\n'
                f'/MediaBox [0 0 {self.W} {self.H}]\n'
                f'/Contents {content_obj_start+i} 0 R\n'
                f'/Resources <<\n'
                f'  /Font <<\n'
                f'    /F1 3 0 R\n'
                f'    /F2 4 0 R\n'
                f'    /F3 5 0 R\n'
                f'  >>\n'
                f'>>\n'
                f'>>'
            ).encode()

        total_objs = max(obj_data.keys())

        for n in range(1, total_objs + 1):
            write_obj(n, obj_data[n])

        # xref
        xref_pos = pos
        xref = f'xref\n0 {total_objs+1}\n'
        xref += '0000000000 65535 f \n'
        for n in range(1, total_objs+1):
            xref += f'{obj_offsets[n]:010d} 00000 n \n'
        trailer = (
            f'trailer\n<<\n/Size {total_objs+1}\n/Root 1 0 R\n>>\n'
            f'startxref\n{xref_pos}\n%%EOF\n'
        )
        buf.append(xref.encode())
        buf.append(trailer.encode())

        with open(filename, 'wb') as f:
            for chunk in buf:
                f.write(chunk)
        print(f'Created: {filename}  ({sum(len(b) for b in buf)} bytes)')


def pt(mm): return mm * 2.8346


def make_statement(data):
    """Return a list of PDF stream command strings (one per page)."""
    W, H = 595, 842
    m = pt(15)   # margin
    rows_per_page = 38

    def rj(text, x_right, y, size=8, bold=False):
        """right-justified text"""
        font = '/F2' if bold else '/F1'
        return f'BT {font} {size} Tf {x_right} {y} Td ({pdf_str(text)}) Tj ET\n'

    def lj(text, x, y, size=8, bold=False):
        font = '/F2' if bold else '/F1'
        return f'BT {font} {size} Tf {x} {y} Td ({pdf_str(text)}) Tj ET\n'

    pages = []
    txs = data['transactions']

    # Split into pages
    first_page_rows = rows_per_page
    chunks = [txs[:first_page_rows]]
    rest = txs[first_page_rows:]
    while rest:
        chunks.append(rest[:rows_per_page])
        rest = rest[rows_per_page:]

    total_pages = len(chunks)

    for page_num, chunk in enumerate(chunks):
        s = []
        y = H - m

        if page_num == 0:
            # ---- Bank name ----
            s.append(f'BT /F2 14 Tf {m} {y-10} Td (BLOM BANK SAL) Tj ET\n')
            # right side header info
            info_lines = [
                'Capital L.L. 3,000,000,000,000',
                'R.C.B: 24783 - List of Banks: 14',
                'Head Office: Beirut, Lebanon',
                'Date of issue: 16/05/2026',
            ]
            # approximate right-align at x=580
            for ii, line in enumerate(info_lines):
                s.append(f'BT /F1 8 Tf {W-m-200} {y-10-ii*12} Td ({pdf_str(line)}) Tj ET\n')

            # divider line
            s.append(f'{m} {y-28} m {W-m} {y-28} l S\n')

            # Title
            s.append(f'BT /F2 16 Tf 195 {y-48} Td (STATEMENT OF ACCOUNT) Tj ET\n')

            # Account info
            yi = y - 65
            fields = [
                ('Name:', data['name'], 'Account Number:', data['account']),
                ('Period:', data['period'], 'Currency:', data['currency']),
                ('Branch:', data['branch'], 'IBAN:', data['iban']),
            ]
            for lbl1, val1, lbl2, val2 in fields:
                s.append(f'BT /F2 9 Tf {m} {yi} Td ({lbl1}) Tj ET\n')
                s.append(f'BT /F1 9 Tf {m+60} {yi} Td ({pdf_str(val1)}) Tj ET\n')
                s.append(f'BT /F2 9 Tf {pt(115)} {yi} Td ({lbl2}) Tj ET\n')
                s.append(f'BT /F1 9 Tf {pt(143)} {yi} Td ({pdf_str(val2)}) Tj ET\n')
                yi -= 14

            table_top = yi - 8
        else:
            table_top = H - m - 20

        # ---- Table header ----
        # column x positions (points)
        cx = [m, m+78, m+78+198, m+78+198+80, m+78+198+80+54]
        cw = [78, 198, 80, 54, 76]

        # gray rect for header
        s.append(f'0.85 0.85 0.85 rg\n')
        s.append(f'{cx[0]} {table_top-18} {sum(cw)} 18 re f\n')
        s.append(f'0 0 0 rg\n')

        hdrs = ['Date', 'Description', 'Document', 'Transaction', 'Balance']
        for i, h in enumerate(hdrs):
            if i >= 3:
                # right align (approximate)
                s.append(f'BT /F2 8.5 Tf {cx[i]+cw[i]-4} {table_top-13} Td ({h}) Tj ET\n')
            else:
                s.append(f'BT /F2 8.5 Tf {cx[i]+3} {table_top-13} Td ({h}) Tj ET\n')

        # header border
        s.append(f'0.6 0.6 0.6 RG\n')
        s.append(f'{cx[0]} {table_top-18} {sum(cw)} 18 re S\n')

        # vertical lines for header
        x_cur = cx[0]
        for w in cw[:-1]:
            x_cur += w
            s.append(f'{x_cur} {table_top-18} m {x_cur} {table_top} l S\n')

        # ---- Transaction rows ----
        row_h = 14
        yr = table_top - 18

        for ri, tx in enumerate(chunk):
            fill = (ri % 2 == 1)
            if fill:
                s.append(f'0.96 0.96 0.96 rg\n')
                s.append(f'{cx[0]} {yr-row_h} {sum(cw)} {row_h} re f\n')
                s.append(f'0 0 0 rg\n')

            s.append(f'BT /F1 8 Tf {cx[0]+3} {yr-10} Td ({tx[0]}) Tj ET\n')
            s.append(f'BT /F1 8 Tf {cx[1]+3} {yr-10} Td ({pdf_str(tx[1])}) Tj ET\n')
            s.append(f'BT /F1 8 Tf {cx[2]+3} {yr-10} Td ({tx[2]}) Tj ET\n')
            s.append(f'BT /F1 8 Tf {cx[3]+3} {yr-10} Td ({tx[3]}) Tj ET\n')
            s.append(f'BT /F1 8 Tf {cx[4]+3} {yr-10} Td ({tx[4]}) Tj ET\n')

            # row bottom line
            s.append(f'0.75 0.75 0.75 RG\n')
            s.append(f'{cx[0]} {yr-row_h} m {cx[0]+sum(cw)} {yr-row_h} l S\n')

            yr -= row_h

        # outer border around table
        s.append(f'0.5 0.5 0.5 RG\n')
        table_height = (table_top) - yr
        s.append(f'{cx[0]} {yr} {sum(cw)} {table_height} re S\n')

        # ---- Footer ----
        s.append(f'BT /F3 8 Tf {m} 55 Td (Except Errors or Omissions) Tj ET\n')
        s.append(f'BT /F1 7.5 Tf 60 40 Td (This statement will be considered confirmed unless you notify the bank within fifteen days from delivery.) Tj ET\n')
        s.append(f'BT /F1 7.5 Tf 90 28 Td (For any claims or inquiries, please contact the call center: \\(961-1\\) 758000) Tj ET\n')
        s.append(f'BT /F1 8 Tf 270 15 Td (Page {page_num+1} of {total_pages}) Tj ET\n')

        pages.append(''.join(s))

    return pages


def generate(filename, data):
    pdf = RawPDF()
    pages = make_statement(data)
    pdf.build(filename, pages)


txs_fi = [
    ('2025/11/14', 'Brought Forward',                   '',          '',             '8,500.00 C'),
    ('2025/11/15', 'POS - Helsinki Supermarket',        'POS112233', '215.40 D',     '8,284.60 C'),
    ('2025/11/18', 'Bill Payment - Elisa Telecom',      'UT223344',  '89.99 D',      '8,194.61 C'),
    ('2025/11/21', 'POS - Neste Gas Station',           'POS334455', '145.00 D',     '8,049.61 C'),
    ('2025/11/25', 'POS - Netflix Subscription',        'POS445566', '67.06 D',      '7,982.55 C'),
    ('2025/11/28', 'ATM Withdrawal - Helsinki',         '1234567',   '300.00 D',     '7,682.55 C'),
    ('2025/12/01', 'Payroll - Monthly Salary Transfer', 'PAY556677', '3,200.00 C',   '10,882.55 C'),
    ('2025/12/03', 'Standing Order - Apartment Rent',   'RT667788',  '850.00 D',     '10,032.55 C'),
    ('2025/12/08', 'POS - Prisma Retail',               'POS778899', '312.50 D',     '9,720.05 C'),
    ('2025/12/12', 'POS - Apple Services',              'POS889900', '199.00 D',     '9,521.05 C'),
    ('2025/12/15', 'Bill Payment - Helen Energy',       'UT990011',  '134.20 D',     '9,386.85 C'),
    ('2025/12/20', 'POS - Alko Store',                  'POS001122', '58.90 D',      '9,327.95 C'),
    ('2025/12/22', 'POS - Uber Ride',                   'POS112344', '22.50 D',      '9,305.45 C'),
    ('2025/12/28', 'Online Transfer - Sent',            'TRF223455', '500.00 D',     '8,805.45 C'),
    ('2026/01/01', 'Payroll - Monthly Salary Transfer', 'PAY334566', '3,200.00 C',   '12,005.45 C'),
    ('2026/01/03', 'Standing Order - Apartment Rent',   'RT445677',  '850.00 D',     '11,155.45 C'),
    ('2026/01/10', 'POS - K-Market Supermarket',        'POS556788', '278.30 D',     '10,877.15 C'),
    ('2026/01/15', 'Bill Payment - Elisa Telecom',      'UT667899',  '89.99 D',      '10,787.16 C'),
    ('2026/01/20', 'ATM Withdrawal - Espoo',            '2345678',   '400.00 D',     '10,387.16 C'),
    ('2026/02/01', 'Payroll - Monthly Salary Transfer', 'PAY778900', '3,200.00 C',   '13,587.16 C'),
    ('2026/02/03', 'Standing Order - Apartment Rent',   'RT889011',  '850.00 D',     '12,737.16 C'),
    ('2026/02/10', 'POS - Finnair Travel',              'POS990122', '620.00 D',     '12,117.16 C'),
    ('2026/02/18', 'POS - Prisma Retail',               'POS001233', '195.40 D',     '11,921.76 C'),
    ('2026/03/01', 'Payroll - Monthly Salary Transfer', 'PAY112344', '3,200.00 C',   '15,121.76 C'),
    ('2026/03/03', 'Standing Order - Apartment Rent',   'RT223455',  '850.00 D',     '14,271.76 C'),
    ('2026/03/12', 'POS - Neste Gas Station',           'POS334566', '132.00 D',     '14,139.76 C'),
    ('2026/04/01', 'Payroll - Monthly Salary Transfer', 'PAY445677', '3,200.00 C',   '17,339.76 C'),
    ('2026/04/03', 'Standing Order - Apartment Rent',   'RT556788',  '850.00 D',     '16,489.76 C'),
    ('2026/05/01', 'Payroll - Monthly Salary Transfer', 'PAY667899', '3,200.00 C',   '19,689.76 C'),
    ('2026/05/15', 'Online Transfer - Received',        'TRF778900', '5,000.00 C',   '24,689.76 C'),
]
txs_ve = [
    ('2025/11/14', 'Brought Forward',                   '',          '',             '5,200.00 C'),
    ('2025/11/15', 'POS - Bodegon Central',             'POS221133', '185.60 D',     '5,014.40 C'),
    ('2025/11/18', 'Bill Payment - Movistar',           'UT332244',  '45.00 D',      '4,969.40 C'),
    ('2025/11/21', 'POS - PDV Gas Station',             'POS443355', '95.00 D',      '4,874.40 C'),
    ('2025/11/25', 'POS - Netflix Subscription',        'POS554466', '67.06 D',      '4,807.34 C'),
    ('2025/11/28', 'ATM Withdrawal - Caracas',          '3456789',   '200.00 D',     '4,607.34 C'),
    ('2025/12/01', 'Payroll - Monthly Salary Transfer', 'PAY665577', '2,000.00 C',   '6,607.34 C'),
    ('2025/12/03', 'Standing Order - Apartment Rent',   'RT776688',  '600.00 D',     '6,007.34 C'),
    ('2025/12/08', 'POS - Excelsior Gama',              'POS887799', '245.80 D',     '5,761.54 C'),
    ('2025/12/12', 'POS - Apple Services',              'POS998800', '199.00 D',     '5,562.54 C'),
    ('2025/12/15', 'Bill Payment - Corpoelec',          'UT009911',  '88.50 D',      '5,474.04 C'),
    ('2025/12/20', 'POS - Farmatodo Pharmacy',          'POS110022', '112.30 D',     '5,361.74 C'),
    ('2025/12/22', 'POS - Uber Ride',                   'POS221133', '18.50 D',      '5,343.24 C'),
    ('2025/12/28', 'Online Transfer - Sent',            'TRF332244', '300.00 D',     '5,043.24 C'),
    ('2026/01/01', 'Payroll - Monthly Salary Transfer', 'PAY443355', '2,000.00 C',   '7,043.24 C'),
    ('2026/01/03', 'Standing Order - Apartment Rent',   'RT554466',  '600.00 D',     '6,443.24 C'),
    ('2026/01/10', 'POS - Central Madeirense',          'POS665577', '198.70 D',     '6,244.54 C'),
    ('2026/01/15', 'Bill Payment - Movistar',           'UT776688',  '45.00 D',      '6,199.54 C'),
    ('2026/01/20', 'ATM Withdrawal - Valencia',         '4567890',   '300.00 D',     '5,899.54 C'),
    ('2026/02/01', 'Payroll - Monthly Salary Transfer', 'PAY887799', '2,000.00 C',   '7,899.54 C'),
    ('2026/02/03', 'Standing Order - Apartment Rent',   'RT998800',  '600.00 D',     '7,299.54 C'),
    ('2026/02/10', 'POS - Avior Airlines',              'POS009911', '420.00 D',     '6,879.54 C'),
    ('2026/02/18', 'POS - Excelsior Gama',              'POS110022', '167.90 D',     '6,711.64 C'),
    ('2026/03/01', 'Payroll - Monthly Salary Transfer', 'PAY221133', '2,000.00 C',   '8,711.64 C'),
    ('2026/03/03', 'Standing Order - Apartment Rent',   'RT332244',  '600.00 D',     '8,111.64 C'),
    ('2026/03/12', 'POS - PDV Gas Station',             'POS443355', '78.00 D',      '8,033.64 C'),
    ('2026/04/01', 'Payroll - Monthly Salary Transfer', 'PAY554466', '2,000.00 C',   '10,033.64 C'),
    ('2026/04/03', 'Standing Order - Apartment Rent',   'RT665577',  '600.00 D',     '9,433.64 C'),
    ('2026/05/01', 'Payroll - Monthly Salary Transfer', 'PAY776688', '2,000.00 C',   '11,433.64 C'),
    ('2026/05/15', 'Online Transfer - Received',        'TRF887799', '3,500.00 C',   '14,933.64 C'),
]
txs_vn = [
    ('2025/11/14', 'Brought Forward',                   '',          '',             '6,800.00 C'),
    ('2025/11/15', 'POS - VinMart Supermarket',         'POS331144', '165.20 D',     '6,634.80 C'),
    ('2025/11/18', 'Bill Payment - Viettel',            'UT442255',  '35.00 D',      '6,599.80 C'),
    ('2025/11/21', 'POS - Petrolimex Gas Station',      'POS553366', '110.00 D',     '6,489.80 C'),
    ('2025/11/25', 'POS - Netflix Subscription',        'POS664477', '67.06 D',      '6,422.74 C'),
    ('2025/11/28', 'ATM Withdrawal - Hanoi',            '5678901',   '250.00 D',     '6,172.74 C'),
    ('2025/12/01', 'Payroll - Monthly Salary Transfer', 'PAY775588', '2,500.00 C',   '8,672.74 C'),
    ('2025/12/03', 'Standing Order - Apartment Rent',   'RT886699',  '700.00 D',     '7,972.74 C'),
    ('2025/12/08', 'POS - Big C Supermarket',           'POS997700', '289.40 D',     '7,683.34 C'),
    ('2025/12/12', 'POS - Apple Services',              'POS008811', '199.00 D',     '7,484.34 C'),
    ('2025/12/15', 'Bill Payment - EVN Electric',       'UT119922',  '76.80 D',      '7,407.54 C'),
    ('2025/12/20', 'POS - Guardian Pharmacy',           'POS220033', '98.60 D',      '7,308.94 C'),
    ('2025/12/22', 'POS - Grab Ride',                   'POS331144', '15.50 D',      '7,293.44 C'),
    ('2025/12/28', 'Online Transfer - Sent',            'TRF442255', '400.00 D',     '6,893.44 C'),
    ('2026/01/01', 'Payroll - Monthly Salary Transfer', 'PAY553366', '2,500.00 C',   '9,393.44 C'),
    ('2026/01/03', 'Standing Order - Apartment Rent',   'RT664477',  '700.00 D',     '8,693.44 C'),
    ('2026/01/10', 'POS - Vincom Shopping Mall',        'POS775588', '345.60 D',     '8,347.84 C'),
    ('2026/01/15', 'Bill Payment - Viettel',            'UT886699',  '35.00 D',      '8,312.84 C'),
    ('2026/01/20', 'ATM Withdrawal - Ho Chi Minh',      '6789012',   '350.00 D',     '7,962.84 C'),
    ('2026/02/01', 'Payroll - Monthly Salary Transfer', 'PAY997700', '2,500.00 C',   '10,462.84 C'),
    ('2026/02/03', 'Standing Order - Apartment Rent',   'RT008811',  '700.00 D',     '9,762.84 C'),
    ('2026/02/10', 'POS - Vietnam Airlines',            'POS119922', '580.00 D',     '9,182.84 C'),
    ('2026/02/18', 'POS - VinMart Supermarket',         'POS220033', '212.30 D',     '8,970.54 C'),
    ('2026/03/01', 'Payroll - Monthly Salary Transfer', 'PAY331144', '2,500.00 C',   '11,470.54 C'),
    ('2026/03/03', 'Standing Order - Apartment Rent',   'RT442255',  '700.00 D',     '10,770.54 C'),
    ('2026/03/12', 'POS - Petrolimex Gas Station',      'POS553366', '95.00 D',      '10,675.54 C'),
    ('2026/04/01', 'Payroll - Monthly Salary Transfer', 'PAY664477', '2,500.00 C',   '13,175.54 C'),
    ('2026/04/03', 'Standing Order - Apartment Rent',   'RT775588',  '700.00 D',     '12,475.54 C'),
    ('2026/05/01', 'Payroll - Monthly Salary Transfer', 'PAY886699', '2,500.00 C',   '14,975.54 C'),
    ('2026/05/15', 'Online Transfer - Received',        'TRF997700', '4,000.00 C',   '18,975.54 C'),
]

generate('Finland_Statement.pdf', {
    'name': 'MIKAEL JUHANI VIRTANEN', 'account': '01021035224104520',
    'period': '15/11/2025 TO 16/05/2026', 'currency': 'US DOLLAR',
    'branch': 'VERDUN BRANCH', 'iban': 'LB65 0014 0000 0000 0102 1035 2241 0452',
    'transactions': txs_fi,
})
generate('Venezuela_Statement.pdf', {
    'name': 'CARLOS EDUARDO RODRIGUEZ PEREZ', 'account': '01021035224104521',
    'period': '15/11/2025 TO 16/05/2026', 'currency': 'US DOLLAR',
    'branch': 'VERDUN BRANCH', 'iban': 'LB65 0014 0000 0000 0102 1035 2241 0453',
    'transactions': txs_ve,
})
generate('Vietnam_Statement.pdf', {
    'name': 'NGUYEN THI HUONG GIANG', 'account': '01021035224104522',
    'period': '15/11/2025 TO 16/05/2026', 'currency': 'US DOLLAR',
    'branch': 'VERDUN BRANCH', 'iban': 'LB65 0014 0000 0000 0102 1035 2241 0454',
    'transactions': txs_vn,
})
