import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDekanTitle } from "@/lib/format";
import type { TranskripPdfData } from "@/services/transkrip.service";

// F4 / Folio paper (210mm x 330mm), matching the legacy print stylesheet exactly.
const PAGE_WIDTH_PT = 595.28;
const PAGE_HEIGHT_PT = 935.43;
const TOP_MARGIN_PT = 127.56; // 4.5cm, reserved for pre-printed letterhead paper

const styles = StyleSheet.create({
  page: {
    fontFamily: "Courier",
    fontSize: 10,
    paddingTop: TOP_MARGIN_PT,
    paddingBottom: 56,
    paddingHorizontal: 56,
  },
  center: {
    textAlign: "center",
  },
  akreditasi: {
    fontSize: 11,
    marginBottom: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textDecoration: "underline",
    marginBottom: 4,
  },
  noSeri: {
    fontSize: 10,
    marginBottom: 16,
  },
  bioTable: {
    alignSelf: "center",
    width: 380,
    marginBottom: 16,
  },
  bioRow: {
    flexDirection: "row",
    marginBottom: 2,
  },
  bioLabel: {
    width: 160,
  },
  bioSeparator: {
    width: 10,
  },
  bioValue: {
    flex: 1,
  },
  table: {
    marginBottom: 8,
  },
  tableRow: {
    flexDirection: "row",
  },
  tableHeaderCell: {
    borderTop: "1pt solid #000",
    borderBottom: "1pt solid #000",
    borderLeft: "1pt solid #000",
    padding: 3,
    fontWeight: 700,
    textAlign: "center",
  },
  tableHeaderCellLast: {
    borderTop: "1pt solid #000",
    borderBottom: "1pt solid #000",
    borderLeft: "1pt solid #000",
    borderRight: "1pt solid #000",
    padding: 3,
    fontWeight: 700,
    textAlign: "center",
  },
  tableCell: {
    borderBottom: "1pt solid #000",
    borderLeft: "1pt solid #000",
    padding: 3,
  },
  tableCellLast: {
    borderBottom: "1pt solid #000",
    borderLeft: "1pt solid #000",
    borderRight: "1pt solid #000",
    padding: 3,
  },
  colNo: { width: 28, textAlign: "center" },
  colKode: { width: 55, textAlign: "center" },
  colMataKuliah: { flex: 1 },
  colHm: { width: 32, textAlign: "center" },
  colAm: { width: 32, textAlign: "center" },
  colK: { width: 32, textAlign: "center" },
  colM: { width: 40, textAlign: "center" },
  summaryBlock: {
    flexDirection: "row",
    border: "1pt solid #000",
    marginBottom: 12,
  },
  legendCell: {
    flex: 1,
    padding: 6,
    borderRight: "1pt solid #000",
  },
  summaryRightColumn: {
    flex: 1.15,
  },
  summaryRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
    padding: 4,
  },
  summaryRowLast: {
    flexDirection: "row",
    padding: 4,
  },
  summaryLabel: {
    flex: 1,
  },
  summaryValue: {
    width: 60,
    textAlign: "right",
  },
  thesisRow: {
    marginBottom: 24,
  },
  signatureBlock: {
    alignSelf: "flex-end",
    width: 260,
    textAlign: "center",
  },
  // Blank space reserved for the physical wet-ink signature (legacy used a 91px gap),
  // with the stamp placeholder sitting inside that space rather than adding to it.
  signatureSpace: {
    height: 91,
    justifyContent: "center",
    alignItems: "flex-end",
    paddingRight: 8,
  },
  stampBox: {
    width: 70,
    height: 70,
    border: "1pt solid #000",
  },
  dekanName: {
    textDecoration: "underline",
  },
  watermark: {
    position: "absolute",
    top: PAGE_HEIGHT_PT / 2 - 40,
    left: PAGE_WIDTH_PT / 2 - 160,
    fontSize: 48,
    color: "#cc0000",
    opacity: 0.25,
    transform: "rotate(-30deg)",
  },
});

interface BioRowProps {
  label: string;
  value: string | null | undefined;
}

function BioRow({ label, value }: BioRowProps) {
  return (
    <View style={styles.bioRow}>
      <Text style={styles.bioLabel}>{label}</Text>
      <Text style={styles.bioSeparator}>:</Text>
      <Text style={styles.bioValue}>{value ?? "-"}</Text>
    </View>
  );
}

function formatNumber(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

interface TranscriptDocumentProps {
  data: TranskripPdfData;
  watermarkText?: string;
}

export function TranscriptDocument({ data, watermarkText }: TranscriptDocumentProps) {
  const { biodata } = data;

  return (
    <Document>
      <Page size={[PAGE_WIDTH_PT, PAGE_HEIGHT_PT]} style={styles.page}>
        {watermarkText ? <Text style={styles.watermark}>{watermarkText}</Text> : null}

        <View style={styles.center}>
          <Text style={styles.akreditasi}>{biodata.akreditasiLabel}</Text>
          <Text style={styles.title}>TRANSKRIP AKADEMIK</Text>
          <Text style={styles.noSeri}>Nomor: {data.noSeri ?? "-"}</Text>
        </View>

        <View style={styles.bioTable}>
          <BioRow label="Nama" value={biodata.nama} />
          <BioRow label="Tempat, Tanggal Lahir" value={biodata.tempatTanggalLahir} />
          <BioRow label="Nomor Induk Mahasiswa" value={biodata.npm} />
          <BioRow label="Program Pendidikan" value={biodata.programPendidikan} />
          <BioRow label="Fakultas" value={biodata.fakultas} />
          <BioRow label="Program Studi" value={biodata.programStudi} />
          {biodata.konsentrasi ? <BioRow label="Konsentrasi" value={biodata.konsentrasi} /> : null}
          <BioRow label="Tanggal Kelulusan" value={biodata.tanggalLulus} />
          <BioRow label="Nomor Ijazah" value={biodata.noIjazah} />
        </View>

        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>No</Text>
            <Text style={[styles.tableHeaderCell, styles.colKode]}>Kode MK</Text>
            <Text style={[styles.tableHeaderCell, styles.colMataKuliah]}>Mata Kuliah</Text>
            <Text style={[styles.tableHeaderCell, styles.colHm]}>HM</Text>
            <Text style={[styles.tableHeaderCell, styles.colAm]}>AM</Text>
            <Text style={[styles.tableHeaderCell, styles.colK]}>K</Text>
            <Text style={[styles.tableHeaderCellLast, styles.colM]}>M</Text>
          </View>
          {data.courses.map((course, index) => (
            <View style={styles.tableRow} key={`${course.kodeMatakuliah}-${index}`} wrap={false}>
              <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colKode]}>{course.kodeMatakuliah}</Text>
              <Text style={[styles.tableCell, styles.colMataKuliah]}>{course.namaMatakuliah}</Text>
              <Text style={[styles.tableCell, styles.colHm]}>{course.hurufMutu}</Text>
              <Text style={[styles.tableCell, styles.colAm]}>{formatNumber(course.angkaMutu)}</Text>
              <Text style={[styles.tableCell, styles.colK]}>{formatNumber(course.sks)}</Text>
              <Text style={[styles.tableCellLast, styles.colM]}>
                {formatNumber(course.bobotSks)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.summaryBlock} wrap={false}>
          <View style={styles.legendCell}>
            <Text>Keterangan :</Text>
            <Text>HM : Huruf Mutu (A, B, C, D, E)</Text>
            <Text>AM : Angka Mutu (A=4, B=3, C=2,</Text>
            <Text>{"       D=1, E=0)"}</Text>
            <Text>K : Kredit (SKS)</Text>
            <Text>M : AM x K</Text>
          </View>
          <View style={styles.summaryRightColumn}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Jumlah</Text>
              <Text style={styles.summaryValue}>{formatNumber(data.totalBobotNilai)}</Text>
              <Text style={styles.summaryValue}>{formatNumber(data.totalSks)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Indeks Prestasi Kumulatif</Text>
              <Text style={styles.summaryValue}>{data.ipk.toFixed(2)}</Text>
            </View>
            <View style={styles.summaryRowLast}>
              <Text style={styles.summaryLabel}>Predikat : {data.predikat}</Text>
            </View>
          </View>
        </View>

        <View style={styles.thesisRow}>
          <Text>Judul Skripsi: {data.judulSkripsi ?? "-"}</Text>
        </View>

        <View style={styles.signatureBlock} wrap={false}>
          <Text>Palembang, {biodata.tanggalSuratKeputusan ?? "-"}</Text>
          <Text>{formatDekanTitle(biodata.fakultas)},</Text>
          <View style={styles.signatureSpace}>
            <View style={styles.stampBox} />
          </View>
          <Text style={styles.dekanName}>{biodata.dekanNama || "-"}</Text>
        </View>
      </Page>
    </Document>
  );
}
