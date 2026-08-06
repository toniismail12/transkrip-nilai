import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 24,
    fontSize: 8,
    fontFamily: "Helvetica",
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 9,
    color: "#555555",
    marginBottom: 12,
  },
  table: {
    display: "flex",
    flexDirection: "column",
    borderTop: "1pt solid #cccccc",
    borderLeft: "1pt solid #cccccc",
  },
  row: {
    flexDirection: "row",
  },
  headerRow: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
  },
  cell: {
    borderRight: "1pt solid #cccccc",
    borderBottom: "1pt solid #cccccc",
    padding: 4,
  },
  headerCell: {
    borderRight: "1pt solid #cccccc",
    borderBottom: "1pt solid #cccccc",
    padding: 4,
    fontWeight: 700,
  },
});

const COLUMNS = [
  { key: "no", label: "No", width: "4%" },
  { key: "npm", label: "NPM", width: "12%" },
  { key: "nama", label: "Nama", width: "20%" },
  { key: "fakultas", label: "Fakultas", width: "20%" },
  { key: "programStudi", label: "Program Studi", width: "18%" },
  { key: "tahunMasuk", label: "Angkatan", width: "10%" },
  { key: "statusCetak", label: "Status Cetak", width: "16%" },
] as const;

export interface MahasiswaListPdfRow {
  npm: string;
  nama: string;
  fakultas: string;
  programStudi: string;
  tahunMasuk: number;
  statusCetak: string;
}

interface MahasiswaListPdfProps {
  rows: MahasiswaListPdfRow[];
  generatedAt: string;
}

export function MahasiswaListPdf({ rows, generatedAt }: MahasiswaListPdfProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <Text style={styles.title}>Daftar Mahasiswa</Text>
        <Text style={styles.subtitle}>
          Dicetak pada {generatedAt} · Total {rows.length} data
        </Text>

        <View style={styles.table}>
          <View style={styles.headerRow} fixed>
            {COLUMNS.map((column) => (
              <Text key={column.key} style={[styles.headerCell, { width: column.width }]}>
                {column.label}
              </Text>
            ))}
          </View>

          {rows.map((row, index) => (
            <View style={styles.row} key={`${row.npm}-${index}`} wrap={false}>
              <Text style={[styles.cell, { width: COLUMNS[0].width }]}>{index + 1}</Text>
              <Text style={[styles.cell, { width: COLUMNS[1].width }]}>{row.npm}</Text>
              <Text style={[styles.cell, { width: COLUMNS[2].width }]}>{row.nama}</Text>
              <Text style={[styles.cell, { width: COLUMNS[3].width }]}>{row.fakultas}</Text>
              <Text style={[styles.cell, { width: COLUMNS[4].width }]}>{row.programStudi}</Text>
              <Text style={[styles.cell, { width: COLUMNS[5].width }]}>{row.tahunMasuk}</Text>
              <Text style={[styles.cell, { width: COLUMNS[6].width }]}>{row.statusCetak}</Text>
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
