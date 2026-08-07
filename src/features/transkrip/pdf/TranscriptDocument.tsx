import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { formatDecimalIndonesian, formatDekanTitle, formatFakultasValue } from "@/lib/format";
import type { TranskripPdfData } from "@/services/transkrip.service";

// F4 / Folio paper (210mm x 330mm), matching the legacy print stylesheet exactly.
const PAGE_WIDTH_PT = 595.28;
const PAGE_HEIGHT_PT = 935.43;
const TOP_MARGIN_PT = 127.56; // 4.5cm, reserved for pre-printed letterhead paper

const CM_PT = 28.3465;
const PHOTO_WIDTH_PT = 3 * CM_PT;
const PHOTO_HEIGHT_PT = 4 * CM_PT;

const BORDER_WIDTH_PT = 1;
// The summary box below the table reuses these so its dividers fall on the same vertical
// lines as the "K" and "M" columns above it.
const COL_K_WIDTH_PT = 28;
const COL_M_WIDTH_PT = 36;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Courier",
    fontSize: 9,
    paddingTop: TOP_MARGIN_PT,
    paddingBottom: 56,
    paddingHorizontal: 56,
  },
  akreditasi: {
    textAlign: "center",
    marginBottom: 14,
  },
  center: {
    textAlign: "center",
  },
  title: {
    fontSize: 12,
    fontWeight: 700,
    textDecoration: "underline",
    letterSpacing: 2,
    marginBottom: 3,
  },
  noSeri: {
    fontSize: 9,
    marginBottom: 12,
  },
  bioTable: {
    marginBottom: 10,
  },
  bioRow: {
    flexDirection: "row",
    marginBottom: 1,
  },
  bioLabel: {
    width: 140,
  },
  bioSeparator: {
    width: 14,
  },
  bioValue: {
    flex: 1,
  },
  // No bottom gap: the summary box hangs straight off the table's closing edge.
  table: {
    marginBottom: 0,
  },
  tableRow: {
    flexDirection: "row",
  },
  // Ruled between columns and around the outside, but never between rows. Every cell's
  // `borderLeft` doubles as the column divider and — on the first column — as the frame's
  // left rail. The frame is built from the cells' own edges rather than a border on the
  // wrapping container because react-pdf draws a container border only on the first page
  // fragment, so a table spilling over a page break would lose its top and bottom edges.
  // The header and the closing edge are both `fixed`, which keeps each page's slice of
  // the table a fully closed box.
  tableHeaderCell: {
    borderTop: "1pt solid #000",
    borderBottom: "1pt solid #000",
    borderLeft: "1pt solid #000",
    paddingVertical: 2,
    paddingHorizontal: 3,
    fontWeight: 700,
    textAlign: "center",
  },
  tableCell: {
    borderLeft: "1pt solid #000",
    paddingVertical: 1.5,
    paddingHorizontal: 3,
  },
  tableCellLast: {
    borderRight: "1pt solid #000",
  },
  tableBottomEdge: {
    borderTop: "1pt solid #000",
  },
  colNo: { width: 26, textAlign: "center" },
  colKode: { width: 58, textAlign: "center" },
  colMataKuliah: { flex: 1 },
  colHm: { width: 30, textAlign: "center" },
  colAm: { width: 30, textAlign: "center" },
  colK: { width: COL_K_WIDTH_PT, textAlign: "center" },
  colM: { width: COL_M_WIDTH_PT, textAlign: "center" },
  summaryBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 14,
  },
  // The box sits flush under the table, so only the legend needs clearance from that rule.
  legend: {
    flex: 1,
    paddingRight: 12,
    paddingTop: 8,
  },
  // Hangs the second half of the "Angka Mutu" scale under the first, as on the printed form.
  legendIndent: {
    paddingLeft: 43,
  },
  // Pulled up by exactly the border width so its top edge lands on the table's closing
  // rule instead of stacking below it as a second, thicker-looking line. The box keeps a
  // border of its own so it still reads as closed if it is pushed onto the next page.
  summaryBox: {
    width: 250,
    marginTop: -1,
    border: "1pt solid #000",
  },
  summaryRow: {
    flexDirection: "row",
    borderBottom: "1pt solid #000",
  },
  summaryRowLast: {
    flexDirection: "row",
  },
  summaryLabel: {
    flex: 1,
    paddingVertical: 3,
    paddingHorizontal: 5,
  },
  summarySks: {
    width: COL_K_WIDTH_PT,
    borderLeft: "1pt solid #000",
    paddingVertical: 3,
    paddingHorizontal: 5,
    textAlign: "center",
  },
  // One border narrower than the M column it lines up under: the box's own right border
  // stands in for this cell's, so the shared edge is not counted twice.
  summaryBobot: {
    width: COL_M_WIDTH_PT - BORDER_WIDTH_PT,
    borderLeft: "1pt solid #000",
    paddingVertical: 3,
    paddingHorizontal: 5,
    textAlign: "center",
  },
  // Spans the K and M columns at once, so its left divider lands on the K column's.
  summaryIpk: {
    width: COL_K_WIDTH_PT + COL_M_WIDTH_PT - BORDER_WIDTH_PT,
    borderLeft: "1pt solid #000",
    paddingVertical: 3,
    paddingHorizontal: 5,
    textAlign: "center",
  },
  thesisRow: {
    flexDirection: "row",
    marginBottom: 18,
  },
  thesisLabel: {
    width: 90,
  },
  thesisValue: {
    flex: 1,
    textAlign: "justify",
  },
  signatureArea: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  // Empty frame sized for a physical 3x4 photo to be affixed after printing.
  photoBox: {
    width: PHOTO_WIDTH_PT,
    height: PHOTO_HEIGHT_PT,
    border: "1pt solid #000",
    marginLeft: 150,
    marginTop: 10,
  },
  signatureBlock: {
    width: 240,
    textAlign: "center",
  },
  // Blank space reserved for the wet-ink signature and stamp (legacy used a 91px gap).
  signatureSpace: {
    height: 91,
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

/** Single centred header line, e.g. "Terakreditasi Unggul berdasarkan SK BAN-PT Nomor : 2533/...". */
function formatAkreditasiLine({
  akreditasiLabel,
  akreditasiNoSk,
}: TranskripPdfData["biodata"]): string {
  const label = `Terakreditasi ${akreditasiLabel}`;
  return akreditasiNoSk ? `${label} berdasarkan SK BAN-PT Nomor : ${akreditasiNoSk}` : label;
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
        {watermarkText ? (
          <Text style={styles.watermark} fixed>
            {watermarkText}
          </Text>
        ) : null}

        <Text style={styles.akreditasi}>{formatAkreditasiLine(biodata)}</Text>

        <View style={styles.center}>
          <Text style={styles.title}>TRANSKRIP AKADEMIK</Text>
          <Text style={styles.noSeri}>Nomor : {data.noSeri ?? "-"}</Text>
        </View>

        <View style={styles.bioTable}>
          <BioRow label="Nama" value={biodata.nama} />
          <BioRow label="Tempat, Tanggal Lahir" value={biodata.tempatTanggalLahir} />
          <BioRow label="Nomor Induk Mahasiswa" value={biodata.npm} />
          <BioRow label="Program Pendidikan" value={biodata.programPendidikan} />
          <BioRow label="Fakultas" value={formatFakultasValue(biodata.fakultas)} />
          <BioRow label="Program Studi" value={biodata.programStudi} />
          {biodata.konsentrasi ? <BioRow label="Konsentrasi" value={biodata.konsentrasi} /> : null}
          <BioRow label="Tanggal Kelulusan" value={biodata.tanggalLulus} />
          <BioRow label="Nomor Ijazah" value={biodata.noIjazah} />
        </View>

        <View style={styles.table}>
          {/* `fixed` repeats the header at the top of every page the table spills onto. */}
          <View style={styles.tableRow} fixed>
            <Text style={[styles.tableHeaderCell, styles.colNo]}>NO</Text>
            <Text style={[styles.tableHeaderCell, styles.colKode]}>KODE MK</Text>
            <Text style={[styles.tableHeaderCell, styles.colMataKuliah]}>MATA KULIAH</Text>
            <Text style={[styles.tableHeaderCell, styles.colHm]}>HM</Text>
            <Text style={[styles.tableHeaderCell, styles.colAm]}>AM</Text>
            <Text style={[styles.tableHeaderCell, styles.colK]}>K</Text>
            <Text style={[styles.tableHeaderCell, styles.tableCellLast, styles.colM]}>M</Text>
          </View>
          {data.courses.map((course, index) => (
            <View style={styles.tableRow} key={`${course.kodeMatakuliah}-${index}`} wrap={false}>
              <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colKode]}>{course.kodeMatakuliah}</Text>
              <Text style={[styles.tableCell, styles.colMataKuliah]}>{course.namaMatakuliah}</Text>
              <Text style={[styles.tableCell, styles.colHm]}>{course.hurufMutu}</Text>
              <Text style={[styles.tableCell, styles.colAm]}>{formatNumber(course.angkaMutu)}</Text>
              <Text style={[styles.tableCell, styles.colK]}>{formatNumber(course.sks)}</Text>
              <Text style={[styles.tableCell, styles.tableCellLast, styles.colM]}>
                {formatNumber(course.bobotSks)}
              </Text>
            </View>
          ))}
          {/* `fixed` closes the frame on every page: at the page foot where the table is
              cut off, and directly under the last course on the final page. */}
          <View style={styles.tableBottomEdge} fixed />
        </View>

        <View style={styles.summaryBlock} wrap={false}>
          <View style={styles.legend}>
            <Text>Keterangan :</Text>
            <Text>HM : Huruf Mutu (A, B, C, D, E, F)</Text>
            <Text>AM : Angka Mutu (A = 4, B = 3, C = 2</Text>
            <Text style={styles.legendIndent}>D = 1, E = F = 0)</Text>
            <Text>{"K  : Kredit (SKS)"}</Text>
            <Text>{"M  : AM x K"}</Text>
          </View>
          <View style={styles.summaryBox}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Jumlah</Text>
              <Text style={styles.summarySks}>{formatNumber(data.totalSks)}</Text>
              <Text style={styles.summaryBobot}>{formatNumber(data.totalBobotNilai)}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Indeks Prestasi Kumulatif</Text>
              <Text style={styles.summaryIpk}>{formatDecimalIndonesian(data.ipk, 2)}</Text>
            </View>
            <View style={styles.summaryRowLast}>
              <Text style={styles.summaryLabel}>Predikat : {data.predikat}</Text>
            </View>
          </View>
        </View>

        <View style={styles.thesisRow} wrap={false}>
          <Text style={styles.thesisLabel}>Judul Skripsi:</Text>
          <Text style={styles.thesisValue}>{data.judulSkripsi ?? "-"}</Text>
        </View>

        <View style={styles.signatureArea} wrap={false}>
          <View style={styles.photoBox} />
          <View style={styles.signatureBlock}>
            <Text>Palembang, {data.tanggalCetak}</Text>
            <Text>{formatDekanTitle(biodata.fakultas)},</Text>
            <View style={styles.signatureSpace} />
            <Text>{biodata.dekanNama || "-"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
