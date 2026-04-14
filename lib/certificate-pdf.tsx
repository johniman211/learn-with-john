import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  renderToBuffer,
} from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#FFFFFF",
    padding: 0,
  },
  border: {
    margin: 20,
    padding: 40,
    borderWidth: 3,
    borderColor: "#1D6FF2",
    borderStyle: "solid",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerBorder: {
    borderWidth: 1,
    borderColor: "#F5A623",
    borderStyle: "solid",
    padding: 40,
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  brandName: {
    fontSize: 14,
    color: "#1D6FF2",
    letterSpacing: 4,
    marginBottom: 20,
    fontWeight: "bold",
  },
  title: {
    fontSize: 36,
    color: "#0A1628",
    marginBottom: 8,
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 30,
  },
  presentedTo: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
    letterSpacing: 2,
  },
  studentName: {
    fontSize: 28,
    color: "#0A1628",
    marginBottom: 20,
    fontWeight: "bold",
  },
  completionText: {
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
    textAlign: "center",
  },
  courseName: {
    fontSize: 18,
    color: "#1D6FF2",
    marginBottom: 30,
    fontWeight: "bold",
    textAlign: "center",
  },
  divider: {
    width: 80,
    height: 2,
    backgroundColor: "#1D6FF2",
    marginBottom: 20,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 20,
  },
  footerCol: {
    alignItems: "center",
    flex: 1,
  },
  footerLabel: {
    fontSize: 8,
    color: "#999",
    letterSpacing: 1,
    marginBottom: 4,
  },
  footerValue: {
    fontSize: 10,
    color: "#333",
  },
  certId: {
    fontSize: 8,
    color: "#bbb",
    marginTop: 20,
  },
});

interface CertificateDocProps {
  studentName: string;
  courseName: string;
  issueDate: string;
  uniqueCode: string;
}

export async function generateCertificateBuffer(props: CertificateDocProps): Promise<Buffer> {
  const doc = <CertificateDoc {...props} />;
  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}

export function CertificateDoc({
  studentName,
  courseName,
  issueDate,
  uniqueCode,
}: CertificateDocProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.border}>
          <View style={styles.innerBorder}>
            <Text style={styles.brandName}>LEARN WITH JOHN</Text>
            <Text style={styles.title}>Certificate of Completion</Text>
            <Text style={styles.subtitle}>
              South Sudan&apos;s Digital Skills Platform
            </Text>

            <View style={styles.divider} />

            <Text style={styles.presentedTo}>THIS IS PRESENTED TO</Text>
            <Text style={styles.studentName}>{studentName}</Text>

            <Text style={styles.completionText}>
              for successfully completing the course
            </Text>
            <Text style={styles.courseName}>{courseName}</Text>

            <View style={styles.footer}>
              <View style={styles.footerCol}>
                <Text style={styles.footerLabel}>DATE</Text>
                <Text style={styles.footerValue}>{issueDate}</Text>
              </View>
              <View style={styles.footerCol}>
                <Text style={styles.footerLabel}>INSTRUCTOR</Text>
                <Text style={styles.footerValue}>John</Text>
              </View>
              <View style={styles.footerCol}>
                <Text style={styles.footerLabel}>CERTIFICATE ID</Text>
                <Text style={styles.footerValue}>{uniqueCode}</Text>
              </View>
            </View>

            <Text style={styles.certId}>
              Verify at learnwithjohn.com/verify/{uniqueCode}
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
